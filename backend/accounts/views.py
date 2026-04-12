from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import HLV, HoiVien
from .serializers import HLVProfileSerializer, HoiVienProfileSerializer, CustomTokenObtainPairSerializer

class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Lấy username từ tham số URL (ví dụ: /api/profile/?username=0777...)
        target_username = request.query_params.get('username')
        current_user = request.user
        
        # Biến xác định xem đối tượng cần lấy là ai
        user_to_fetch = None
        
        # 1. LOGIC XÁC ĐỊNH ĐỐI TƯỢNG (Target)
        if not target_username or target_username == current_user.username:
            # Trường hợp: Tự xem chính mình
            user_to_fetch = current_user
        else:
            # Trường hợp: Xem người khác (Chỉ HLV hoặc Admin mới được phép)
            is_hlv = current_user.groups.filter(name='hlv').exists()
            is_admin = current_user.is_staff
            
            if not (is_hlv or is_admin):
                return Response({"detail": "Bạn không có quyền xem hồ sơ này."}, status=403)
            
            from django.contrib.auth.models import User
            try:
                user_to_fetch = User.objects.get(username=target_username)
                
                # Nâng cao: Nếu là HLV, kiểm tra xem HoiVien này có thuộc quyền quản lý không
                if is_hlv and not is_admin:
                    exists = HoiVien.objects.filter(Id_TaiKhoan=user_to_fetch, Id_HLV__Id_TaiKhoan=current_user).exists()
                    if not exists:
                        return Response({"detail": "Hội viên này không thuộc quản lý của bạn."}, status=403)
            except User.DoesNotExist:
                return Response({"detail": "Người dùng không tồn tại."}, status=404)

        # 2. LOGIC TRẢ DỮ LIỆU DỰA TRÊN ROLE CỦA TARGET
        if user_to_fetch.groups.filter(name='hlv').exists():
            profile = HLV.objects.get(Id_TaiKhoan=user_to_fetch)
            serializer = HLVProfileSerializer(profile)
            data = serializer.data
            data['role'] = 'hlv' # Gắn thêm role để FE dễ xử lý
            return Response(data)
            
        elif user_to_fetch.groups.filter(name='hoivien').exists():
            profile = HoiVien.objects.get(Id_TaiKhoan=user_to_fetch)
            serializer = HoiVienProfileSerializer(profile)
            data = serializer.data
            data['role'] = 'hoivien'
            return Response(data)
            
        return Response({"HoTen": "Admin", "role": "admin", "username": user_to_fetch.username})