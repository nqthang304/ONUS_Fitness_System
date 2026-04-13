from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth.models import Group, User
from django.db import transaction
from django.db.models.deletion import ProtectedError
from datetime import date
import logging
import json
from .models import HLV, HoiVien
from .serializers import CustomTokenObtainPairSerializer, ChangePasswordSerializer, HoiVienProfileSerializer, HLVProfileSerializer
from fitness.models import LichTap

logger = logging.getLogger(__name__)

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

            data = HLVProfileSerializer(profile).data
            data['role'] = 'hlv'
            return data

        if user_to_fetch.groups.filter(name='hoivien').exists():
            try:
                profile = HoiVien.objects.get(Id_TaiKhoan=user_to_fetch)
            except HoiVien.DoesNotExist:
                return None

            data = HoiVienProfileSerializer(profile).data
            data['Id_HLV'] = data.get('hlv_id')
            data['role'] = 'hoivien'
            return data

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
    
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        print(f"[ChangePasswordView] POST request received")
        print(f"[ChangePasswordView] request.data: {request.data}")
        
        serializer = ChangePasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            print(f"[ChangePasswordView] Serializer is valid")
            user = request.user
            print(f"[ChangePasswordView] User: {user.username}")
            
            # 1. Kiểm tra mật khẩu cũ
            if not user.check_password(serializer.data.get("old_password")):
                print(f"[ChangePasswordView] Old password is incorrect")
                return Response(
                    {"old_password": ["Mật khẩu cũ không chính xác."]}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # 2. Kiểm tra mật khẩu mới không được trùng mật khẩu cũ
            if serializer.data.get("old_password") == serializer.data.get("new_password"):
                print(f"[ChangePasswordView] New password is same as old password")
                return Response(
                    {"new_password": ["Mật khẩu mới không được trùng với mật khẩu cũ."]},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # 3. Đặt mật khẩu mới (set_password sẽ tự động mã hóa mật khẩu)
            print(f"[ChangePasswordView] Setting new password")
            user.set_password(serializer.data.get("new_password"))
            user.save()
            print(f"[ChangePasswordView] Password changed successfully for user: {user.username}")
            
            return Response(
                {"detail": "Đổi mật khẩu thành công."}, 
                status=status.HTTP_200_OK
            )
        
        print(f"[ChangePasswordView] Serializer is invalid: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class TrainerMemberListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Kiểm tra Role linh hoạt hơn (không phân biệt hoa thường)
        is_hlv = user.groups.filter(name__iexact='hlv').exists()
        if not is_hlv:
            return Response({"detail": "Bạn không có quyền xem danh sách này."}, status=403)

        try:
            # 1. Lấy profile HLV
            try:
                hlv_profile = HLV.objects.get(Id_TaiKhoan=user)
            except HLV.DoesNotExist:
                return Response({"detail": "Tài khoản của bạn chưa được thiết lập hồ sơ HLV."}, status=404)

            # 2. Lấy danh sách hội viên và tối ưu query (select_related để tránh lỗi NULL và tăng tốc)
            # select_related giúp lấy luôn thông tin HLV để Serializer không bị lỗi AttributeError
            members = HoiVien.objects.filter(Id_HLV=hlv_profile).select_related('Id_HLV', 'Id_TaiKhoan')

            serializer = HoiVienProfileSerializer(members, many=True)
            return Response(serializer.data)

        except Exception as e:
            # In lỗi ra terminal của Django để bạn đọc được cụ thể là lỗi gì
            print(f"CRITICAL ERROR: {str(e)}")
            return Response({"detail": "Lỗi hệ thống nội bộ."}, status=500)


class AccountListView(APIView):
    permission_classes = [IsAuthenticated]

    def _is_admin_user(self, user):
        return user.is_staff or user.groups.filter(name='admin').exists()

    def get(self, request):
        if not self._is_admin_user(request.user):
            return Response({"detail": "Bạn không có quyền truy cập."}, status=status.HTTP_403_FORBIDDEN)

        users = User.objects.all().prefetch_related('groups')
        hlv_profiles = {
            p.Id_TaiKhoan_id: p
            for p in HLV.objects.select_related('Id_TaiKhoan')
        }
        hoivien_profiles = {
            p.Id_TaiKhoan_id: p
            for p in HoiVien.objects.select_related('Id_HLV__Id_TaiKhoan', 'Id_TaiKhoan')
        }

        results = []
        for user in users:
            group_names = [g.name.lower() for g in user.groups.all()]
            role = group_names[0] if group_names else ('admin' if user.is_staff else 'unknown')

            name = 'Chưa cập nhật'
            dob = None
            gender = None
            hlv_id = None

            if role == 'hlv':
                hlv = hlv_profiles.get(user.id)
                if hlv:
                    name = hlv.HoTen
                    dob = hlv.NgaySinh
                    gender = hlv.GioiTinh
            elif role == 'hoivien':
                hv = hoivien_profiles.get(user.id)
                if hv:
                    name = hv.HoTen
                    dob = hv.NgaySinh
                    gender = hv.GioiTinh
                    hlv_id = hv.Id_HLV.Id_TaiKhoan_id if hv.Id_HLV else None
            elif role == 'admin':
                name = 'Quản trị hệ thống'

            results.append({
                'id': user.id,
                'phone': user.username,
                'role': role,
                'status': 'Hoạt động' if user.is_active else 'Bị khóa',
                'is_active': user.is_active,
                'name': name,
                'dob': dob,
                'gender': gender,
                'hlv_id': hlv_id,
            })

        return Response(results, status=status.HTTP_200_OK)

    def post(self, request):
        if not self._is_admin_user(request.user):
            return Response({"detail": "Bạn không có quyền truy cập."}, status=status.HTTP_403_FORBIDDEN)

        payload = request.data if hasattr(request, 'data') else {}
        name = str(payload.get('name', '')).strip()
        phone = str(payload.get('phone', '')).strip()
        role_input = str(payload.get('role', '')).strip().lower()
        dob_input = payload.get('dob')
        gender = str(payload.get('gender', '')).strip() or 'Nam'
        hlv_id_input = payload.get('hlv_id')
        password = str(payload.get('password') or 'Abc@12345')

        role_alias = {
            'hlv': 'hlv',
            'huấn luyện viên': 'hlv',
            'huan luyen vien': 'hlv',
            'hoivien': 'hoivien',
            'hội viên': 'hoivien',
            'hoi vien': 'hoivien',
        }
        role = role_alias.get(role_input, role_input)

        if not name or not phone or role not in ('hlv', 'hoivien'):
            return Response(
                {"detail": "Thiếu thông tin bắt buộc hoặc vai trò không hợp lệ."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=phone).exists():
            return Response({"detail": "Số điện thoại đã tồn tại."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            dob = date.fromisoformat(str(dob_input)) if dob_input else None
        except ValueError:
            return Response({"detail": "Ngày sinh không hợp lệ. Dùng định dạng YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        if not dob:
            return Response({"detail": "Thiếu ngày sinh."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            user = User.objects.create(username=phone, is_active=True)
            user.set_password(password)
            user.save()

            role_group, _ = Group.objects.get_or_create(name=role)
            user.groups.add(role_group)

            hlv_ref = None
            if role == 'hoivien' and hlv_id_input not in (None, ''):
                try:
                    hlv_ref = HLV.objects.get(Id_TaiKhoan_id=int(hlv_id_input))
                except (HLV.DoesNotExist, ValueError, TypeError):
                    return Response({"detail": "HLV phụ trách không tồn tại."}, status=status.HTTP_400_BAD_REQUEST)
            elif role == 'hoivien':
                return Response({"detail": "Hội viên cần chọn HLV phụ trách."}, status=status.HTTP_400_BAD_REQUEST)

            if role == 'hlv':
                HLV.objects.create(
                    Id_TaiKhoan=user,
                    HoTen=name,
                    NgaySinh=dob,
                    GioiTinh=gender,
                )
            else:
                HoiVien.objects.create(
                    Id_TaiKhoan=user,
                    Id_HLV=hlv_ref,
                    HoTen=name,
                    NgaySinh=dob,
                    GioiTinh=gender,
                )

        return Response(
            {
                'id': user.id,
                'phone': user.username,
                'role': role,
                'status': 'Hoạt động',
                'is_active': True,
                'name': name,
                'dob': dob,
                'gender': gender,
                'hlv_id': hlv_ref.Id_TaiKhoan_id if role == 'hoivien' and hlv_ref else None,
            },
            status=status.HTTP_201_CREATED,
        )


class AccountStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def _is_admin_user(self, user):
        return user.is_staff or user.groups.filter(name='admin').exists()

    def patch(self, request, user_id):
        if not self._is_admin_user(request.user):
            return Response({"detail": "Bạn không có quyền truy cập."}, status=status.HTTP_403_FORBIDDEN)

        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "Tài khoản không tồn tại."}, status=status.HTTP_404_NOT_FOUND)

        payload = getattr(request, 'data', None)
        if payload is None:
            try:
                payload = json.loads(request.body.decode('utf-8')) if request.body else {}
            except (ValueError, UnicodeDecodeError):
                payload = request.POST or {}

        is_active = payload.get('is_active')
        if is_active is None:
            return Response({"detail": "Thiếu trường is_active."}, status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(is_active, bool):
            return Response({"detail": "is_active phải là boolean."}, status=status.HTTP_400_BAD_REQUEST)

        target_user.is_active = is_active
        target_user.save(update_fields=['is_active'])

        return Response(
            {
                'id': target_user.id,
                'is_active': target_user.is_active,
                'status': 'Hoạt động' if target_user.is_active else 'Bị khóa',
            },
            status=status.HTTP_200_OK,
        )


class AccountDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _is_admin_user(self, user):
        return user.is_staff or user.groups.filter(name='admin').exists()

    def _normalize_role(self, user):
        if user.groups.filter(name='hlv').exists():
            return 'hlv'
        if user.groups.filter(name='hoivien').exists():
            return 'hoivien'
        if user.is_staff or user.groups.filter(name='admin').exists():
            return 'admin'
        return 'unknown'

    def _parse_dob(self, dob_input):
        if dob_input in (None, ''):
            return None
        try:
            return date.fromisoformat(str(dob_input))
        except ValueError:
            return 'invalid'

    def patch(self, request, user_id):
        if not self._is_admin_user(request.user):
            return Response({"detail": "Bạn không có quyền truy cập."}, status=status.HTTP_403_FORBIDDEN)

        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "Tài khoản không tồn tại."}, status=status.HTTP_404_NOT_FOUND)

        role = self._normalize_role(target_user)
        if role not in ('hlv', 'hoivien'):
            return Response({"detail": "Chỉ hỗ trợ cập nhật tài khoản HLV/Hội viên."}, status=status.HTTP_400_BAD_REQUEST)

        payload = request.data if hasattr(request, 'data') else {}
        name = payload.get('name')
        dob_input = payload.get('dob')
        gender = payload.get('gender')
        phone = payload.get('phone')
        hlv_id_input = payload.get('hlv_id')

        if name is not None:
            name = str(name).strip()
            if not name:
                return Response({"detail": "Họ tên không được để trống."}, status=status.HTTP_400_BAD_REQUEST)

        parsed_dob = self._parse_dob(dob_input)
        if parsed_dob == 'invalid':
            return Response({"detail": "Ngày sinh không hợp lệ. Dùng định dạng YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        if phone is not None:
            phone = str(phone).strip()
            if not phone:
                return Response({"detail": "Số điện thoại không được để trống."}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.exclude(id=target_user.id).filter(username=phone).exists():
                return Response({"detail": "Số điện thoại đã tồn tại."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            if phone is not None and target_user.username != phone:
                target_user.username = phone
                target_user.save(update_fields=['username'])

            if role == 'hlv':
                try:
                    profile = HLV.objects.get(Id_TaiKhoan=target_user)
                except HLV.DoesNotExist:
                    return Response({"detail": "Không tìm thấy hồ sơ HLV."}, status=status.HTTP_404_NOT_FOUND)

                update_fields = []
                if name is not None:
                    profile.HoTen = name
                    update_fields.append('HoTen')
                if parsed_dob is not None:
                    profile.NgaySinh = parsed_dob
                    update_fields.append('NgaySinh')
                if gender is not None:
                    profile.GioiTinh = str(gender).strip() or profile.GioiTinh
                    update_fields.append('GioiTinh')

                if update_fields:
                    profile.save(update_fields=update_fields)

                result_name = profile.HoTen
                result_dob = profile.NgaySinh
                result_gender = profile.GioiTinh
                result_hlv_id = None
            else:
                try:
                    profile = HoiVien.objects.get(Id_TaiKhoan=target_user)
                except HoiVien.DoesNotExist:
                    return Response({"detail": "Không tìm thấy hồ sơ hội viên."}, status=status.HTTP_404_NOT_FOUND)

                update_fields = []
                if name is not None:
                    profile.HoTen = name
                    update_fields.append('HoTen')
                if parsed_dob is not None:
                    profile.NgaySinh = parsed_dob
                    update_fields.append('NgaySinh')
                if gender is not None:
                    profile.GioiTinh = str(gender).strip() or profile.GioiTinh
                    update_fields.append('GioiTinh')

                if hlv_id_input is not None:
                    if hlv_id_input in ('', 'null'):
                        profile.Id_HLV = None
                    else:
                        try:
                            profile.Id_HLV = HLV.objects.get(Id_TaiKhoan_id=int(hlv_id_input))
                        except (HLV.DoesNotExist, ValueError, TypeError):
                            return Response({"detail": "HLV phụ trách không tồn tại."}, status=status.HTTP_400_BAD_REQUEST)
                    update_fields.append('Id_HLV')

                if update_fields:
                    profile.save(update_fields=update_fields)

                result_name = profile.HoTen
                result_dob = profile.NgaySinh
                result_gender = profile.GioiTinh
                result_hlv_id = profile.Id_HLV.Id_TaiKhoan_id if profile.Id_HLV else None

        return Response(
            {
                'id': target_user.id,
                'phone': target_user.username,
                'role': role,
                'status': 'Hoạt động' if target_user.is_active else 'Bị khóa',
                'is_active': target_user.is_active,
                'name': result_name,
                'dob': result_dob,
                'gender': result_gender,
                'hlv_id': result_hlv_id,
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, user_id):
        if not self._is_admin_user(request.user):
            return Response({"detail": "Bạn không có quyền truy cập."}, status=status.HTTP_403_FORBIDDEN)

        if request.user.id == user_id:
            return Response(
                {"detail": "Không cho phép xóa chính tài khoản Quản trị viên đang đăng nhập."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "Tài khoản không tồn tại."}, status=status.HTTP_404_NOT_FOUND)

        # Rule ngoại lệ: không xóa PT khi còn lịch tập đang chờ.
        # Hệ thống hiện chưa có trạng thái lịch, nên kiểm tra theo dữ liệu lịch hiện hữu của hội viên thuộc PT.
        if target_user.groups.filter(name='hlv').exists():
            try:
                hlv_profile = HLV.objects.get(Id_TaiKhoan=target_user)
            except HLV.DoesNotExist:
                hlv_profile = None

            if hlv_profile is not None:
                has_pending_schedule = LichTap.objects.filter(Id_HoiVien__Id_HLV=hlv_profile).exists()
                if has_pending_schedule:
                    return Response(
                        {"detail": "Không thể xóa PT đang có lịch tập đang chờ."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        actor = request.user
        target_snapshot = {
            'id': target_user.id,
            'username': target_user.username,
        }

        try:
            with transaction.atomic():
                target_user.delete()
        except ProtectedError:
            return Response(
                {"detail": "Không thể xóa tài khoản do đang có dữ liệu ràng buộc."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        logger.info(
            "ADMIN_DELETE_ACCOUNT actor_id=%s actor_username=%s target_id=%s target_username=%s",
            actor.id,
            actor.username,
            target_snapshot['id'],
            target_snapshot['username'],
        )

        return Response(
            {
                'detail': 'Xóa tài khoản thành công.',
                'id': target_snapshot['id'],
            },
            status=status.HTTP_200_OK,
        )


class SelfProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def _parse_dob(self, dob_input):
        if dob_input in (None, ''):
            return None
        try:
            return date.fromisoformat(str(dob_input))
        except ValueError:
            return 'invalid'

    def patch(self, request):
        user = request.user
        payload = request.data if hasattr(request, 'data') else {}

        name = payload.get('name')
        dob_input = payload.get('dob')
        gender = payload.get('gender')

        if name is not None:
            name = str(name).strip()
            if not name:
                return Response({"detail": "Họ tên không được để trống."}, status=status.HTTP_400_BAD_REQUEST)

        parsed_dob = self._parse_dob(dob_input)
        if parsed_dob == 'invalid':
            return Response({"detail": "Ngày sinh không hợp lệ. Dùng định dạng YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        if user.groups.filter(name='hlv').exists():
            try:
                profile = HLV.objects.get(Id_TaiKhoan=user)
            except HLV.DoesNotExist:
                return Response({"detail": "Không tìm thấy hồ sơ HLV."}, status=status.HTTP_404_NOT_FOUND)

            update_fields = []
            if name is not None:
                profile.HoTen = name
                update_fields.append('HoTen')
            if parsed_dob is not None:
                profile.NgaySinh = parsed_dob
                update_fields.append('NgaySinh')
            if gender is not None:
                profile.GioiTinh = str(gender).strip() or profile.GioiTinh
                update_fields.append('GioiTinh')

            if update_fields:
                profile.save(update_fields=update_fields)

            data = {
                'id': profile.pk,
                'HoTen': profile.HoTen,
                'NgaySinh': profile.NgaySinh,
                'GioiTinh': profile.GioiTinh,
                'role': 'hlv',
                'account_info': {
                    'username': user.username,
                    'is_active': user.is_active,
                },
            }
            return Response(data, status=status.HTTP_200_OK)

        if user.groups.filter(name='hoivien').exists():
            try:
                profile = HoiVien.objects.get(Id_TaiKhoan=user)
            except HoiVien.DoesNotExist:
                return Response({"detail": "Không tìm thấy hồ sơ hội viên."}, status=status.HTTP_404_NOT_FOUND)

            update_fields = []
            if name is not None:
                profile.HoTen = name
                update_fields.append('HoTen')
            if parsed_dob is not None:
                profile.NgaySinh = parsed_dob
                update_fields.append('NgaySinh')
            if gender is not None:
                profile.GioiTinh = str(gender).strip() or profile.GioiTinh
                update_fields.append('GioiTinh')

            if update_fields:
                profile.save(update_fields=update_fields)

            data = {
                'id': profile.pk,
                'HoTen': profile.HoTen,
                'NgaySinh': profile.NgaySinh,
                'GioiTinh': profile.GioiTinh,
                'role': 'hoivien',
                'hlv_id': profile.Id_HLV.pk if profile.Id_HLV else None,
                'ten_hlv': profile.Id_HLV.HoTen if profile.Id_HLV else None,
                'account_info': {
                    'username': user.username,
                    'is_active': user.is_active,
                },
            }
            return Response(data, status=status.HTTP_200_OK)

        return Response({"detail": "Vai trò hiện tại không có hồ sơ để cập nhật."}, status=status.HTTP_400_BAD_REQUEST)