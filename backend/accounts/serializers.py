from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import HLV, HoiVien


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # 1. Gọi hàm gốc để nó kiểm tra SĐT/Password và cấp Token
        data = super().validate(attrs)

        # 2. Lấy Object User đang đăng nhập thành công
        user = self.user

        # 3. Lấy Role (Từ auth_group)
        role = "unknown"
        if user.groups.exists():
            role = user.groups.first().name

        # 4. Lấy Họ Tên (Dựa vào Role để móc sang bảng Profile tương ứng)
        ho_ten = "Admin"  # Mặc định nếu là admin (vì admin không có bảng Profile)
        if role == 'hlv':
            try:
                profile = HLV.objects.get(Id_TaiKhoan=user)
                ho_ten = profile.HoTen
            except HLV.DoesNotExist:
                ho_ten = "Huấn Luyện Viên"

        elif role == 'hoivien':
            try:
                profile = HoiVien.objects.get(Id_TaiKhoan=user)
                ho_ten = profile.HoTen
            except HoiVien.DoesNotExist:
                ho_ten = "Hội Viên"

        # 5. Gói ghém tất cả lại thành 1 cục JSON xịn xò trả cho FE
        data['user'] = {
            'username': user.username,  # Đây chính là Số điện thoại
            'role': role,
            'ho_ten': ho_ten
        }

        return data