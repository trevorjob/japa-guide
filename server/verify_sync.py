#!/usr/bin/env python
"""Quick script to verify World Bank sync results."""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'japaguide.settings')
django.setup()

from countries.models import Country, EconomicIndicator
from django.db.models import Count

print("=" * 50)
print("WORLD BANK SYNC VERIFICATION")
print("=" * 50)

# EconomicIndicator breakdown
print("\n📊 EconomicIndicator Records:")
total = EconomicIndicator.objects.count()
print(f"   Total: {total}")
for row in EconomicIndicator.objects.values('indicator_name').annotate(c=Count('id')).order_by('indicator_name'):
    print(f"   • {row['indicator_name']}: {row['c']}")

# Country model updates
print("\n🌍 Country Model Updates:")
gdp_count = Country.objects.exclude(gdp_per_capita_usd__isnull=True).count()
unemp_count = Country.objects.exclude(unemployment_rate__isnull=True).count()
print(f"   Countries with GDP data: {gdp_count}")
print(f"   Countries with unemployment data: {unemp_count}")

# Top GDP countries
print("\n💰 Top 10 GDP Countries (2022):")
for c in Country.objects.exclude(gdp_per_capita_usd__isnull=True).order_by('-gdp_per_capita_usd')[:10]:
    print(f"   {c.name}: ${c.gdp_per_capita_usd:,.2f}")

# Tier-1 countries
print("\n🎯 Tier-1 Countries Data:")
tier1_names = [
    'Canada', 'United States', 'Germany', 'Australia', 'United Kingdom',
    'Ireland', 'Netherlands', 'France', 'Portugal', 'Spain',
    'United Arab Emirates', 'Qatar', 'Saudi Arabia'
]
for c in Country.objects.filter(name__in=tier1_names).order_by('name'):
    gdp = f"${c.gdp_per_capita_usd:,.0f}" if c.gdp_per_capita_usd else "N/A"
    unemp = f"{c.unemployment_rate:.2f}%" if c.unemployment_rate else "N/A"
    print(f"   {c.name}: GDP={gdp}, Unemployment={unemp}")

# Income categories - check actual stored values (uses value_text field)
print("\n📈 Income Categories (from EconomicIndicator.value_text field):")
income_records = EconomicIndicator.objects.filter(indicator_name='income_category')[:10]
for rec in income_records:
    print(f"   {rec.country.name}: '{rec.value_text}'")

# Count by category
print("\n   By category:")
from django.db.models.functions import Coalesce
from django.db.models import Value
for row in EconomicIndicator.objects.filter(indicator_name='income_category').values('value_text').annotate(c=Count('id')).order_by('-c'):
    cat = row['value_text'] or 'Empty'
    print(f"   • {cat}: {row['c']} countries")

print("\n" + "=" * 50)
print("✅ Sync verification complete!")
print("=" * 50)
