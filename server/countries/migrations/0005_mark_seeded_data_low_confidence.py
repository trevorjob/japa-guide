# Generated manually for data provenance tracking
from django.db import migrations


def mark_seeded_data_low_confidence(apps, schema_editor):
    """
    Mark all existing data as low confidence and needs_review=True.
    This applies to all data that was manually seeded before we had
    proper data provenance tracking in place.
    """
    Country = apps.get_model('countries', 'Country')
    
    # Update all countries to low confidence and needs_review
    updated = Country.objects.all().update(
        data_confidence='low',
        needs_review=True
    )
    print(f"\n    Marked {updated} countries as low confidence, needs_review=True")


def reverse_mark_seeded_data(apps, schema_editor):
    """
    Reverse the migration - set back to medium confidence.
    """
    Country = apps.get_model('countries', 'Country')
    Country.objects.all().update(
        data_confidence='medium',
        needs_review=False
    )


class Migration(migrations.Migration):

    dependencies = [
        ('countries', '0004_add_source_and_data_confidence'),
    ]

    operations = [
        migrations.RunPython(
            mark_seeded_data_low_confidence,
            reverse_mark_seeded_data
        ),
    ]
