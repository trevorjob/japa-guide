"""
Management command to sync migration data from UNHCR Refugee Statistics API.
Usage: python manage.py sync_migration [--year=2023]
"""
import requests
from django.core.management.base import BaseCommand
from django.utils import timezone
from countries.models import Country


class Command(BaseCommand):
    help = 'Sync migration data from UNHCR Refugee Statistics API'

    def add_arguments(self, parser):
        parser.add_argument(
            '--year',
            type=int,
            default=2023,
            help='Year for migration data (default: 2023)'
        )
        parser.add_argument(
            '--countries',
            type=str,
            help='Comma-separated list of country codes to sync'
        )

    def handle(self, *args, **options):
        year = options.get('year')
        specific_countries = options.get('countries')
        
        self.stdout.write(self.style.SUCCESS(f'Starting UNHCR migration data sync for {year}...'))
        
        try:
            # Get all countries to process
            if specific_countries:
                country_codes = specific_countries.upper().split(',')
                countries = Country.objects.filter(code__in=country_codes)
            else:
                countries = Country.objects.all()
            
            self.stdout.write(f'Processing {countries.count()} countries')
            
            updated_count = 0
            error_count = 0
            
            for country in countries:
                try:
                    # UNHCR uses alpha-3 codes
                    code = country.code
                    
                    # Get refugees IN this country (country of asylum - coa)
                    refugees_in_url = f'https://api.unhcr.org/population/v1/population/?year={year}&coa={code}'
                    response_in = requests.get(refugees_in_url, timeout=30)
                    
                    refugees_in = 0
                    asylum_seekers = 0
                    idp_count = 0
                    
                    if response_in.status_code == 200:
                        data_in = response_in.json()
                        if 'items' in data_in and len(data_in['items']) > 0:
                            # Sum up all entries (might be multiple source countries)
                            for item in data_in['items']:
                                refugees_in += int(item.get('refugees', 0) or 0)
                                asylum_seekers += int(item.get('asylum_seekers', 0) or 0)
                                idp_count += int(item.get('idps', 0) or 0)
                    
                    country.refugees_in = refugees_in
                    country.asylum_seekers = asylum_seekers
                    country.idp_count = idp_count
                    
                    # Get refugees FROM this country (country of origin - coo)
                    refugees_out_url = f'https://api.unhcr.org/population/v1/population/?year={year}&coo={code}'
                    response_out = requests.get(refugees_out_url, timeout=30)
                    
                    refugees_out = 0
                    
                    if response_out.status_code == 200:
                        data_out = response_out.json()
                        if 'items' in data_out and len(data_out['items']) > 0:
                            # Sum up refugees in all asylum countries
                            for item in data_out['items']:
                                refugees_out += int(item.get('refugees', 0) or 0)
                    
                    country.refugees_out = refugees_out
                    
                    # Calculate net migration (rough approximation)
                    if refugees_in or refugees_out:
                        country.net_migration = refugees_in - refugees_out
                    
                    country.migration_data_source = 'unhcr'
                    country.migration_data_last_synced = timezone.now()
                    country.save()
                    
                    updated_count += 1
                    self.stdout.write(f'✓ Updated: {country.name} (In: {refugees_in:,}, Out: {refugees_out:,}, Asylum: {asylum_seekers:,})')
                
                except Exception as e:
                    error_count += 1
                    self.stdout.write(self.style.ERROR(f'✗ Error processing {country.name}: {str(e)}'))
            
            # Summary
            self.stdout.write(self.style.SUCCESS('\n=== Sync Complete ==='))
            self.stdout.write(f'Updated: {updated_count}')
            if error_count > 0:
                self.stdout.write(self.style.WARNING(f'Errors: {error_count}'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Unexpected error: {str(e)}'))
