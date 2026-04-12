from django.db import models
from django.contrib.auth.models import User

class BaiDang(models.Model):
    Id_NguoiDang = models.ForeignKey(User, on_delete=models.CASCADE)
    NoiDung = models.CharField(max_length=2000)
    ThoiGianDang = models.DateTimeField(auto_now_add=True)
    anhURL = models.ImageField(upload_to='posts/', null=True, blank=True)


class TuongTac(models.Model):
    Id_BaiDang = models.ForeignKey(BaiDang, on_delete=models.CASCADE)
    Id_NguoiDung = models.ForeignKey(User, on_delete=models.CASCADE)


class BinhLuan(models.Model):
    Id_BaiDang = models.ForeignKey(BaiDang, on_delete=models.CASCADE)
    Id_NguoiDung = models.ForeignKey(User, on_delete=models.CASCADE)
    NoiDung = models.CharField(max_length=1000)
    ThoiGianBinhLuan = models.DateTimeField(auto_now_add=True)


class TinNhan(models.Model):
    Id_NguoiGui = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tin_nhan_gui')
    Id_NguoiNhan = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tin_nhan_nhan')
    NoiDung = models.CharField(max_length=500)
    ThoiGianGui = models.DateTimeField(auto_now_add=True)
    DaXem = models.BooleanField(default=False)


class ThongBao(models.Model):
    TieuDe = models.CharField(max_length=255)
    NoiDung = models.CharField(max_length=2000)
    LoaiThongBao = models.CharField(max_length=50, null=True, blank=True)
    NgayTao = models.DateTimeField(auto_now_add=True)


class ChiTietThongBao(models.Model):
    Id_NguoiNhan = models.ForeignKey(User, on_delete=models.CASCADE)
    Id_ThongBao = models.ForeignKey(ThongBao, on_delete=models.CASCADE)
    DaXem = models.BooleanField(default=False)