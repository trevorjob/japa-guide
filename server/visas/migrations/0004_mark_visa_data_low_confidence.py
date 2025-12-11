# Generated manually for data provenance tracking
from django.db import migrations


def mark_visa_data_low_confidence(apps, schema_editor):
    """
    Mark all existing visa data as low confidence and needs_review=True.
    This applies to all visa data that was manually seeded before we had
    proper data provenance tracking in place.
    """
    VisaType = apps.get_model('visas', 'VisaType')
    
    # Update all visa types to low confidence and needs_review
    updated = VisaType.objects.all().update(
        data_confidence='low',
        needs_review=True
    )
    print(f"\n    Marked {updated} visa types as low confidence, needs_review=True")


def reverse_mark_visa_data(apps, schema_editor):
    """
    Reverse the migration - set back to medium confidence.
    """
    VisaType = apps.get_model('visas', 'VisaType')
    VisaType.objects.all().update(
        data_confidence='medium',
        needs_review=False
    )


class Migration(migrations.Migration):

    dependencies = [
        ('visas', '0003_add_data_transparency_fields'),
    ]

    operations = [
        migrations.RunPython(
            mark_visa_data_low_confidence,
            reverse_mark_visa_data
        ),
    ]
