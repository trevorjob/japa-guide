"""
Web Scraping + AI Document Generation Pipeline for Immigration Data.

This script:
1. Loads country source URLs from JSON
2. Scrapes web pages with proper rate limiting
3. Sends extracted content to DeepSeek API for structured document generation
4. Saves generated documents to JSON files for review before DB insertion

Usage:
    python scrape_immigration_data.py --country CAN
    python scrape_immigration_data.py --all
    python scrape_immigration_data.py --country CAN --doc-type work
"""

import os
import sys
import json
import time
import hashlib
import argparse
import logging
from pathlib import Path
from datetime import datetime
from typing import Optional
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup
from openai import OpenAI

# Setup Django
sys.path.insert(0, str(Path(__file__).parent.parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'japaguide.settings')

import django
django.setup()

from django.conf import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Paths
BASE_DIR = Path(__file__).parent
OUTPUT_DIR = BASE_DIR / 'generated'
CACHE_DIR = BASE_DIR / 'cache'

# Create directories
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# Rate limiting
REQUEST_DELAY = 2  # seconds between requests
MAX_RETRIES = 3


class WebScraper:
    """Handles web scraping with caching and rate limiting."""
    
    HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    }
    
    def __init__(self, use_cache: bool = True, cache_duration_hours: int = 24):
        self.use_cache = use_cache
        self.cache_duration = cache_duration_hours * 3600
        self.session = requests.Session()
        self.session.headers.update(self.HEADERS)
        self.last_request_time = 0
    
    def _get_cache_path(self, url: str) -> Path:
        """Generate cache file path from URL."""
        url_hash = hashlib.md5(url.encode()).hexdigest()
        return CACHE_DIR / f"{url_hash}.json"
    
    def _is_cache_valid(self, cache_path: Path) -> bool:
        """Check if cache file exists and is not expired."""
        if not cache_path.exists():
            return False
        
        cache_age = time.time() - cache_path.stat().st_mtime
        return cache_age < self.cache_duration
    
    def _rate_limit(self):
        """Enforce rate limiting between requests."""
        elapsed = time.time() - self.last_request_time
        if elapsed < REQUEST_DELAY:
            time.sleep(REQUEST_DELAY - elapsed)
        self.last_request_time = time.time()
    
    def fetch_url(self, url: str) -> Optional[str]:
        """
        Fetch URL content with caching and rate limiting.
        Returns extracted text content or None on failure.
        """
        cache_path = self._get_cache_path(url)
        
        # Check cache
        if self.use_cache and self._is_cache_valid(cache_path):
            logger.info(f"Using cached content for: {url}")
            with open(cache_path, 'r', encoding='utf-8') as f:
                cached = json.load(f)
                return cached.get('content')
        
        # Rate limit
        self._rate_limit()
        
        # Fetch
        for attempt in range(MAX_RETRIES):
            try:
                logger.info(f"Fetching: {url} (attempt {attempt + 1})")
                response = self.session.get(url, timeout=30)
                response.raise_for_status()
                
                # Parse and extract text
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Remove unwanted elements
                for tag in soup(['script', 'style', 'nav', 'footer', 'header', 'aside', 'form', 'iframe']):
                    tag.decompose()
                
                # Try to find main content
                main_content = (
                    soup.find('main') or 
                    soup.find('article') or 
                    soup.find('div', class_=['content', 'main-content', 'page-content']) or
                    soup.find('div', id=['content', 'main', 'main-content']) or
                    soup.body
                )
                
                if main_content:
                    # Get text with better formatting
                    text = self._extract_text(main_content)
                else:
                    text = soup.get_text(separator='\n', strip=True)
                
                # Cache the result
                cache_data = {
                    'url': url,
                    'fetched_at': datetime.now().isoformat(),
                    'content': text
                }
                with open(cache_path, 'w', encoding='utf-8') as f:
                    json.dump(cache_data, f, ensure_ascii=False, indent=2)
                
                return text
                
            except requests.RequestException as e:
                logger.warning(f"Request failed for {url}: {e}")
                if attempt < MAX_RETRIES - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                    
        logger.error(f"Failed to fetch {url} after {MAX_RETRIES} attempts")
        return None
    
    def _extract_text(self, element) -> str:
        """Extract text with better formatting from BeautifulSoup element."""
        texts = []
        
        for child in element.descendants:
            if child.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                texts.append(f"\n## {child.get_text(strip=True)}\n")
            elif child.name == 'p':
                text = child.get_text(strip=True)
                if text:
                    texts.append(text + '\n')
            elif child.name == 'li':
                text = child.get_text(strip=True)
                if text:
                    texts.append(f"• {text}")
            elif child.name in ['br']:
                texts.append('\n')
        
        return '\n'.join(texts)


class DocumentGenerator:
    """Uses DeepSeek API to generate structured immigration documents."""
    
    DOC_TYPE_PROMPTS = {
        'overview': """Create a comprehensive immigration overview document for {country_name}.

Based on the following official source content, generate a well-structured document covering:

1. **Overview** (2-3 paragraphs about the country as an immigration destination)
2. **Main Immigration Pathways** (work, study, family, investment if applicable)
3. **Who This Country Is Suitable For** (3-5 profiles)
4. **Known Challenges** (2-4 key challenges)
5. **Important Notes** (disclaimers about changing rules)

RULES:
- Only include information that can be verified from the source content
- Use uncertainty language: "may", "typically", "subject to change"
- Do NOT invent specific numbers, fees, or processing times
- If information is unclear or missing, say "verify with official sources"
- Keep tone informative but cautious

SOURCE CONTENT:
{source_content}

Generate the document in Markdown format.""",

        'work': """Create a work visa information document for {country_name}.

Based on the following official source content, generate a structured document covering:

1. **Work Visa Overview** (brief introduction)
2. **Main Work Visa Categories** (list each type with requirements)
3. **Eligibility Factors** (what affects approval)
4. **Application Process Overview** (high-level steps)
5. **Important Considerations** (sponsorship, restrictions, etc.)
6. **Disclaimer** (about changing requirements)

RULES:
- Only include visa types mentioned in the source
- Do NOT invent processing times or success rates
- Use phrases like "requirements may include" and "typically requires"
- Acknowledge that requirements change frequently
- Include a note to verify with official embassy

SOURCE CONTENT:
{source_content}

Generate the document in Markdown format.""",

        'study': """Create a study visa information document for {country_name}.

Based on the following official source content, generate a structured document covering:

1. **Student Visa Overview**
2. **Types of Student Visas** (if multiple exist)
3. **General Requirements**
4. **Post-Study Work Options** (if mentioned)
5. **Financial Requirements** (general guidance only)
6. **Important Notes and Disclaimers**

RULES:
- Only include information from the source
- Do NOT invent specific fee amounts
- Acknowledge uncertainty in processing times
- Mention that requirements vary by institution
- Include disclaimer about changing policies

SOURCE CONTENT:
{source_content}

Generate the document in Markdown format.""",

        'family': """Create a family immigration information document for {country_name}.

Based on the following official source content, generate a structured document covering:

1. **Family Immigration Overview**
2. **Types of Family Visas** (spouse, children, parents, etc.)
3. **Eligibility Requirements**
4. **Sponsorship Requirements** (if applicable)
5. **Important Considerations**
6. **Disclaimers**

RULES:
- Only include family visa types from the source
- Be careful with relationship requirements - these vary
- Do NOT invent financial thresholds
- Acknowledge complexity of family cases
- Include disclaimer about seeking legal advice

SOURCE CONTENT:
{source_content}

Generate the document in Markdown format.""",

        'citizenship': """Create a citizenship/naturalization information document for {country_name}.

Based on the following official source content, generate a structured document covering:

1. **Citizenship Overview**
2. **Pathways to Citizenship**
3. **General Requirements** (residency, language, etc.)
4. **Application Process Overview**
5. **Important Considerations** (dual citizenship, etc.)
6. **Disclaimers**

RULES:
- Only include pathways mentioned in the source
- Do NOT invent specific residency durations unless clearly stated
- Acknowledge that citizenship laws are complex
- Recommend seeking legal advice
- Include disclaimer about policy changes

SOURCE CONTENT:
{source_content}

Generate the document in Markdown format.""",
    }
    
    def __init__(self):
        self.client = OpenAI(
            api_key=settings.DEEPSEEK_API_KEY,
            base_url=settings.DEEPSEEK_BASE_URL
        ) if settings.DEEPSEEK_API_KEY else None
        self.model = settings.DEEPSEEK_MODEL
    
    def generate_document(
        self, 
        country_name: str, 
        doc_type: str, 
        source_content: str
    ) -> Optional[dict]:
        """
        Generate a structured document from scraped content.
        
        Returns dict with 'title', 'content', 'doc_type', 'word_count'
        """
        if not self.client:
            logger.error("DeepSeek API not configured")
            return None
        
        if doc_type not in self.DOC_TYPE_PROMPTS:
            logger.error(f"Unknown doc_type: {doc_type}")
            return None
        
        # Truncate source content if too long (keep ~8000 chars for context)
        if len(source_content) > 12000:
            source_content = source_content[:12000] + "\n\n[Content truncated...]"
        
        prompt = self.DOC_TYPE_PROMPTS[doc_type].format(
            country_name=country_name,
            source_content=source_content
        )
        
        try:
            logger.info(f"Generating {doc_type} document for {country_name}...")
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system", 
                        "content": """You are an expert immigration documentation writer. 
You create accurate, well-structured documents based on official sources.
You NEVER invent information - if something is unclear, you say so.
You always include appropriate disclaimers about changing policies."""
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,  # Lower temperature for more factual output
                max_tokens=2500
            )
            
            content = response.choices[0].message.content
            word_count = len(content.split())
            
            # Generate title
            doc_type_titles = {
                'overview': f"Immigration Overview: {country_name}",
                'work': f"Work Visa Guide: {country_name}",
                'study': f"Study Visa Guide: {country_name}",
                'family': f"Family Immigration: {country_name}",
                'citizenship': f"Citizenship & Naturalization: {country_name}",
            }
            
            return {
                'title': doc_type_titles.get(doc_type, f"{doc_type.title()}: {country_name}"),
                'content': content,
                'doc_type': doc_type,
                'word_count': word_count,
                'generated_at': datetime.now().isoformat(),
                'tokens_used': response.usage.total_tokens if response.usage else 0,
            }
            
        except Exception as e:
            logger.error(f"API error generating document: {e}")
            return None


class ImmigrationDataPipeline:
    """Main pipeline orchestrating scraping and document generation."""
    
    def __init__(self):
        self.scraper = WebScraper(use_cache=True)
        self.generator = DocumentGenerator()
        self.sources_file = BASE_DIR / 'country_sources.json'
        self.country_sources = self._load_sources()
    
    def _load_sources(self) -> dict:
        """Load country sources from JSON file."""
        if not self.sources_file.exists():
            logger.error(f"Sources file not found: {self.sources_file}")
            return {}
        
        with open(self.sources_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get('countries', {})
    
    def process_country(
        self, 
        country_code: str, 
        doc_types: Optional[list] = None
    ) -> dict:
        """
        Process a single country - scrape all sources and generate documents.
        
        Args:
            country_code: ISO 3166-1 alpha-3 code (e.g., 'CAN')
            doc_types: List of doc types to process, or None for all
        
        Returns:
            Dict with results for each doc_type
        """
        if country_code not in self.country_sources:
            logger.error(f"Country not found in sources: {country_code}")
            return {}
        
        country_data = self.country_sources[country_code]
        country_name = country_data['name']
        sources = country_data.get('sources', {})
        
        if doc_types is None:
            doc_types = list(sources.keys())
        
        results = {
            'country_code': country_code,
            'country_name': country_name,
            'agency': country_data.get('agency', ''),
            'portal_url': country_data.get('portal_url', ''),
            'processed_at': datetime.now().isoformat(),
            'documents': {}
        }
        
        for doc_type in doc_types:
            if doc_type not in sources:
                logger.warning(f"No sources for {doc_type} in {country_code}")
                continue
            
            urls = sources[doc_type]
            logger.info(f"Processing {country_code}/{doc_type} from {len(urls)} source(s)")
            
            # Scrape all URLs for this doc type
            combined_content = []
            for url in urls:
                content = self.scraper.fetch_url(url)
                if content:
                    combined_content.append(f"--- Source: {url} ---\n\n{content}")
            
            if not combined_content:
                logger.warning(f"No content scraped for {country_code}/{doc_type}")
                results['documents'][doc_type] = {
                    'status': 'failed',
                    'error': 'No content could be scraped from sources'
                }
                continue
            
            # Combine and generate document
            full_content = '\n\n'.join(combined_content)
            document = self.generator.generate_document(
                country_name=country_name,
                doc_type=doc_type,
                source_content=full_content
            )
            
            if document:
                document['source_urls'] = urls
                document['status'] = 'success'
                results['documents'][doc_type] = document
                logger.info(f"[OK] Generated {doc_type} for {country_code} ({document['word_count']} words)")
            else:
                results['documents'][doc_type] = {
                    'status': 'failed',
                    'error': 'Document generation failed'
                }
        
        # Save results to file
        output_file = OUTPUT_DIR / f"{country_code}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Results saved to: {output_file}")
        return results
    
    def process_all_countries(self, doc_types: Optional[list] = None):
        """Process all countries in the sources file."""
        total = len(self.country_sources)
        logger.info(f"Processing {total} countries...")
        
        all_results = {}
        for i, country_code in enumerate(self.country_sources.keys(), 1):
            logger.info(f"\n{'='*50}")
            logger.info(f"[{i}/{total}] Processing {country_code}")
            logger.info('='*50)
            
            try:
                results = self.process_country(country_code, doc_types)
                all_results[country_code] = results
            except Exception as e:
                logger.error(f"Error processing {country_code}: {e}")
                all_results[country_code] = {'status': 'error', 'error': str(e)}
        
        # Save summary
        summary_file = OUTPUT_DIR / '_summary.json'
        summary = {
            'processed_at': datetime.now().isoformat(),
            'total_countries': total,
            'results': {
                code: {
                    'country_name': data.get('country_name', code),
                    'documents_generated': len([
                        d for d in data.get('documents', {}).values() 
                        if d.get('status') == 'success'
                    ]),
                    'status': 'success' if data.get('documents') else data.get('status', 'unknown')
                }
                for code, data in all_results.items()
            }
        }
        
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)
        
        logger.info(f"\n{'='*50}")
        logger.info(f"Processing complete. Summary saved to: {summary_file}")
        
        return all_results


def main():
    parser = argparse.ArgumentParser(description='Scrape immigration data and generate documents')
    parser.add_argument('--country', '-c', type=str, help='Country code (e.g., CAN)')
    parser.add_argument('--all', '-a', action='store_true', help='Process all countries')
    parser.add_argument('--doc-type', '-d', type=str, help='Specific doc type (overview, work, study, family, citizenship)')
    parser.add_argument('--list', '-l', action='store_true', help='List available countries')
    
    args = parser.parse_args()
    
    pipeline = ImmigrationDataPipeline()
    
    if args.list:
        print("\nAvailable countries:")
        for code, data in pipeline.country_sources.items():
            print(f"  {code}: {data['name']}")
        return
    
    doc_types = [args.doc_type] if args.doc_type else None
    
    if args.all:
        pipeline.process_all_countries(doc_types)
    elif args.country:
        pipeline.process_country(args.country.upper(), doc_types)
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
