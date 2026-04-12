from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group
from datetime import date, time

from accounts.models import HLV, HoiVien
from fitness.models import ChiSoCoThe, LichTap
from social.models import BaiDang


class Command(BaseCommand):
    help = 'Tự động tạo Dữ liệu mẫu với Username là SĐT và 3 Role'

    def handle(self, *args, **kwargs):
        self.stdout.write("Bắt đầu gieo mầm dữ liệu...")

        # ==========================================
        # 1. TẠO 3 NHÓM ROLE CHUẨN
        # ==========================================
        grp_admin, _ = Group.objects.get_or_create(name='admin')
        grp_hlv, _ = Group.objects.get_or_create(name='hlv')
        grp_hoivien, _ = Group.objects.get_or_create(name='hoivien')
        self.stdout.write("✅ Đã tạo 3 Role: admin, hlv, hoivien.")

        # ==========================================
        # 2. TẠO 3 LOẠI TÀI KHOẢN (Username là SĐT)
        # ==========================================

        # 2.1. Tạo ADMIN (SĐT: 0999999999)
        # Sử dụng get_or_create để không bị lỗi nếu chạy lại nhiều lần
        user_admin, created_admin = User.objects.get_or_create(username='0999999999')
        if created_admin:
            user_admin.set_password('Abc@12345')
            user_admin.save()
            user_admin.groups.add(grp_admin)
            self.stdout.write("✅ Đã tạo ADMIN (SĐT: 0999999999 - Pass: Abc@12345)")

        # 2.2. Tạo HUẤN LUYỆN VIÊN (SĐT: 0888888888)
        user_hlv, created_hlv = User.objects.get_or_create(username='0888888888')
        if created_hlv:
            user_hlv.set_password('Abc@12345')
            user_hlv.save()
            user_hlv.groups.add(grp_hlv)

            # Tạo Profile HLV
            hlv_profile = HLV.objects.create(
                Id_TaiKhoan=user_hlv,
                HoTen='Trần Trung Kiên',
                NgaySinh=date(1995, 5, 10),
                GioiTinh='Nam'
            )
            self.stdout.write("✅ Đã tạo HLV (SĐT: 0888888888 - Pass: Abc@12345)")
        else:
            hlv_profile = HLV.objects.get(Id_TaiKhoan=user_hlv)

        # 2.3. Tạo HỘI VIÊN (SĐT: 0777777777)
        user_hv, created_hv = User.objects.get_or_create(username='0777777777')
        if created_hv:
            user_hv.set_password('Abc@12345')
            user_hv.save()
            user_hv.groups.add(grp_hoivien)

            # Tạo Profile Hội viên, gán cho HLV Kiên
            hv_profile = HoiVien.objects.create(
                Id_TaiKhoan=user_hv,
                Id_HLV=hlv_profile,
                HoTen='Nguyễn Ngọc Lan',
                NgaySinh=date(2000, 1, 1),
                GioiTinh='Nữ'
            )
            self.stdout.write("✅ Đã tạo HỘI VIÊN (SĐT: 0777777777 - Pass: Abc@12345)")
        else:
            hv_profile = HoiVien.objects.get(Id_TaiKhoan=user_hv)

        # ==========================================
        # 3. TẠO DỮ LIỆU FITNESS
        # ==========================================
        if not ChiSoCoThe.objects.filter(Id_HoiVien=hv_profile).exists():
            ChiSoCoThe.objects.create(
                Id_HoiVien=hv_profile,
                CanNang=55.5, ChieuCao=160.0, BMI=21.6, PhanTramMo=25.0
            )

            LichTap.objects.create(
                Id_HoiVien=hv_profile,
                ThuTrongTuan=2, GioBatDau=time(18, 0), GioKetThuc=time(19, 30)
            )

        # ==========================================
        # 4. TẠO DỮ LIỆU SOCIAL
        # ==========================================
        if not BaiDang.objects.filter(Id_NguoiDang=user_hlv).exists():
            BaiDang.objects.create(
                Id_NguoiDang=user_hlv,
                NoiDung='1 tuần năng động 💪'
            )

        self.stdout.write(self.style.SUCCESS("🎉 HOÀN TẤT TẠO SEED DATA!"))