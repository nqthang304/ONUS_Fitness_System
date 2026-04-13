from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import HLV, HoiVien
from django.contrib.auth.password_validation import validate_password

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
    
class UserBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'is_active']

class HLVProfileSerializer(serializers.ModelSerializer):
    account_info = UserBaseSerializer(source='Id_TaiKhoan', read_only=True)

    class Meta:
        model = HLV
        fields = [
            'id', 
            'HoTen', 
            'NgaySinh', 
            'GioiTinh', 
            'account_info'
        ]
        
class HoiVienProfileSerializer(serializers.ModelSerializer):
    account_info = UserBaseSerializer(source='Id_TaiKhoan', read_only=True)
    
    ten_hlv = serializers.ReadOnlyField(source='Id_HLV.HoTen')
    
    hlv_id = serializers.ReadOnlyField(source='Id_HLV.id')

    class Meta:
        model = HoiVien
        fields = [
            'id', 
            'HoTen', 
            'NgaySinh', 
            'GioiTinh', 
            'ten_hlv',
            'hlv_id',
            'account_info'
        ]
        
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        # Kiểm tra độ dài
        if len(value) < 8:
            raise serializers.ValidationError("Mật khẩu mới phải có tối thiểu 8 ký tự.")
        # Kiểm tra có chữ hoa
        if not any(c.isupper() for c in value):
            raise serializers.ValidationError("Mật khẩu phải chứa ít nhất 1 ký tự hoa.")
        # Kiểm tra có chữ thường
        if not any(c.islower() for c in value):
            raise serializers.ValidationError("Mật khẩu phải chứa ít nhất 1 ký tự thường.")
        # Kiểm tra có số
        if not any(c.isdigit() for c in value):
            raise serializers.ValidationError("Mật khẩu phải chứa ít nhất 1 chữ số.")
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Mật khẩu xác nhận không khớp."})
        return attrs