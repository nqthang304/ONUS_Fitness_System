from django.db.models import Q

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models.deletion import ProtectedError

from accounts.models import HLV, HoiVien

from .models import BaiDang, BinhLuan, TuongTac
from .serializers import (
	BaiDangCreateSerializer,
	BaiDangReadSerializer,
	BaiDangUpdateSerializer,
	TuongTacSerializer,
	BinhLuanReadSerializer,
	BinhLuanCreateSerializer,
)


class BaiDangFeedView(APIView):
	permission_classes = [IsAuthenticated]

	def _resolve_user_role(self, user):
		if not user:
			return None

		if user.is_staff or user.groups.filter(name__iexact='admin').exists():
			return 'admin'

		if user.groups.filter(name__iexact='hlv').exists():
			return 'hlv'

		if user.groups.filter(name__iexact='hoivien').exists():
			return 'hoivien'

		return None

	def _get_hlv_owner(self, user):
		role = self._resolve_user_role(user)

		if role == 'admin':
			return None

		if role == 'hlv':
			return user

		if role == 'hoivien':
			profile = HoiVien.objects.select_related('Id_HLV__Id_TaiKhoan').filter(Id_TaiKhoan=user).first()
			if profile and profile.Id_HLV and profile.Id_HLV.Id_TaiKhoan:
				return profile.Id_HLV.Id_TaiKhoan

		return None

	def get_queryset(self, user):
		role = self._resolve_user_role(user)
		base_queryset = BaiDang.objects.select_related('Id_NguoiDang').order_by('-ThoiGianDang')

		if role == 'admin':
			return base_queryset

		if role == 'hlv':
			return base_queryset.filter(
				Q(Id_NguoiDang=user) | Q(Id_NguoiDang__groups__name__iexact='admin')
			).distinct()

		if role == 'hoivien':
			trainer_user = self._get_hlv_owner(user)
			if not trainer_user:
				return base_queryset.filter(Id_NguoiDang__groups__name__iexact='admin').distinct()

			return base_queryset.filter(
				Q(Id_NguoiDang=trainer_user) | Q(Id_NguoiDang__groups__name__iexact='admin')
			).distinct()

		return base_queryset.none()

	def get(self, request):
		queryset = self.get_queryset(request.user)
		serializer = BaiDangReadSerializer(queryset, many=True, context={'request': request})
		return Response(serializer.data)

	def post(self, request):
		serializer = BaiDangCreateSerializer(data=request.data, context={'request': request})
		serializer.is_valid(raise_exception=True)
		post = serializer.save()
		return Response(BaiDangReadSerializer(post, context={'request': request}).data, status=status.HTTP_201_CREATED)


class BaiDangDeleteView(APIView):
	permission_classes = [IsAuthenticated]

	def _resolve_user_role(self, user):
		if not user:
			return None

		if user.is_staff or user.groups.filter(name__iexact='admin').exists():
			return 'admin'

		if user.groups.filter(name__iexact='hlv').exists():
			return 'hlv'

		return None

	def delete(self, request, post_id):
		try:
			post = BaiDang.objects.get(id=post_id)
		except BaiDang.DoesNotExist:
			return Response({'detail': 'Bai dang khong ton tai.'}, status=status.HTTP_404_NOT_FOUND)

		user = request.user
		role = self._resolve_user_role(user)

		if role == 'admin':
			try:
				BinhLuan.objects.filter(Id_BaiDang=post).delete()
				TuongTac.objects.filter(Id_BaiDang=post).delete()
				post.delete()
				return Response(status=status.HTTP_204_NO_CONTENT)
			except ProtectedError:
				return Response({'detail': 'Khong the xoa bai dang vi con du lieu lien quan.'}, status=status.HTTP_409_CONFLICT)

		if role == 'hlv' and post.Id_NguoiDang_id == user.id:
			try:
				BinhLuan.objects.filter(Id_BaiDang=post).delete()
				TuongTac.objects.filter(Id_BaiDang=post).delete()
				post.delete()
				return Response(status=status.HTTP_204_NO_CONTENT)
			except ProtectedError:
				return Response({'detail': 'Khong the xoa bai dang vi con du lieu lien quan.'}, status=status.HTTP_409_CONFLICT)

		return Response({'detail': 'Ban khong co quyen xoa bai dang nay.'}, status=status.HTTP_403_FORBIDDEN)

	def patch(self, request, post_id):
		try:
			post = BaiDang.objects.get(id=post_id)
		except BaiDang.DoesNotExist:
			return Response({'detail': 'Bai dang khong ton tai.'}, status=status.HTTP_404_NOT_FOUND)

		serializer = BaiDangUpdateSerializer(post, data=request.data, context={'request': request}, partial=True)
		serializer.is_valid(raise_exception=True)
		updated_post = serializer.save()
		return Response(BaiDangReadSerializer(updated_post, context={'request': request}).data, status=status.HTTP_200_OK)


class BaiDangTuongTacView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request, post_id):
		try:
			post = BaiDang.objects.get(id=post_id)
		except BaiDang.DoesNotExist:
			return Response({'detail': 'Bai dang khong ton tai.'}, status=status.HTTP_404_NOT_FOUND)

		tuong_tac, created = TuongTac.objects.get_or_create(
			Id_BaiDang=post,
			Id_NguoiDung=request.user,
		)

		serializer = TuongTacSerializer(tuong_tac)
		return Response(
			{
				'detail': 'Da ghi nhan tuong tac.' if created else 'Tuong tac da ton tai.',
				'created': created,
				'data': serializer.data,
			},
			status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
		)

	def delete(self, request, post_id):
		deleted_count, _ = TuongTac.objects.filter(
			Id_BaiDang_id=post_id,
			Id_NguoiDung=request.user,
		).delete()

		if deleted_count == 0:
			return Response({'detail': 'Khong tim thay tuong tac de xoa.'}, status=status.HTTP_404_NOT_FOUND)

		return Response(status=status.HTTP_204_NO_CONTENT)


class BaiDangBinhLuanView(APIView):
	permission_classes = [IsAuthenticated]

	def _resolve_user_role(self, user):
		if not user:
			return None

		if user.is_staff or user.groups.filter(name__iexact='admin').exists():
			return 'admin'

		if user.groups.filter(name__iexact='hlv').exists():
			return 'hlv'

		if user.groups.filter(name__iexact='hoivien').exists():
			return 'hoivien'

		return None

	def _get_hlv_owner(self, user):
		role = self._resolve_user_role(user)

		if role == 'hlv':
			return user

		if role == 'hoivien':
			profile = HoiVien.objects.select_related('Id_HLV__Id_TaiKhoan').filter(Id_TaiKhoan=user).first()
			if profile and profile.Id_HLV and profile.Id_HLV.Id_TaiKhoan:
				return profile.Id_HLV.Id_TaiKhoan

		return None

	def _can_access_post(self, user, post):
		role = self._resolve_user_role(user)

		if role == 'admin':
			return True

		is_post_admin = post.Id_NguoiDang.is_staff or post.Id_NguoiDang.groups.filter(name__iexact='admin').exists()
		if is_post_admin:
			return True

		if role == 'hlv':
			return post.Id_NguoiDang_id == user.id

		if role == 'hoivien':
			hlv_owner = self._get_hlv_owner(user)
			return bool(hlv_owner and post.Id_NguoiDang_id == hlv_owner.id)

		return False

	def get(self, request, post_id):
		try:
			post = BaiDang.objects.select_related('Id_NguoiDang').get(id=post_id)
		except BaiDang.DoesNotExist:
			return Response({'detail': 'Bai dang khong ton tai.'}, status=status.HTTP_404_NOT_FOUND)

		if not self._can_access_post(request.user, post):
			return Response({'detail': 'Ban khong co quyen xem binh luan cua bai dang nay.'}, status=status.HTTP_403_FORBIDDEN)

		comments = BinhLuan.objects.filter(Id_BaiDang=post).select_related('Id_NguoiDung').order_by('ThoiGianBinhLuan')
		serializer = BinhLuanReadSerializer(comments, many=True, context={'request': request})
		return Response(serializer.data)

	def post(self, request, post_id):
		try:
			post = BaiDang.objects.select_related('Id_NguoiDang').get(id=post_id)
		except BaiDang.DoesNotExist:
			return Response({'detail': 'Bai dang khong ton tai.'}, status=status.HTTP_404_NOT_FOUND)

		if not self._can_access_post(request.user, post):
			return Response({'detail': 'Ban khong co quyen binh luan bai dang nay.'}, status=status.HTTP_403_FORBIDDEN)

		serializer = BinhLuanCreateSerializer(data=request.data, context={'request': request})
		serializer.is_valid(raise_exception=True)
		comment = serializer.save(Id_BaiDang=post, Id_NguoiDung=request.user)
		return Response(BinhLuanReadSerializer(comment, context={'request': request}).data, status=status.HTTP_201_CREATED)
