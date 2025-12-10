LE'] = 'japaguide.settings'
django.setup()

from countries.models import Country
from visas.models import VisaType

print("=" * 60)
print("TIER-1 COUNTRY ANALYSIS")
print("=" * 60)

# Get all countries with summaries
print("\n=== Countries with Summaries (Best Data) ===")
countries_with_summary = Country.objects.exclude(summary__isnull=True).exclude(summary='').order_by('region', 'name')

for c in countries_with_summary:
    visa_count = VisaType.objects.filter(country=c).count()
    print(f"  {c.name} ({c.code})")
    print(f"    Region: {c.region}")
    print(f"    Visa Types: {visa_count}")
    print(f"    Difficulty: {c.difficulty_score}")
    print(f"    Cost Index: {c.cost_of_living_index}")
    print()

print(f"\nTotal countries with summaries: {countries_with_summary.count()}")

# Countries with visa types
print("\n=== Countries with Visa Data ===")
countries_with_visas = Country.objects.filter(visa_types__isnull=False).distinct()
for c in countries_with_visas:
    visa_count = VisaType.objects.filter(country=c).count()
    visas = VisaType.objects.filter(country=c).values_list('name', flat=True)
    print(f"  {c.name}: {visa_count} visa types")
    for v in visas:
        print(f"    - {v}")

print(f"\nTotal countries with visa data: {countries_with_visas.count()}")

# All visa types
print("\n=== All Visa Types in Database ===")
all_visas = VisaType.objects.select_related('country').all()
for v in all_visas:
    print(f"  {v.country.name}: {v.name} ({v.category or 'uncategorized'})")

print(f"\nTotal visa types: {all_visas.count()}")

# Region breakdown
print("\n=== Countries by Region (with summaries) ===")
regions = countries_with_summary.values_list('region', flat=True).distinct()
for region in regions:
    count = countries_with_summary.filter(region=region).count()
    countries = countries_with_summary.filter(region=region).values_list('name', flat=True)
    print(f"\n  {region}: {count} countries")
    for name in countries:
        print(f"    - {name}")
