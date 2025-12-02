"""
Management command to sync country data from REST Countries API.
Usage: python manage.py sync_countries [--limit=50] [--force]
"""
import requests
from django.core.management.base import BaseCommand
from django.utils import timezone
from countries.models import Country


class Command(BaseCommand):
    help = 'Sync country data from REST Countries API (https://restcountries.com/)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            default=None,
            help='Limit number of countries to sync (for testing)'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force update even if recently synced'
        )
        parser.add_argument(
            '--countries',
            type=str,
            help='Comma-separated list of country codes to sync (e.g., CAN,USA,GBR)'
        )

    def handle(self, *args, **options):
        limit = options.get('limit')
        force = options.get('force')
        specific_countries = options.get('countries')
        
        self.stdout.write(self.style.SUCCESS('Starting REST Countries API sync...'))
        
        try:
            # Use v3.1 API with proper endpoint
            # Note: /all endpoint requires fields parameter, so we use /independent instead
            if specific_countries:
                country_codes = specific_countries.upper().split(',')
                url = f'https://restcountries.com/v3.1/alpha?codes={",".join(country_codes)}'
            else:
                # Get all independent countries (covers most countries we care about)
                url = 'https://restcountries.com/v3.1/independent?status=true'
            
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            countries_data = response.json()
            
            if limit:
                countries_data = countries_data[:limit]
            
            self.stdout.write(f'Fetched {len(countries_data)} countries from API')
            
            created_count = 0
            updated_count = 0
            error_count = 0
            
            for data in countries_data:
                try:
                    code = data.get('cca3')  # v3.1 uses cca3
                    if not code:
                        self.stdout.write(self.style.WARNING(f'Skipping country without cca3'))
                        continue
                    
                    # Extract relevant fields
                    name = data.get('name', {}).get('common', '')
                    region = data.get('region', '')
                    subregion = data.get('subregion', '')
                    population = data.get('population', 0)
                    area = data.get('area', 0)
                    
                    # Currency (get first one)
                    currencies = data.get('currencies', {})
                    currency = list(currencies.keys())[0] if currencies else ''
                    
                    # Flags
                    flags = data.get('flags', {})
                    flag_svg = flags.get('svg', '')
                    flag_png = flags.get('png', '')
                    
                    # Metadata (languages, timezones, borders, etc.)
                    metadata = {
                        'languages': list(data.get('languages', {}).values()),
                        'timezones': data.get('timezones', []),
                        'borders': data.get('borders', []),
                        'capital': data.get('capital', []),
                        'latlng': data.get('latlng', []),
                        'independent': data.get('independent', False),
                        'un_member': data.get('unMember', False),
                        'fifa': data.get('fifa', ''),
                        'continents': data.get('continents', []),
                    }
                    
                    # Check if country exists
                    country, created = Country.objects.update_or_create(
                        code=code,
                        defaults={
                            'code_alpha2': data.get('alpha2Code', ''),
                            'name': name,
                            'region': region,
                            'subregion': subregion,
                            'currency': currency,
                            'population': population or None,
                            'area_sq_km': area or None,
                            'flag_svg_url': flag_svg,
                            'flag_png_url': flag_png,
                            'metadata': metadata,
                            'basic_data_source': 'rest_countries',
                            'basic_data_last_synced': timezone.now(),
                        }
                    )
                    
                    if created:
                        created_count += 1
                        self.stdout.write(self.style.SUCCESS(f'✓ Created: {name} ({code})'))
                    else:
                        updated_count += 1
                        self.stdout.write(f'✓ Updated: {name} ({code})')
                
                except Exception as e:
                    error_count += 1
                    country_name = data.get('name', {}).get('common', 'unknown')
                    self.stdout.write(self.style.ERROR(f'✗ Error processing {country_name}: {str(e)}'))
            
            # Summary
            self.stdout.write(self.style.SUCCESS('\n=== Sync Complete ==='))
            self.stdout.write(f'Created: {created_count}')
            self.stdout.write(f'Updated: {updated_count}')
            if error_count > 0:
                self.stdout.write(self.style.WARNING(f'Errors: {error_count}'))
            
        except requests.exceptions.RequestException as e:
            self.stdout.write(self.style.ERROR(f'API request failed: {str(e)}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Unexpected error: {str(e)}'))
