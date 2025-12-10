"""Quick script to check data completeness"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'japaguide.settings')
django.setup()

from countries.models import Country
from visas.models import VisaType

print(f"Countries: {Country.objects.count()}")
print(f"Visas: {VisaType.objects.count()}")
print("---Data quality---")
print(f"With summary: {Country.objects.exclude(summary='').count()}")
print(f"With difficulty: {Country.objects.exclude(difficulty_score__isnull=True).count()}")
print(f"With COL index: {Country.objects.exclude(cost_of_living_index__isnull=True).count()}")
print(f"With GDP: {Country.objects.exclude(gdp_per_capita_usd__isnull=True).count()}")
print(f"With rent: {Country.objects.exclude(avg_rent_monthly_usd__isnull=True).count()}")
print(f"With visa_summary: {Country.objects.exclude(visa_summary='').count()}")

print("\n---Sample country with full data---")
sample = Country.objects.exclude(summary='').exclude(difficulty_score__isnull=True).first()
if sample:
    print(f"Name: {sample.name}")
    print(f"Summary: {sample.summary[:100]}...")
    print(f"Difficulty: {sample.difficulty_score}")
    print(f"Visa types: {sample.visa_types.count()}")
