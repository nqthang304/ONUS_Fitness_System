from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fitness', '0003_alter_baitap_id_hoivien_alter_buaan_id_hoivien_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='chitietbuaan',
            name='Luong',
            field=models.CharField(max_length=50),
        ),
    ]
