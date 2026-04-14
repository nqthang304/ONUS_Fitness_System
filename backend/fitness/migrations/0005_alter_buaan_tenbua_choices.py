from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fitness', '0004_alter_chitietbuaan_luong'),
    ]

    operations = [
        migrations.AlterField(
            model_name='buaan',
            name='TenBua',
            field=models.CharField(
                choices=[
                    ('BuaSang', 'BuaSang'),
                    ('BuaTrua', 'BuaTrua'),
                    ('BuaToi', 'BuaToi'),
                    ('BuaPhu', 'BuaPhu'),
                ],
                max_length=20,
            ),
        ),
    ]
