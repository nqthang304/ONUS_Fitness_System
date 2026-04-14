from django.db.models import Q
from django.contrib.auth.models import User
from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models.deletion import ProtectedError

from accounts.models import HLV, HoiVien

from .models import BaiDang, BinhLuan, TuongTac, TinNhan, ChiTietThongBao
from .notification_service import create_system_notification
from .serializers import (
	BaiDangCreateSerializer,
	BaiDangReadSerializer,
	BaiDangUpdateSerializer,
	TuongTacSerializer,
	BinhLuanReadSerializer,
	BinhLuanCreateSerializer,
	TinNhanReadSerializer,
	TinNhanCreateSerializer,
	ThongBaoReadSerializer,
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

		recipients = User.objects.exclude(id=request.user.id)
		author_name = BaiDangReadSerializer(post, context={'request': request}).data.get('author_name') or 'Nguoi dung'
		create_system_notification(
			recipients=recipients,
			title='Bài viết mới',
			content=f'{author_name} vừa đăng bài viết mới.',
			notification_type='SYSTEM',
		)

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


class TinNhanBaseView(APIView):
	permission_classes = [IsAuthenticated]

	def _to_local_time(self, dt):
		if not dt:
			return None
		return timezone.localtime(dt)

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

	def _resolve_display_name(self, user):
		if not user:
			return 'Nguoi dung'

		if user.is_staff or user.groups.filter(name__iexact='admin').exists():
			return 'Admin'

		if user.groups.filter(name__iexact='hlv').exists():
			profile = HLV.objects.filter(Id_TaiKhoan=user).first()
			return profile.HoTen if profile and profile.HoTen else user.username

		if user.groups.filter(name__iexact='hoivien').exists():
			profile = HoiVien.objects.filter(Id_TaiKhoan=user).first()
			return profile.HoTen if profile and profile.HoTen else user.username

		return user.username

	def _get_allowed_partners(self, user):
		role = self._resolve_user_role(user)

		if role == 'hlv':
			members = HoiVien.objects.filter(Id_HLV__Id_TaiKhoan=user).select_related('Id_TaiKhoan')
			return [member.Id_TaiKhoan for member in members if member.Id_TaiKhoan]

		if role == 'hoivien':
			profile = HoiVien.objects.select_related('Id_HLV__Id_TaiKhoan').filter(Id_TaiKhoan=user).first()
			if profile and profile.Id_HLV and profile.Id_HLV.Id_TaiKhoan:
				return [profile.Id_HLV.Id_TaiKhoan]
			return []

		if role == 'admin':
			return list(User.objects.exclude(id=user.id))

		return []

	def _can_message_partner(self, user, partner):
		allowed_ids = {item.id for item in self._get_allowed_partners(user)}
		return partner.id in allowed_ids


class TinNhanConversationView(TinNhanBaseView):
	def get(self, request):
		current_user = request.user
		partners = self._get_allowed_partners(current_user)
		conversations = []

		for partner in partners:
			last_message = TinNhan.objects.filter(
				Q(Id_NguoiGui=current_user, Id_NguoiNhan=partner)
				| Q(Id_NguoiGui=partner, Id_NguoiNhan=current_user)
			).order_by('-ThoiGianGui').first()
			last_message_local_time = self._to_local_time(last_message.ThoiGianGui) if last_message else None

			unread_count = TinNhan.objects.filter(
				Id_NguoiGui=partner,
				Id_NguoiNhan=current_user,
				DaXem=False,
			).count()

			conversations.append(
				{
					'partner_id': partner.id,
					'partner_name': self._resolve_display_name(partner),
					'partner_role': self._resolve_user_role(partner),
					'last_message': last_message.NoiDung if last_message else 'Chưa có tin nhắn',
					'last_message_time': last_message_local_time,
					'last_message_time_display': last_message_local_time.strftime('%H:%M %d/%m/%Y') if last_message_local_time else '--:--',
					'unread_count': unread_count,
				}
			)

		conversations.sort(
			key=lambda item: (
				item['last_message_time'] is None,
				-(item['last_message_time'].timestamp()) if item['last_message_time'] else 0,
			)
		)

		return Response(conversations, status=status.HTTP_200_OK)


class TinNhanMessageView(TinNhanBaseView):
	def get(self, request):
		partner_id = request.query_params.get('partner_id')
		if not partner_id:
			return Response({'detail': 'partner_id la bat buoc.'}, status=status.HTTP_400_BAD_REQUEST)

		try:
			partner = User.objects.get(id=int(partner_id))
		except (User.DoesNotExist, ValueError, TypeError):
			return Response({'detail': 'Nguoi nhan khong ton tai.'}, status=status.HTTP_404_NOT_FOUND)

		if not self._can_message_partner(request.user, partner):
			return Response({'detail': 'Ban khong co quyen xem doan chat nay.'}, status=status.HTTP_403_FORBIDDEN)

		TinNhan.objects.filter(Id_NguoiGui=partner, Id_NguoiNhan=request.user, DaXem=False).update(DaXem=True)

		queryset = TinNhan.objects.filter(
			Q(Id_NguoiGui=request.user, Id_NguoiNhan=partner)
			| Q(Id_NguoiGui=partner, Id_NguoiNhan=request.user)
		).order_by('ThoiGianGui')

		serializer = TinNhanReadSerializer(queryset, many=True, context={'request': request})
		return Response(serializer.data, status=status.HTTP_200_OK)

	def post(self, request):
		serializer = TinNhanCreateSerializer(data=request.data, context={'request': request})
		serializer.is_valid(raise_exception=True)

		receiver = serializer.validated_data.get('Id_NguoiNhan')
		if not receiver:
			return Response({'detail': 'Nguoi nhan khong hop le.'}, status=status.HTTP_400_BAD_REQUEST)

		if not self._can_message_partner(request.user, receiver):
			return Response({'detail': 'Ban khong co quyen nhan tin nguoi nay.'}, status=status.HTTP_403_FORBIDDEN)

		message = serializer.save(Id_NguoiGui=request.user, Id_NguoiNhan=receiver)
		sender_name = self._resolve_display_name(request.user)
		content_preview = (message.NoiDung or '').strip()
		if len(content_preview) > 80:
			content_preview = f'{content_preview[:77]}...'
		create_system_notification(
			recipients=[receiver],
			title='Tin nhắn mới',
			content=f'Bạn có tin nhắn mới từ {sender_name}: {content_preview}',
			notification_type='MESSAGE',
		)
		return Response(TinNhanReadSerializer(message, context={'request': request}).data, status=status.HTTP_201_CREATED)


class ThongBaoListView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request):
		notifications = ChiTietThongBao.objects.filter(Id_NguoiNhan=request.user).select_related('Id_ThongBao').order_by('-Id_ThongBao__NgayTao')
		serializer = ThongBaoReadSerializer(notifications, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)


class ThongBaoReadView(APIView):
	permission_classes = [IsAuthenticated]

	def patch(self, request, detail_id):
		try:
			detail = ChiTietThongBao.objects.get(id=detail_id, Id_NguoiNhan=request.user)
		except ChiTietThongBao.DoesNotExist:
			return Response({'detail': 'Thong bao khong ton tai.'}, status=status.HTTP_404_NOT_FOUND)

		detail.DaXem = True
		detail.save(update_fields=['DaXem'])
		return Response({'detail': 'Da danh dau da xem.'}, status=status.HTTP_200_OK)

	def post(self, request):
		ChiTietThongBao.objects.filter(Id_NguoiNhan=request.user, DaXem=False).update(DaXem=True)
		return Response({'detail': 'Da danh dau tat ca thong bao la da xem.'}, status=status.HTTP_200_OK)
