"""
Database Loader for Generated Immigration Documents.

This script loads the generated JSON documents into the database
after manual review.

Usage:
    python load_documents_to_db.py --country CAN
    python load_documents_to_db.py --all
    python load_documents_to_db.py --country CAN --dry-run
"""

import os
import sys
import json
import argparse
import logging
from pathlib import Path
from datetime import datetime

# Setup Django
sys.path.insert(0, str(Path(__file__).parent.parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'japaguide.settings')

import django
django.setup()

from django.db import transaction
from django.utils import timezone
from countries.models import Country, Source, CountryDocument

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Paths
BASE_DIR = Path(__file__).parent
GENERATED_DIR = BASE_DIR / 'generated'


class DocumentLoader:
    """Loads generated documents into the database."""
    
    def __init__(self, dry_run: bool = False):
        self.dry_run = dry_run
        if dry_run:
            logger.info("DRY RUN MODE - No changes will be saved")
    
    def _get_or_create_source(self, country: Country, agency: str, portal_url: str) -> Source:
        """Get or create a Source record for the country."""
        source, created = Source.objects.get_or_create(
            name=agency,
            country=country,
            defaults={
                'url': portal_url,
                'source_type': 'official',
                'reliability_level': 'high',
                'description': f"Official immigration portal for {country.name}",
                'last_checked': timezone.now(),
                'is_active': True,
            }
        )
        
        if created:
            logger.info(f"  Created source: {source.name}")
        else:
            # Update last_checked
            source.last_checked = timezone.now()
            if not self.dry_run:
                source.save()
        
        return source
    
    def _load_document(
        self, 
        country: Country, 
        source: Source, 
        doc_data: dict,
        doc_type: str
    ) -> bool:
        """Load or update a single document."""
        title = doc_data.get('title', f"{doc_type.title()}: {country.name}")
        content = doc_data.get('content', '')
        
        if not content:
            logger.warning(f"  Skipping {doc_type} - no content")
            return False
        
        # Check for existing document
        existing = CountryDocument.objects.filter(
            country=country,
            doc_type=doc_type,
            title=title
        ).first()
        
        if existing:
            logger.info(f"  Updating existing {doc_type} document")
            existing.content = content
            existing.source = source
            existing.data_confidence = 'high'  # From official sources
            existing.needs_review = False  # Auto-approved from official sources
            existing.updated_at = timezone.now()
            if not self.dry_run:
                existing.save()
        else:
            logger.info(f"  Creating new {doc_type} document")
            doc = CountryDocument(
                country=country,
                title=title,
                content=content,
                doc_type=doc_type,
                source=source,
                data_confidence='high',
                needs_review=False,  # Auto-approved from official sources
            )
            if not self.dry_run:
                doc.save()
        
        return True
    
    def load_country(self, country_code: str) -> dict:
        """
        Load all generated documents for a country.
        
        Returns dict with stats about what was loaded.
        """
        json_file = GENERATED_DIR / f"{country_code}.json"
        
        if not json_file.exists():
            logger.error(f"No generated file found: {json_file}")
            return {'status': 'error', 'error': 'File not found'}
        
        # Load JSON
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        country_name = data.get('country_name', country_code)
        agency = data.get('agency', '')
        portal_url = data.get('portal_url', '')
        documents = data.get('documents', {})
        
        # Get country from database
        try:
            country = Country.objects.get(code=country_code)
        except Country.DoesNotExist:
            logger.error(f"Country not found in database: {country_code}")
            return {'status': 'error', 'error': 'Country not in database'}
        
        logger.info(f"\nLoading documents for {country_name} ({country_code})")
        
        stats = {
            'country_code': country_code,
            'country_name': country_name,
            'documents_processed': 0,
            'documents_loaded': 0,
            'documents_skipped': 0,
            'errors': []
        }
        
        try:
            with transaction.atomic():
                # Create/get source
                source = self._get_or_create_source(country, agency, portal_url)
                
                # Process each document
                for doc_type, doc_data in documents.items():
                    stats['documents_processed'] += 1
                    
                    if doc_data.get('status') != 'success':
                        logger.warning(f"  Skipping {doc_type} - status: {doc_data.get('status')}")
                        stats['documents_skipped'] += 1
                        continue
                    
                    try:
                        if self._load_document(country, source, doc_data, doc_type):
                            stats['documents_loaded'] += 1
                        else:
                            stats['documents_skipped'] += 1
                    except Exception as e:
                        logger.error(f"  Error loading {doc_type}: {e}")
                        stats['errors'].append(f"{doc_type}: {str(e)}")
                
                # Update country data confidence if we loaded documents
                if stats['documents_loaded'] > 0:
                    country.data_confidence = 'high'
                    country.needs_review = True  # Still needs human review
                    if not self.dry_run:
                        country.save()
                
                if self.dry_run:
                    # Rollback the transaction in dry run mode
                    raise Exception("DRY_RUN_ROLLBACK")
                    
        except Exception as e:
            if str(e) == "DRY_RUN_ROLLBACK":
                logger.info("  (Dry run - no changes saved)")
            else:
                logger.error(f"Transaction error: {e}")
                stats['status'] = 'error'
                stats['errors'].append(str(e))
                return stats
        
        stats['status'] = 'success'
        logger.info(f"  [OK] Loaded {stats['documents_loaded']}/{stats['documents_processed']} documents")
        
        return stats
    
    def load_all_countries(self) -> dict:
        """Load documents for all countries with generated files."""
        json_files = list(GENERATED_DIR.glob('*.json'))
        # Exclude summary file
        json_files = [f for f in json_files if not f.name.startswith('_')]
        
        if not json_files:
            logger.warning("No generated document files found")
            return {'status': 'error', 'error': 'No files found'}
        
        logger.info(f"Found {len(json_files)} country files to process")
        
        all_stats = {
            'processed_at': datetime.now().isoformat(),
            'total_countries': len(json_files),
            'successful': 0,
            'failed': 0,
            'results': {}
        }
        
        for json_file in json_files:
            country_code = json_file.stem.upper()
            stats = self.load_country(country_code)
            all_stats['results'][country_code] = stats
            
            if stats.get('status') == 'success':
                all_stats['successful'] += 1
            else:
                all_stats['failed'] += 1
        
        logger.info(f"\n{'='*50}")
        logger.info(f"Loading complete: {all_stats['successful']}/{all_stats['total_countries']} successful")
        
        return all_stats


def show_status():
    """Show current status of generated documents and database."""
    logger.info("\n=== Document Status ===\n")
    
    # Check generated files
    json_files = list(GENERATED_DIR.glob('*.json'))
    json_files = [f for f in json_files if not f.name.startswith('_')]
    
    logger.info(f"Generated files: {len(json_files)}")
    for f in json_files:
        with open(f, 'r', encoding='utf-8') as fp:
            data = json.load(fp)
            docs = data.get('documents', {})
            success_count = len([d for d in docs.values() if d.get('status') == 'success'])
            logger.info(f"  {f.stem}: {success_count}/{len(docs)} documents ready")
    
    # Check database
    logger.info(f"\nDatabase documents: {CountryDocument.objects.count()}")
    
    doc_types = CountryDocument.objects.values('doc_type').distinct()
    for dt in doc_types:
        count = CountryDocument.objects.filter(doc_type=dt['doc_type']).count()
        logger.info(f"  {dt['doc_type']}: {count}")
    
    needs_review = CountryDocument.objects.filter(needs_review=True).count()
    logger.info(f"\nDocuments needing review: {needs_review}")


def main():
    parser = argparse.ArgumentParser(description='Load generated documents to database')
    parser.add_argument('--country', '-c', type=str, help='Country code (e.g., CAN)')
    parser.add_argument('--all', '-a', action='store_true', help='Load all countries')
    parser.add_argument('--dry-run', '-n', action='store_true', help='Dry run - no changes saved')
    parser.add_argument('--status', '-s', action='store_true', help='Show status of generated/loaded documents')
    
    args = parser.parse_args()
    
    if args.status:
        show_status()
        return
    
    loader = DocumentLoader(dry_run=args.dry_run)
    
    if args.all:
        loader.load_all_countries()
    elif args.country:
        loader.load_country(args.country.upper())
    else:
        parser.print_help()
        print("\nUse --status to see current state")


if __name__ == '__main__':
    main()
