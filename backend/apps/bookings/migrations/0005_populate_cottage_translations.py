from django.db import migrations

TRANSLATIONS = {
    1: {
        'name_en': 'Forest Clearing',
        'name_cs': 'Lesní mýtina',
        'description_en': 'A cozy cottage called "Forest Clearing" in the eco-park.',
        'description_cs': 'Útulná chata „Lesní mýtina“ v ekoparku.',
    },
    2: {
        'name_en': 'Quiet Harbor',
        'name_cs': 'Tichý přístav',
        'description_en': 'A cozy cottage called "Quiet Harbor" in the eco-park.',
        'description_cs': 'Útulná chata „Tichý přístav“ v ekoparku.',
    },
    3: {
        'name_en': 'Pine Forest',
        'name_cs': 'Borový les',
        'description_en': 'A cozy cottage called "Pine Forest" in the eco-park.',
        'description_cs': 'Útulná chata „Borový les“ v ekoparku.',
    },
    4: {
        'name_en': 'Daisy Meadow',
        'name_cs': 'Kopretinová louka',
        'description_en': 'A cozy cottage called "Daisy Meadow" in the eco-park.',
        'description_cs': 'Útulná chata „Kopretinová louka“ v ekoparku.',
    },
    5: {
        'name_en': 'Lakeside',
        'name_cs': 'Jezerní pobřeží',
        'description_en': 'A cozy cottage called "Lakeside" in the eco-park.',
        'description_cs': 'Útulná chata „Jezerní pobřeží“ v ekoparku.',
    },
}


def populate_translations(apps, schema_editor):
    Cottage = apps.get_model('bookings', 'Cottage')
    for cottage in Cottage.objects.all():
        values = TRANSLATIONS.get(cottage.number)
        if not values:
            continue
        for field, value in values.items():
            setattr(cottage, field, value)
        cottage.save(update_fields=list(values.keys()))


def reverse_noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0004_cottage_description_cs_cottage_description_en_and_more'),
    ]

    operations = [
        migrations.RunPython(populate_translations, reverse_noop),
    ]
