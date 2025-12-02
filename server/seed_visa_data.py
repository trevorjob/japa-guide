"""
Seed script for visa types data.
Run with: python manage.py shell < seed_visa_data.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'japaguide.settings')
django.setup()

from countries.models import Country
from visas.models import VisaType

def seed_visa_data():
    """Create sample visa types for popular countries."""
    
    # Canada - Popular work visas
    canada = Country.objects.filter(code='CAN').first()
    if canada:
        visas_canada = [
            {
                'name': 'Express Entry (Federal Skilled Worker)',
                'slug': 'express-entry-fsw',
                'category': 'Permanent Residence',
                'description': 'Points-based immigration program for skilled workers. Fastest pathway to Canadian permanent residence.',
                'processing_time_min_weeks': 24,
                'processing_time_max_weeks': 32,
                'duration_months': None,  # Permanent
                'cost_estimate_min': 1500,
                'cost_estimate_max': 2500,
                'success_rate': 65,
                'requirements': ['Bachelor\'s degree', 'IELTS 6.5+', '3+ years work experience', 'CRS score 470+'],
                'benefits': ['Permanent residence', 'Free healthcare', 'Path to citizenship', 'Bring family members'],
                'restrictions': ['Must meet point threshold', 'Age limit applies', 'Funds requirement'],
                'is_popular': True,
                'is_renewable': False,
            },
            {
                'name': 'Post-Graduation Work Permit (PGWP)',
                'slug': 'pgwp',
                'category': 'Work Permit',
                'description': 'Open work permit for international students who graduated from eligible Canadian institutions.',
                'processing_time_min_weeks': 16,
                'processing_time_max_weeks': 24,
                'duration_months': 36,
                'cost_estimate_min': 255,
                'cost_estimate_max': 255,
                'success_rate': 95,
                'requirements': ['Graduate from DLI', 'Full-time study 8+ months', 'Apply within 180 days'],
                'benefits': ['Open work permit', 'Any employer', 'Pathway to PR'],
                'restrictions': ['One-time only', 'Must graduate', 'Time-sensitive application'],
                'is_popular': True,
                'is_renewable': False,
            },
        ]
        
        for visa_data in visas_canada:
            VisaType.objects.update_or_create(
                country=canada,
                slug=visa_data['slug'],
                defaults=visa_data
            )
        print(f"✅ Created {len(visas_canada)} visa types for Canada")
    
    # United States - H1B and others
    usa = Country.objects.filter(code='USA').first()
    if usa:
        visas_usa = [
            {
                'name': 'H-1B Specialty Occupation',
                'slug': 'h1b',
                'category': 'Work Visa',
                'description': 'Temporary work visa for specialty occupations requiring theoretical or technical expertise.',
                'processing_time_min_weeks': 12,
                'processing_time_max_weeks': 24,
                'duration_months': 36,
                'cost_estimate_min': 5000,
                'cost_estimate_max': 10000,
                'success_rate': 45,
                'requirements': ['Bachelor\'s degree or equivalent', 'Job offer from US employer', 'Lottery selection'],
                'benefits': ['Work legally in US', 'Dual intent', 'Bring spouse and children'],
                'restrictions': ['Cap subject (lottery)', 'Employer specific', 'Renewal required'],
                'is_popular': True,
                'is_renewable': True,
            },
            {
                'name': 'O-1 Extraordinary Ability',
                'slug': 'o1',
                'category': 'Work Visa',
                'description': 'For individuals with extraordinary ability in sciences, arts, education, business, or athletics.',
                'processing_time_min_weeks': 8,
                'processing_time_max_weeks': 16,
                'duration_months': 36,
                'cost_estimate_min': 3000,
                'cost_estimate_max': 8000,
                'success_rate': 70,
                'requirements': ['Extraordinary ability proof', 'Awards/recognition', 'Expert letters', 'Job offer'],
                'benefits': ['No lottery', 'Unlimited renewals', 'Fast processing available'],
                'restrictions': ['High bar for qualification', 'Must maintain status', 'Employer dependent'],
                'is_popular': True,
                'is_renewable': True,
            },
        ]
        
        for visa_data in visas_usa:
            VisaType.objects.update_or_create(
                country=usa,
                slug=visa_data['slug'],
                defaults=visa_data
            )
        print(f"✅ Created {len(visas_usa)} visa types for USA")
    
    # Germany - Blue Card
    germany = Country.objects.filter(code='DEU').first()
    if germany:
        visas_germany = [
            {
                'name': 'EU Blue Card',
                'slug': 'eu-blue-card',
                'category': 'Work & Residence',
                'description': 'Work and residence permit for highly qualified professionals from non-EU countries.',
                'processing_time_min_weeks': 8,
                'processing_time_max_weeks': 16,
                'duration_months': 48,
                'cost_estimate_min': 100,
                'cost_estimate_max': 200,
                'success_rate': 85,
                'requirements': ['University degree', 'Job offer €58,400+ salary', 'Health insurance'],
                'benefits': ['Permanent residence after 33 months', 'Family reunion', 'EU mobility'],
                'restrictions': ['Salary threshold', 'Degree recognition required'],
                'is_popular': True,
                'is_renewable': True,
            },
        ]
        
        for visa_data in visas_germany:
            VisaType.objects.update_or_create(
                country=germany,
                slug=visa_data['slug'],
                defaults=visa_data
            )
        print(f"✅ Created {len(visas_germany)} visa types for Germany")
    
    # Australia - Skilled Migration
    australia = Country.objects.filter(code='AUS').first()
    if australia:
        visas_australia = [
            {
                'name': 'Skilled Independent Visa (Subclass 189)',
                'slug': 'subclass-189',
                'category': 'Permanent Residence',
                'description': 'Points-based permanent residence visa for skilled workers not sponsored by employer.',
                'processing_time_min_weeks': 32,
                'processing_time_max_weeks': 52,
                'duration_months': None,  # Permanent
                'cost_estimate_min': 4640,
                'cost_estimate_max': 4640,
                'success_rate': 55,
                'requirements': ['Age under 45', 'Skilled occupation', 'Points test 65+', 'English proficiency'],
                'benefits': ['Permanent residence', 'Medicare', 'Work anywhere', 'Citizenship pathway'],
                'restrictions': ['Points threshold', 'Occupation list', 'Age limit'],
                'is_popular': True,
                'is_renewable': False,
            },
        ]
        
        for visa_data in visas_australia:
            VisaType.objects.update_or_create(
                country=australia,
                slug=visa_data['slug'],
                defaults=visa_data
            )
        print(f"✅ Created {len(visas_australia)} visa types for Australia")
    
    print("\n✅ Visa seeding complete!")

if __name__ == '__main__':
    seed_visa_data()
