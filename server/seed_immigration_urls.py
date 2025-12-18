"""
Seed immigration URLs for Tier 1 countries and auto-review all data.
Run with: python seed_immigration_urls.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'japaguide.settings')
django.setup()

from countries.models import Country, CountryDocument


# Official government immigration websites for Tier 1 countries
IMMIGRATION_URLS = {
    'CAN': 'https://www.canada.ca/en/immigration-refugees-citizenship.html',
    'USA': 'https://www.uscis.gov/',
    'GBR': 'https://www.gov.uk/browse/visas-immigration',
    'AUS': 'https://immi.homeaffairs.gov.au/',
    'DEU': 'https://www.make-it-in-germany.com/en/',
    'NLD': 'https://ind.nl/en',
    'IRL': 'https://www.irishimmigration.ie/',
    'NZL': 'https://www.immigration.govt.nz/',
    'FRA': 'https://france-visas.gouv.fr/en/',
    'PRT': 'https://www.sef.pt/en/',
    'ARE': 'https://u.ae/en/information-and-services/visa-and-emirates-id',
    'SGP': 'https://www.mom.gov.sg/passes-and-permits',
    'JPN': 'https://www.moj.go.jp/isa/index.html',
    'ZAF': 'http://www.dha.gov.za/',
    'CHE': 'https://www.sem.admin.ch/sem/en/home.html',
}


def seed_immigration_urls():
    """Add official immigration URLs to Tier 1 countries."""
    print("🔗 Seeding immigration URLs for Tier 1 countries...\n")
    
    updated = 0
    for code, url in IMMIGRATION_URLS.items():
        try:
            country = Country.objects.get(code=code)
            country.immigration_url = url
            country.save(update_fields=['immigration_url'])
            print(f"  ✅ {country.name}: {url}")
            updated += 1
        except Country.DoesNotExist:
            print(f"  ⚠️  {code}: Country not found")
    
    print(f"\n✅ Updated {updated} countries with immigration URLs")


def auto_review_all_data():
    """Set all CountryDocuments and Countries to reviewed status."""
    print("\n📋 Auto-reviewing all data...\n")
    
    # Update all CountryDocuments
    docs_updated = CountryDocument.objects.filter(needs_review=True).update(
        needs_review=False,
        data_confidence='high'
    )
    print(f"  ✅ Set {docs_updated} documents to reviewed (needs_review=False)")
    
    # Update all Countries to reviewed
    countries_updated = Country.objects.filter(needs_review=True).update(
        needs_review=False
    )
    print(f"  ✅ Set {countries_updated} countries to reviewed")
    
    # Set Tier 1 countries to high confidence
    tier1_updated = Country.objects.filter(code__in=IMMIGRATION_URLS.keys()).update(
        data_confidence='high'
    )
    print(f"  ✅ Set {tier1_updated} Tier 1 countries to high confidence")
    
    print("\n✅ All data auto-reviewed!")


def show_stats():
    """Show current data stats."""
    print("\n📊 Current Data Statistics:")
    print(f"  - Total Countries: {Country.objects.count()}")
    print(f"  - Countries with immigration_url: {Country.objects.exclude(immigration_url='').count()}")
    print(f"  - Countries needing review: {Country.objects.filter(needs_review=True).count()}")
    print(f"  - Total Documents: {CountryDocument.objects.count()}")
    print(f"  - Documents needing review: {CountryDocument.objects.filter(needs_review=True).count()}")


if __name__ == '__main__':
    seed_immigration_urls()
    auto_review_all_data()
    show_stats()
