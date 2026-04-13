from django.db import models

class ChiSoCoThe(models.Model):
    Id_HoiVien = models.ForeignKey('accounts.HoiVien', on_delete=models.CASCADE)
    CanNang = models.DecimalField(max_digits=5, decimal_places=2)
    ChieuCao = models.DecimalField(max_digits=5, decimal_places=2)
    VongBung = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    VongMong = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    BMI = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    PhanTramMo = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    PhanTramCo = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    TyLeTraoDoiChat = models.IntegerField(null=True, blank=True)
    NgayTao = models.DateField(auto_now_add=True)


class LichTap(models.Model):
    Id_HoiVien = models.ForeignKey('accounts.HoiVien', on_delete=models.CASCADE)
    ThuTrongTuan = models.SmallIntegerField() # Ánh xạ từ TINYINT
    GioBatDau = models.TimeField()
    GioKetThuc = models.TimeField()


class BuaAn(models.Model):
    Id_HoiVien = models.ForeignKey('accounts.HoiVien', on_delete=models.CASCADE)
    TenBua = models.CharField(max_length=20)


class ChiTietBuaAn(models.Model):
    # Sử dụng Id_LichAn như trong ERD và thiết kế lớp
    Id_LichAn = models.ForeignKey(BuaAn, on_delete=models.CASCADE)
    TenThucPham = models.CharField(max_length=100)
    Luong = models.CharField(max_length=50)
    Calo = models.DecimalField(max_digits=7, decimal_places=2)
    Protein = models.DecimalField(max_digits=6, decimal_places=2)
    Carb = models.DecimalField(max_digits=6, decimal_places=2)
    Fat = models.DecimalField(max_digits=6, decimal_places=2)


class BaiTap(models.Model):
    Id_HoiVien = models.ForeignKey('accounts.HoiVien', on_delete=models.CASCADE)
    ThuTuNgayTap = models.CharField(max_length=20)


class ChiTietBaiTap(models.Model):

    MUC_LUC_CHOICES = [
        ('KhoiDong', 'KhoiDong'),
        ('BaiTapChinh', 'BaiTapChinh'),
        ('Cardio', 'Cardio'),
        ('GianCo', 'GianCo'),
    ]

    Id_BaiTap = models.ForeignKey(BaiTap, on_delete=models.CASCADE)
    MucLuc = models.CharField(max_length=20, choices=MUC_LUC_CHOICES, null=True, blank=True)
    TenBai = models.CharField(max_length=255)
    ThoiGian = models.CharField(max_length=50, null=True, blank=True)
    SoLan = models.IntegerField(null=True, blank=True)
    SoHiep = models.IntegerField(null=True, blank=True)
    Nghi = models.CharField(max_length=50, null=True, blank=True)
    CuongDo = models.CharField(max_length=20, null=True, blank=True)