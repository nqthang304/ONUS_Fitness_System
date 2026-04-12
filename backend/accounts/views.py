from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth.models import User
from .models import HLV, HoiVien
from .serializers import CustomTokenObtainPairSerializer

class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def _is_admin_user(self, user):
        return user.is_staff or user.groups.filter(name='admin').exists()

    def _resolve_target_user(self, identifier):
        if identifier is None or identifier == '':
            return None

        # Thử theo id trước, sau đó fallback sang username vì username ở hệ thống là số điện thoại
        try:
            return User.objects.get(id=identifier)
        except (User.DoesNotExist, ValueError, TypeError):
            pass

        try:
            return User.objects.get(username=identifier)
        except User.DoesNotExist:
            return None

    def _build_profile_response(self, user_to_fetch):
        if user_to_fetch.groups.filter(name='hlv').exists():
            try:
                profile = HLV.objects.get(Id_TaiKhoan=user_to_fetch)
            except HLV.DoesNotExist:
                return None

            return {
                'id': profile.pk,
                'HoTen': profile.HoTen,
                'NgaySinh': profile.NgaySinh,
                'GioiTinh': profile.GioiTinh,
                'account_info': {
                    'username': user_to_fetch.username,
                    'is_active': user_to_fetch.is_active,
                },
                'role': 'hlv',
            }

        if user_to_fetch.groups.filter(name='hoivien').exists():
            try:
                profile = HoiVien.objects.get(Id_TaiKhoan=user_to_fetch)
            except HoiVien.DoesNotExist:
                return None

            return {
                'id': profile.pk,
                'Id_HLV': profile.Id_HLV.pk if profile.Id_HLV else None,
                'HoTen': profile.HoTen,
                'NgaySinh': profile.NgaySinh,
                'GioiTinh': profile.GioiTinh,
                'ten_hlv': profile.Id_HLV.HoTen if profile.Id_HLV else None,
                'hlv_id': profile.Id_HLV.pk if profile.Id_HLV else None,
                'account_info': {
                    'username': user_to_fetch.username,
                    'is_active': user_to_fetch.is_active,
                },
                'role': 'hoivien',
            }

        return {
            'HoTen': 'Admin',
            'role': 'admin',
            'username': user_to_fetch.username,
            'account_info': {
                'username': user_to_fetch.username,
                'is_active': user_to_fetch.is_active,
            },
        }

    def get(self, request):
        # Hỗ trợ cả id hoặc username từ query params
        target_id = request.query_params.get('id')
        target_username = request.query_params.get('username')
        current_user = request.user
        user_to_fetch = None
        target_identifier = target_id or target_username

        # 1. Nếu không truyền gì, mặc định là chính mình
        if not target_identifier:
            user_to_fetch = current_user
        else:
            # Kiểm tra quyền (HLV hoặc Admin)
            is_hlv = current_user.groups.filter(name='hlv').exists()
            is_admin = self._is_admin_user(current_user)

            # Chủ tài khoản luôn được xem hồ sơ của chính mình
            if str(target_id or target_username) == str(current_user.id) or str(target_id or target_username) == str(current_user.username):
                user_to_fetch = current_user
            else:
                if not (is_hlv or is_admin):
                    return Response({"detail": "Bạn không có quyền xem hồ sơ này."}, status=status.HTTP_403_FORBIDDEN)

                user_to_fetch = self._resolve_target_user(target_identifier)
                if not user_to_fetch:
                    return Response({"detail": "Người dùng không tồn tại."}, status=status.HTTP_404_NOT_FOUND)

                # Nếu là HLV, chỉ cho xem hội viên thuộc quản lý
                if is_hlv and not is_admin:
                    if not user_to_fetch.groups.filter(name='hoivien').exists():
                        return Response({"detail": "HLV chỉ có thể xem hồ sơ hội viên."}, status=status.HTTP_403_FORBIDDEN)

                    exists = HoiVien.objects.filter(
                        Id_TaiKhoan=user_to_fetch,
                        Id_HLV__Id_TaiKhoan=current_user,
                    ).exists()
                    if not exists:
                        return Response({"detail": "Hội viên không thuộc quản lý."}, status=status.HTTP_403_FORBIDDEN)

        # 2. LOGIC TRẢ DỮ LIỆU DỰA TRÊN ROLE CỦA TARGET
        data = self._build_profile_response(user_to_fetch)
        if data is None:
            return Response({"detail": "Không tìm thấy hồ sơ tương ứng."}, status=status.HTTP_404_NOT_FOUND)

        return Response(data, status=status.HTTP_200_OK)