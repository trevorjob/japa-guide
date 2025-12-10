"""
Management command to sync economic indicators from the World Bank API.
Usage: python manage.py sync_world_bank [--year=2023] [--indicators=all]

World Bank API docs: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392
"""
import requests
from django.core.management.base import BaseCommand
from django.utils import timezone
from countries.models import Country, EconomicIndicator


# World Bank indicator codes
INDICATORS = {
    'NY.GDP.PCAP.CD': 'gdp_per_capita_usd',      # GDP per capita (current US$)
    'SL.UEM.TOTL.ZS': 'unemployment_rate',        # Unemployment (% of labor force)
    'PA.NUS.PPP': 'ppp_conversion_factor',        # PPP conversion factor
}

# Income category comes from a different endpoint
INCOME_CATEGORY_ENDPOINT = 'https://api.worldbank.org/v2/country?format=json&per_page=300'


class Command(BaseCommand):
    help = 'Sync economic indicators from World Bank API'

    def add_arguments(self, parser):
        parser.add_argument(
            '--year',
            type=int,
            default=2023,
            help='Year to fetch data for (default: 2023)'
        )
        parser.add_argument(
            '--indicators',
            type=str,
            default='all',
            help='Comma-separated indicator codes or "all"'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Print what would be done without saving'
        )

    def handle(self, *args, **options):
        year = options['year']
        dry_run = options['dry_run']
        
        self.stdout.write(f"Syncing World Bank data for year {year}...")
        
        if dry_run:
            self.stdout.write(self.style.WARNING("DRY RUN - no data will be saved"))
        
        # Get all countries from our database
        countries = {c.code: c for c in Country.objects.all()}
        self.stdout.write(f"Found {len(countries)} countries in database")
        
        # Sync each indicator
        total_created = 0
        total_updated = 0
        
        for indicator_code, indicator_name in INDICATORS.items():
            created, updated = self.sync_indicator(
                indicator_code, 
                indicator_name, 
                year, 
                countries, 
                dry_run
            )
            total_created += created
            total_updated += updated
        
        # Sync income categories
        ic_created, ic_updated = self.sync_income_categories(countries, year, dry_run)
        total_created += ic_created
        total_updated += ic_updated
        
        # Update Country model fields from indicators
        if not dry_run:
            self.update_country_fields(year)
        
        self.stdout.write(self.style.SUCCESS(
            f"Done! Created: {total_created}, Updated: {total_updated}"
        ))

    def sync_indicator(self, indicator_code, indicator_name, year, countries, dry_run):
        """Fetch and store a single indicator from World Bank API."""
        # World Bank API: /country/all/indicator/{code}?date={year}&format=json
        url = f"https://api.worldbank.org/v2/country/all/indicator/{indicator_code}"
        params = {
            'date': year,
            'format': 'json',
            'per_page': 300,  # Get all countries in one request
        }
        
        self.stdout.write(f"  Fetching {indicator_name} ({indicator_code})...")
        
        try:
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
        except requests.RequestException as e:
            self.stdout.write(self.style.ERROR(f"    Error fetching {indicator_code}: {e}"))
            return 0, 0
        
        # World Bank returns [metadata, data] or [metadata, None]
        if not data or len(data) < 2 or data[1] is None:
            self.stdout.write(self.style.WARNING(f"    No data returned for {indicator_code}"))
            return 0, 0
        
        records = data[1]
        created = 0
        updated = 0
        
        for record in records:
            country_code = record.get('countryiso3code')
            value = record.get('value')
            
            # Skip if no country code or no value
            if not country_code or value is None:
                continue
            
            # Skip if country not in our database
            if country_code not in countries:
                continue
            
            country = countries[country_code]
            
            if dry_run:
                self.stdout.write(f"    Would save: {country.name} - {indicator_name} = {value}")
                continue
            
            # Upsert the indicator
            obj, was_created = EconomicIndicator.objects.update_or_create(
                country=country,
                indicator_name=indicator_name,
                year=year,
                defaults={
                    'value': value,
                    'source_name': 'World Bank',
                    'source_indicator_code': indicator_code,
                }
            )
            
            if was_created:
                created += 1
            else:
                updated += 1
        
        self.stdout.write(f"    {indicator_name}: {created} created, {updated} updated")
        return created, updated

    def sync_income_categories(self, countries, year, dry_run):
        """Fetch income category classifications from World Bank."""
        self.stdout.write("  Fetching income categories...")
        
        try:
            response = requests.get(INCOME_CATEGORY_ENDPOINT, timeout=30)
            response.raise_for_status()
            data = response.json()
        except requests.RequestException as e:
            self.stdout.write(self.style.ERROR(f"    Error fetching income categories: {e}"))
            return 0, 0
        
        if not data or len(data) < 2 or data[1] is None:
            self.stdout.write(self.style.WARNING("    No income category data returned"))
            return 0, 0
        
        records = data[1]
        created = 0
        updated = 0
        
        for record in records:
            country_code = record.get('id')  # This is alpha-3
            income_level = record.get('incomeLevel', {})
            income_value = income_level.get('value') if income_level else None
            
            if not country_code or not income_value:
                continue
            
            if country_code not in countries:
                continue
            
            country = countries[country_code]
            
            if dry_run:
                self.stdout.write(f"    Would save: {country.name} - income_category = {income_value}")
                continue
            
            obj, was_created = EconomicIndicator.objects.update_or_create(
                country=country,
                indicator_name='income_category',
                year=year,
                defaults={
                    'value_text': income_value,
                    'source_name': 'World Bank',
                }
            )
            
            if was_created:
                created += 1
            else:
                updated += 1
        
        self.stdout.write(f"    income_category: {created} created, {updated} updated")
        return created, updated

    def update_country_fields(self, year):
        """Update Country model fields from latest indicators."""
        self.stdout.write("  Updating Country model fields...")
        
        # Get latest indicators for each country
        indicators = EconomicIndicator.objects.filter(year=year)
        
        updated = 0
        for indicator in indicators:
            country = indicator.country
            changed = False
            
            if indicator.indicator_name == 'gdp_per_capita_usd' and indicator.value:
                if country.gdp_per_capita_usd != indicator.value:
                    country.gdp_per_capita_usd = indicator.value
                    changed = True
            
            elif indicator.indicator_name == 'unemployment_rate' and indicator.value:
                if country.unemployment_rate != indicator.value:
                    country.unemployment_rate = indicator.value
                    changed = True
            
            elif indicator.indicator_name == 'ppp_conversion_factor' and indicator.value:
                if country.ppp_conversion_factor != indicator.value:
                    country.ppp_conversion_factor = indicator.value
                    changed = True
            
            if changed:
                country.economic_data_source = 'World Bank'
                country.economic_data_last_synced = timezone.now()
                country.save()
                updated += 1
        
        self.stdout.write(f"    Updated {updated} country records")
