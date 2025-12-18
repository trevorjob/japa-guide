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
    
    # United Kingdom - Skilled Worker Visa
    uk = Country.objects.filter(code='GBR').first()
    if uk:
        visas_uk = [
            {
                'name': 'Skilled Worker Visa',
                'slug': 'skilled-worker',
                'category': 'Work Visa',
                'description': 'For workers with a job offer from a UK employer with a valid sponsor licence.',
                'processing_time_min_weeks': 3,
                'processing_time_max_weeks': 8,
                'duration_months': 60,
                'cost_estimate_min': 719,
                'cost_estimate_max': 1500,
                'success_rate': 80,
                'requirements': ['Job offer from licensed sponsor', 'English B1 level', 'Minimum salary £26,200 or going rate', 'Role on eligible occupations'],
                'benefits': ['Work in UK', 'Bring dependants', 'Path to settlement (ILR)', 'Switch employers'],
                'restrictions': ['Sponsor required', 'Salary threshold', 'Immigration Health Surcharge'],
                'is_popular': True,
                'is_renewable': True,
            },
            {
                'name': 'Global Talent Visa',
                'slug': 'global-talent',
                'category': 'Work Visa',
                'description': 'For leaders or potential leaders in academia, research, arts, culture, or digital technology.',
                'processing_time_min_weeks': 3,
                'processing_time_max_weeks': 8,
                'duration_months': 60,
                'cost_estimate_min': 716,
                'cost_estimate_max': 716,
                'success_rate': 75,
                'requirements': ['Endorsement from approved body', 'Exceptional talent or promise', 'Field-specific criteria'],
                'benefits': ['No job offer needed', 'Fast settlement (3 years)', 'Flexible work', 'Bring family'],
                'restrictions': ['Endorsement required', 'Highly competitive'],
                'is_popular': True,
                'is_renewable': True,
            },
        ]
        
        for visa_data in visas_uk:
            VisaType.objects.update_or_create(
                country=uk,
                slug=visa_data['slug'],
                defaults=visa_data
            )
        print(f"✅ Created {len(visas_uk)} visa types for United Kingdom")
    
    # Ireland - Critical Skills Employment Permit
    ireland = Country.objects.filter(code='IRL').first()
    if ireland:
        visas_ireland = [
            {
                'name': 'Critical Skills Employment Permit',
                'slug': 'critical-skills',
                'category': 'Work Permit',
                'description': 'For highly skilled workers in occupations critical to Irish economy including IT, engineering, and healthcare.',
                'processing_time_min_weeks': 4,
                'processing_time_max_weeks': 12,
                'duration_months': 24,
                'cost_estimate_min': 1000,
                'cost_estimate_max': 1000,
                'success_rate': 85,
                'requirements': ['Job offer €38,000+ (€64,000 for non-critical list)', 'Relevant degree', 'Job on critical skills list'],
                'benefits': ['Immediate family reunion', 'Stamp 4 after 2 years', 'No labour market test', 'Fast track to residency'],
                'restrictions': ['Salary minimum', 'Must be on critical skills list', 'Employer must be registered'],
                'is_popular': True,
                'is_renewable': True,
            },
            {
                'name': 'General Employment Permit',
                'slug': 'general-employment',
                'category': 'Work Permit',
                'description': 'For skilled workers in occupations not on the critical skills list.',
                'processing_time_min_weeks': 6,
                'processing_time_max_weeks': 16,
                'duration_months': 24,
                'cost_estimate_min': 1000,
                'cost_estimate_max': 1000,
                'success_rate': 70,
                'requirements': ['Job offer €34,000+', 'Relevant qualifications', 'Labour market needs test'],
                'benefits': ['Work legally in Ireland', 'Renewable', 'Path to residency after 5 years'],
                'restrictions': ['Labour market test required', '50/50 rule for employer', 'Quota limits'],
                'is_popular': False,
                'is_renewable': True,
            },
        ]
        
        for visa_data in visas_ireland:
            VisaType.objects.update_or_create(
                country=ireland,
                slug=visa_data['slug'],
                defaults=visa_data
            )
        print(f"✅ Created {len(visas_ireland)} visa types for Ireland")
    
    # Netherlands - Highly Skilled Migrant
    netherlands = Country.objects.filter(code='NLD').first()
    if netherlands:
        visas_netherlands = [
            {
                'name': 'Highly Skilled Migrant (Kennismigrant)',
                'slug': 'kennismigrant',
                'category': 'Work Permit',
                'description': 'Fast-track work permit for highly skilled workers from outside EU/EEA.',
                'processing_time_min_weeks': 2,
                'processing_time_max_weeks': 4,
                'duration_months': 60,
                'cost_estimate_min': 350,
                'cost_estimate_max': 500,
                'success_rate': 90,
                'requirements': ['Job with recognised sponsor', 'Minimum salary €5,331/month (age 30+) or €3,909 (under 30)', 'Valid passport'],
                'benefits': ['Fast processing', '30% tax ruling eligible', 'Family can work', 'Path to permanent residence'],
                'restrictions': ['Salary threshold', 'Must work for recognised sponsor', 'Tied to employer initially'],
                'is_popular': True,
                'is_renewable': True,
            },
            {
                'name': 'Dutch-American Friendship Treaty (DAFT)',
                'slug': 'daft',
                'category': 'Entrepreneur',
                'description': 'Self-employment permit for US citizens to start or run a business in the Netherlands.',
                'processing_time_min_weeks': 8,
                'processing_time_max_weeks': 16,
                'duration_months': 24,
                'cost_estimate_min': 4500,
                'cost_estimate_max': 4500,
                'success_rate': 85,
                'requirements': ['US citizenship', 'Business plan', '€4,500 investment', 'Active business involvement'],
                'benefits': ['Start business in NL', 'Low investment threshold', 'Family can join', 'Renewable'],
                'restrictions': ['US citizens only', 'Must run business actively', 'Investment must be accessible'],
                'is_popular': False,
                'is_renewable': True,
            },
        ]
        
        for visa_data in visas_netherlands:
            VisaType.objects.update_or_create(
                country=netherlands,
                slug=visa_data['slug'],
                defaults=visa_data
            )
        print(f"✅ Created {len(visas_netherlands)} visa types for Netherlands")
    
    # New Zealand - Skilled Migrant Category
    nz = Country.objects.filter(code='NZL').first()
    if nz:
        visas_nz = [
            {
                'name': 'Skilled Migrant Category Resident Visa',
                'slug': 'skilled-migrant',
                'category': 'Permanent Residence',
                'description': 'Points-based residence visa for skilled workers under 56 years old.',
                'processing_time_min_weeks': 16,
                'processing_time_max_weeks': 52,
                'duration_months': None,
                'cost_estimate_min': 4290,
                'cost_estimate_max': 4290,
                'success_rate': 60,
                'requirements': ['Age under 56', 'Points 160+', 'Skilled employment or job offer', 'IELTS 6.5+', 'Health and character checks'],
                'benefits': ['Permanent residence', 'Work anywhere', 'Public healthcare', 'Citizenship pathway'],
                'restrictions': ['Points threshold', 'Health requirements', 'Character requirements'],
                'is_popular': True,
                'is_renewable': False,
            },
            {
                'name': 'Accredited Employer Work Visa',
                'slug': 'aewv',
                'category': 'Work Visa',
                'description': 'Work visa for workers with job offer from accredited NZ employer.',
                'processing_time_min_weeks': 4,
                'processing_time_max_weeks': 12,
                'duration_months': 36,
                'cost_estimate_min': 750,
                'cost_estimate_max': 750,
                'success_rate': 85,
                'requirements': ['Job offer from accredited employer', 'Meet job check requirements', 'Health and character checks'],
                'benefits': ['Work in NZ', 'Bring family', 'May lead to residence', 'Up to 3 years'],
                'restrictions': ['Employer must be accredited', 'Job check requirements', 'Median wage requirements'],
                'is_popular': True,
                'is_renewable': True,
            },
        ]
        
        for visa_data in visas_nz:
            VisaType.objects.update_or_create(
                country=nz,
                slug=visa_data['slug'],
                defaults=visa_data
            )
        print(f"✅ Created {len(visas_nz)} visa types for New Zealand")
    
    # France - Talent Passport
    france = Country.objects.filter(code='FRA').first()
    if france:
        visas_france = [
            {
                'name': 'Talent Passport - Highly Qualified Employee',
                'slug': 'talent-passport-hq',
                'category': 'Work & Residence',
                'description': 'Multi-year residence permit for highly qualified employees with Master\'s degree or equivalent.',
                'processing_time_min_weeks': 4,
                'processing_time_max_weeks': 12,
                'duration_months': 48,
                'cost_estimate_min': 269,
                'cost_estimate_max': 269,
                'success_rate': 80,
                'requirements': ['Master\'s degree or 5 years experience', 'Employment contract 1+ year', 'Salary 1.8x minimum wage (€3,200+/month)'],
                'benefits': ['Up to 4 years', 'Family can work', 'No separate work permit needed', 'Path to 10-year card'],
                'restrictions': ['Salary threshold', 'Degree requirement', 'Contract duration'],
                'is_popular': True,
                'is_renewable': True,
            },
            {
                'name': 'EU Blue Card France',
                'slug': 'eu-blue-card-france',
                'category': 'Work & Residence',
                'description': 'European work permit for highly qualified workers from non-EU countries.',
                'processing_time_min_weeks': 4,
                'processing_time_max_weeks': 12,
                'duration_months': 48,
                'cost_estimate_min': 269,
                'cost_estimate_max': 269,
                'success_rate': 85,
                'requirements': ['Higher education diploma (3+ years)', 'Employment contract 1+ year', 'Salary €56,000+ per year'],
                'benefits': ['EU mobility after 18 months', 'Family reunion', 'Permanent residence path'],
                'restrictions': ['High salary threshold', 'Degree requirement', 'Excluded professions'],
                'is_popular': True,
                'is_renewable': True,
            },
        ]
        
        for visa_data in visas_france:
            VisaType.objects.update_or_create(
                country=france,
                slug=visa_data['slug'],
                defaults=visa_data
            )
        print(f"✅ Created {len(visas_france)} visa types for France")
    
    # Portugal - Tech Visa
    portugal = Country.objects.filter(code='PRT').first()
    if portugal:
        visas_portugal = [
            {
                'name': 'Tech Visa',
                'slug': 'tech-visa',
                'category': 'Work Visa',
                'description': 'Fast-track visa for highly qualified professionals in technology and innovation sectors.',
                'processing_time_min_weeks': 2,
                'processing_time_max_weeks': 4,
                'duration_months': 24,
                'cost_estimate_min': 90,
                'cost_estimate_max': 250,
                'success_rate': 85,
                'requirements': ['Job offer from certified tech company', 'Relevant qualifications', 'Employment contract'],
                'benefits': ['Fast processing', 'Family reunion', 'Path to residency', 'Access to Schengen'],
                'restrictions': ['Company must be certified', 'Tech sector only', 'Must maintain employment'],
                'is_popular': True,
                'is_renewable': True,
            },
            {
                'name': 'D7 Passive Income Visa',
                'slug': 'd7-passive-income',
                'category': 'Residence',
                'description': 'Residence visa for individuals with passive income such as pensions, investments, or remote work.',
                'processing_time_min_weeks': 8,
                'processing_time_max_weeks': 16,
                'duration_months': 24,
                'cost_estimate_min': 175,
                'cost_estimate_max': 350,
                'success_rate': 75,
                'requirements': ['Proof of passive income €9,120+/year', 'No criminal record', 'Health insurance', 'Accommodation in Portugal'],
                'benefits': ['Live in Portugal', 'Access to Schengen', 'Family reunion', 'Path to citizenship after 5 years'],
                'restrictions': ['Income requirement', 'Must reside in Portugal 183+ days', 'No primary employment in Portugal initially'],
                'is_popular': True,
                'is_renewable': True,
            },
        ]
        
        for visa_data in visas_portugal:
            VisaType.objects.update_or_create(
                country=portugal,
                slug=visa_data['slug'],
                defaults=visa_data
            )
        print(f"✅ Created {len(visas_portugal)} visa types for Portugal")
    
    # UAE - Employment Visa and Golden Visa
    uae = Country.objects.filter(code='ARE').first()
    if uae:
        visas_uae = [
            {
                'name': 'Employment Visa',
                'slug': 'employment-visa',
                'category': 'Work Visa',
                'description': 'Standard work visa sponsored by UAE employer for foreign workers.',
                'processing_time_min_weeks': 2,
                'processing_time_max_weeks': 6,
                'duration_months': 24,
                'cost_estimate_min': 2000,
                'cost_estimate_max': 5000,
                'success_rate': 90,
                'requirements': ['Job offer from UAE company', 'Medical fitness test', 'Educational credentials attested', 'Valid passport'],
                'benefits': ['Live and work in UAE', 'Tax-free income', 'Sponsor family', 'Emirates ID'],
                'restrictions': ['Employer sponsorship required', 'Medical clearance', 'Labour card fees', 'Tied to employer'],
                'is_popular': True,
                'is_renewable': True,
            },
            {
                'name': 'Golden Visa (10-Year)',
                'slug': 'golden-visa',
                'category': 'Long-Term Residence',
                'description': 'Long-term residence visa for investors, entrepreneurs, exceptional talents, and outstanding students.',
                'processing_time_min_weeks': 4,
                'processing_time_max_weeks': 12,
                'duration_months': 120,
                'cost_estimate_min': 2000,
                'cost_estimate_max': 4000,
                'success_rate': 80,
                'requirements': ['Meet category criteria (investor/talent/entrepreneur)', 'Valid passport', 'Health insurance', 'No criminal record'],
                'benefits': ['10-year renewable residence', 'Self-sponsorship', 'Sponsor unlimited family', '100% business ownership'],
                'restrictions': ['High qualification bar', 'Category-specific requirements', 'Renewal conditions'],
                'is_popular': True,
                'is_renewable': True,
            },
        ]
        
        for visa_data in visas_uae:
            VisaType.objects.update_or_create(
                country=uae,
                slug=visa_data['slug'],
                defaults=visa_data
            )
        print(f"✅ Created {len(visas_uae)} visa types for UAE")
    
    # Singapore - Employment Pass
    singapore = Country.objects.filter(code='SGP').first()
    if singapore:
        visas_singapore = [
            {
                'name': 'Employment Pass',
                'slug': 'employment-pass',
                'category': 'Work Pass',
                'description': 'Work pass for foreign professionals, managers and executives with job offer.',
                'processing_time_min_weeks': 1,
                'processing_time_max_weeks': 3,
                'duration_months': 24,
                'cost_estimate_min': 105,
                'cost_estimate_max': 225,
                'success_rate': 75,
                'requirements': ['Job offer', 'Minimum salary S$5,600/month (higher for experienced)', 'Acceptable qualifications', 'COMPASS points (from Sep 2023)'],
                'benefits': ['Work in Singapore', 'Bring family (S$6,000+)', 'Path to PR', 'Travel freedom'],
                'restrictions': ['Salary threshold', 'COMPASS framework', 'Employer dependent', 'Quota considerations'],
                'is_popular': True,
                'is_renewable': True,
            },
            {
                'name': 'Overseas Networks & Expertise Pass',
                'slug': 'one-pass',
                'category': 'Work Pass',
                'description': 'Premium pass for top talent in business, arts, sports, and academia with high earnings.',
                'processing_time_min_weeks': 2,
                'processing_time_max_weeks': 6,
                'duration_months': 60,
                'cost_estimate_min': 105,
                'cost_estimate_max': 225,
                'success_rate': 70,
                'requirements': ['Earn S$30,000+/month or equivalent overseas', 'Outstanding achievements', 'Future employment/business in Singapore'],
                'benefits': ['5-year validity', 'Multiple employers', 'Start business', 'Spouse can work'],
                'restrictions': ['Very high salary requirement', 'Highly selective', 'Must maintain earnings'],
                'is_popular': True,
                'is_renewable': True,
            },
        ]
        
        for visa_data in visas_singapore:
            VisaType.objects.update_or_create(
                country=singapore,
                slug=visa_data['slug'],
                defaults=visa_data
            )
        print(f"✅ Created {len(visas_singapore)} visa types for Singapore")
    
    # Japan - Highly Skilled Professional
    japan = Country.objects.filter(code='JPN').first()
    if japan:
        visas_japan = [
            {
                'name': 'Highly Skilled Professional Visa',
                'slug': 'hsp-visa',
                'category': 'Work Visa',
                'description': 'Points-based visa for highly skilled foreign workers in research, technology, or business management.',
                'processing_time_min_weeks': 4,
                'processing_time_max_weeks': 12,
                'duration_months': 60,
                'cost_estimate_min': 200,
                'cost_estimate_max': 400,
                'success_rate': 80,
                'requirements': ['Points 70+ on HSP scale', 'Academic background', 'Professional career', 'Annual salary consideration'],
                'benefits': ['5-year residence', 'PR in 1-3 years', 'Bring parents/domestic help', 'Spouse can work'],
                'restrictions': ['Points threshold', 'Must maintain status', 'Category-specific activities'],
                'is_popular': True,
                'is_renewable': True,
            },
            {
                'name': 'Engineer/Specialist in Humanities Visa',
                'slug': 'engineer-humanities',
                'category': 'Work Visa',
                'description': 'Work visa for engineers, IT professionals, and specialists in humanities/international services.',
                'processing_time_min_weeks': 4,
                'processing_time_max_weeks': 12,
                'duration_months': 60,
                'cost_estimate_min': 200,
                'cost_estimate_max': 400,
                'success_rate': 75,
                'requirements': ['University degree or 10+ years experience', 'Job offer matching qualifications', 'Japanese employment contract'],
                'benefits': ['Work in Japan', '1-5 year validity', 'Path to permanent residence', 'Can change employers'],
                'restrictions': ['Work within designated activities', 'Employer sponsorship', 'Renewal required'],
                'is_popular': True,
                'is_renewable': True,
            },
        ]
        
        for visa_data in visas_japan:
            VisaType.objects.update_or_create(
                country=japan,
                slug=visa_data['slug'],
                defaults=visa_data
            )
        print(f"✅ Created {len(visas_japan)} visa types for Japan")
    
    # South Africa - Critical Skills Visa
    south_africa = Country.objects.filter(code='ZAF').first()
    if south_africa:
        visas_south_africa = [
            {
                'name': 'Critical Skills Work Visa',
                'slug': 'critical-skills',
                'category': 'Work Visa',
                'description': 'Work visa for foreign nationals with skills in critical demand by South African economy.',
                'processing_time_min_weeks': 8,
                'processing_time_max_weeks': 24,
                'duration_months': 60,
                'cost_estimate_min': 200,
                'cost_estimate_max': 500,
                'success_rate': 65,
                'requirements': ['Skills on critical skills list', 'SAQA qualification evaluation', 'Professional body registration', 'Police clearance'],
                'benefits': ['Up to 5 years', 'No job offer required initially', 'Apply for PR after 5 years', 'Bring family'],
                'restrictions': ['Must be on critical skills list', 'Must find work within 12 months', 'Qualification verification'],
                'is_popular': True,
                'is_renewable': True,
            },
            {
                'name': 'General Work Visa',
                'slug': 'general-work',
                'category': 'Work Visa',
                'description': 'Standard work visa for foreign nationals with confirmed job offer from South African employer.',
                'processing_time_min_weeks': 8,
                'processing_time_max_weeks': 24,
                'duration_months': 60,
                'cost_estimate_min': 200,
                'cost_estimate_max': 500,
                'success_rate': 55,
                'requirements': ['Job offer from SA employer', 'Labour market test', 'SAQA verification', 'No local candidate available'],
                'benefits': ['Work for specific employer', 'Up to 5 years', 'Path to permanent residence'],
                'restrictions': ['Employer specific', 'Labour market test required', 'Certificate of no local hire'],
                'is_popular': False,
                'is_renewable': True,
            },
        ]
        
        for visa_data in visas_south_africa:
            VisaType.objects.update_or_create(
                country=south_africa,
                slug=visa_data['slug'],
                defaults=visa_data
            )
        print(f"✅ Created {len(visas_south_africa)} visa types for South Africa")
    
    # Switzerland - Work Permit
    switzerland = Country.objects.filter(code='CHE').first()
    if switzerland:
        visas_switzerland = [
            {
                'name': 'L Permit (Short-Term)',
                'slug': 'l-permit',
                'category': 'Work Permit',
                'description': 'Short-term residence permit for temporary employment contracts up to 12 months.',
                'processing_time_min_weeks': 4,
                'processing_time_max_weeks': 12,
                'duration_months': 12,
                'cost_estimate_min': 150,
                'cost_estimate_max': 400,
                'success_rate': 70,
                'requirements': ['Employment contract under 12 months', 'Employer quota allocation', 'Valid passport', 'Employer sponsorship'],
                'benefits': ['Work in Switzerland', 'Extendable to B permit', 'Schengen access', 'High salaries'],
                'restrictions': ['12-month limit', 'Quota system', 'Employer dependent', 'Priority for Swiss/EU nationals'],
                'is_popular': False,
                'is_renewable': True,
            },
            {
                'name': 'B Permit (Residence)',
                'slug': 'b-permit',
                'category': 'Work Permit',
                'description': 'Residence permit for employment contracts of 12+ months for non-EU/EFTA nationals.',
                'processing_time_min_weeks': 6,
                'processing_time_max_weeks': 16,
                'duration_months': 12,
                'cost_estimate_min': 200,
                'cost_estimate_max': 500,
                'success_rate': 65,
                'requirements': ['Employment contract 12+ months', 'Employer sponsorship', 'Proof of qualifications', 'Swiss labour market need'],
                'benefits': ['Renewable annually', 'Path to C permit (10 years)', 'Family reunion', 'Work in Switzerland'],
                'restrictions': ['Annual quota', 'Labour market test', 'High skill requirement', 'Cantonal approval'],
                'is_popular': True,
                'is_renewable': True,
            },
        ]
        
        for visa_data in visas_switzerland:
            VisaType.objects.update_or_create(
                country=switzerland,
                slug=visa_data['slug'],
                defaults=visa_data
            )
        print(f"✅ Created {len(visas_switzerland)} visa types for Switzerland")
    
    print("\n✅ Visa seeding complete!")

if __name__ == '__main__':
    seed_visa_data()
