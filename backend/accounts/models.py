from django.db import models
from django.contrib.auth.models import User

class HLV(models.Model):
    Id_TaiKhoan = models.OneToOneField(User, on_delete=models.CASCADE)
    HoTen = models.CharField(max_length=100)
    NgaySinh = models.DateField()
    GioiTinh = models.CharField(max_length=10)

    def __str__(self):
        return self.HoTen


class HoiVien(models.Model):
    Id_TaiKhoan = models.OneToOneField(User, on_delete=models.CASCADE)
    Id_HLV = models.ForeignKey(HLV, on_delete=models.SET_NULL, null=True, blank=True)
    HoTen = models.CharField(max_length=100)
    NgaySinh = models.DateField()
    GioiTinh = models.CharField(max_length=10)

    def __str__(self):
        return self.HoTen