from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import date, time
from decimal import Decimal, ROUND_HALF_UP
import traceback

from accounts.models import HLV, HoiVien
from social.notification_service import create_system_notification

from .models import LichTap, BuaAn, BaiTap, ChiTietBuaAn, ChiTietBaiTap, ChiSoCoThe
from .serializers import (
	LichTapNormalizedSerializer,
	BaiTapTongHopSerializer,
	BaiTapCreateSerializer,
	ChiTietBaiTapCreateSerializer,
	BuaAnTongHopSerializer,
	BuaAnCreateSerializer,
	ChiTietBuaAnCreateSerializer,
	ChiSoCoTheSerializer,
	ChiSoCoTheCreateSerializer,
)


MEAL_TYPE_ALIASES = {
	'breakfast': 'BuaSang',
	'lunch': 'BuaTrua',
	'dinner': 'BuaToi',
	'snack': 'BuaPhu',
}

CANONICAL_MEAL_TYPES = {'BuaSang', 'BuaTrua', 'BuaToi', 'BuaPhu'}


def normalize_meal_type(value):
	if value in CANONICAL_MEAL_TYPES:
		return value
	return MEAL_TYPE_ALIASES.get(value, value)


def calculate_age_from_dob(dob):
	if not dob:
		return None

	today = date.today()
	age = today.year - dob.year
	if (today.month, today.day) < (dob.month, dob.day):
		age -= 1

	return age


def quantize_decimal(value, places='0.01'):
	return Decimal(str(value)).quantize(Decimal(places), rounding=ROUND_HALF_UP)


class LichTapByRoleView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request):
		user = request.user

		if user.groups.filter(name='hoivien').exists():
			try:
				hoi_vien = HoiVien.objects.get(Id_TaiKhoan=user)
			except HoiVien.DoesNotExist:
				return Response(
					{'detail': 'Không tìm thấy hồ sơ hội viên.'},
					status=status.HTTP_404_NOT_FOUND,
				)

			schedules = LichTap.objects.filter(Id_HoiVien=hoi_vien).select_related(
				'Id_HoiVien__Id_HLV',
			).order_by('ThuTrongTuan', 'GioBatDau')

			serializer = LichTapNormalizedSerializer(schedules, many=True)
			return Response(
				{
					'role': 'hoivien',
					'count': len(serializer.data),
					'results': serializer.data,
				},
				status=status.HTTP_200_OK,
			)

		if user.groups.filter(name='hlv').exists():
			try:
				hlv = HLV.objects.get(Id_TaiKhoan=user)
			except HLV.DoesNotExist:
				return Response(
					{'detail': 'Không tìm thấy hồ sơ huấn luyện viên.'},
					status=status.HTTP_404_NOT_FOUND,
				)

			schedules = LichTap.objects.filter(Id_HoiVien__Id_HLV=hlv).select_related(
				'Id_HoiVien__Id_HLV',
				'Id_HoiVien__Id_TaiKhoan',
			).order_by('Id_HoiVien__HoTen', 'ThuTrongTuan', 'GioBatDau')

			serializer = LichTapNormalizedSerializer(schedules, many=True)
			return Response(
				{
					'role': 'hlv',
					'count': len(serializer.data),
					'results': serializer.data,
				},
				status=status.HTTP_200_OK,
			)

		return Response(
			{'detail': 'Bạn không có quyền truy cập dữ liệu lịch tập.'},
			status=status.HTTP_403_FORBIDDEN,
		)


class CreateLichTapView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request):
		user = request.user

		# 1. Kiểm tra xem user có phải HLV không
		if not user.groups.filter(name='hlv').exists():
			return Response(
				{'detail': 'Chỉ huấn luyện viên mới có thể tạo lịch tập.'},
				status=status.HTTP_403_FORBIDDEN,
			)

		# 2. Lấy thông tin HLV
		try:
			hlv = HLV.objects.get(Id_TaiKhoan=user)
		except HLV.DoesNotExist:
			return Response(
				{'detail': 'Không tìm thấy hồ sơ huấn luyện viên.'},
				status=status.HTTP_404_NOT_FOUND,
			)

		# 3. Lấy dữ liệu từ request
		payload = request.data if hasattr(request, 'data') else {}
		hoi_vien_id = payload.get('hoi_vien_id')
		thu_trong_tuan = payload.get('thu_trong_tuan')
		gio_bat_dau_str = payload.get('gio_bat_dau')
		gio_ket_thuc_str = payload.get('gio_ket_thuc')

		# 4. Kiểm tra dữ liệu bắt buộc
		if not hoi_vien_id or thu_trong_tuan is None or not gio_bat_dau_str or not gio_ket_thuc_str:
			return Response(
				{'detail': 'Thiếu thông tin bắt buộc: hoi_vien_id, thu_trong_tuan, gio_bat_dau, gio_ket_thuc.'},
				status=status.HTTP_400_BAD_REQUEST,
			)

		# 5. Kiểm tra hội viên tồn tại và thuộc HLV này
		try:
			hoi_vien = HoiVien.objects.get(id=hoi_vien_id, Id_HLV=hlv)
		except HoiVien.DoesNotExist:
			return Response(
				{'detail': 'Hội viên không tồn tại hoặc không thuộc quản lý của bạn.'},
				status=status.HTTP_404_NOT_FOUND,
			)

		# 6. Parse thời gian
		try:
			if isinstance(gio_bat_dau_str, str):
				gio_bat_dau = time.fromisoformat(gio_bat_dau_str)
			else:
				gio_bat_dau = gio_bat_dau_str

			if isinstance(gio_ket_thuc_str, str):
				gio_ket_thuc = time.fromisoformat(gio_ket_thuc_str)
			else:
				gio_ket_thuc = gio_ket_thuc_str
		except (ValueError, TypeError):
			return Response(
				{'detail': 'Định dạng thời gian không hợp lệ. Dùng HH:MM:SS.'},
				status=status.HTTP_400_BAD_REQUEST,
			)

		# 7. Kiểm tra thời gian bắt đầu < thời gian kết thúc
		if gio_bat_dau >= gio_ket_thuc:
			return Response(
				{'detail': 'Giờ bắt đầu phải nhỏ hơn giờ kết thúc.'},
				status=status.HTTP_400_BAD_REQUEST,
			)

		# 8. Kiểm tra xem có lịch trùng thời gian không
		# Lịch trùng = cùng hội viên, cùng ngày (ThuTrongTuan), và khoảng giờ bị trùng
		existing_schedules = LichTap.objects.filter(
			Id_HoiVien=hoi_vien,
			ThuTrongTuan=thu_trong_tuan
		)

		for schedule in existing_schedules:
			# Kiểm tra 2 khoảng thời gian có bị trùng không
			# Một khoảng [A, B] và khoảng [C, D] trùng nếu A < D và C < B
			if gio_bat_dau < schedule.GioKetThuc and schedule.GioBatDau < gio_ket_thuc:
				return Response(
					{
						'detail': 'Lịch tập trùng với lịch hiện tại. Hội viên đã có lịch từ {} đến {} vào thứ {}.'.format(
							schedule.GioBatDau,
							schedule.GioKetThuc,
							thu_trong_tuan
						)
					},
					status=status.HTTP_409_CONFLICT,
				)

		# 9. Tạo lịch tập mới
		try:
			new_schedule = LichTap.objects.create(
				Id_HoiVien=hoi_vien,
				ThuTrongTuan=thu_trong_tuan,
				GioBatDau=gio_bat_dau,
				GioKetThuc=gio_ket_thuc,
			)
			create_system_notification(
				recipients=[hoi_vien.Id_TaiKhoan],
				title='Lịch tập mới',
				content='Bạn vừa được tạo lịch tập mới từ huấn luyện viên.',
				notification_type='REMINDER',
			)

			serializer = LichTapNormalizedSerializer(new_schedule)
			return Response(
				{
					'detail': 'Tạo lịch tập thành công.',
					'data': serializer.data,
				},
				status=status.HTTP_201_CREATED,
			)
		except Exception as e:
			return Response(
				{'detail': f'Lỗi khi tạo lịch tập: {str(e)}'},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			)


class DeleteLichTapView(APIView):
	permission_classes = [IsAuthenticated]

	def delete(self, request, schedule_id):
		user = request.user

		if not user.groups.filter(name='hlv').exists():
			return Response(
				{'detail': 'Chỉ huấn luyện viên mới có thể xóa lịch tập.'},
				status=status.HTTP_403_FORBIDDEN,
			)

		try:
			hlv = HLV.objects.get(Id_TaiKhoan=user)
		except HLV.DoesNotExist:
			return Response(
				{'detail': 'Không tìm thấy hồ sơ huấn luyện viên.'},
				status=status.HTTP_404_NOT_FOUND,
			)

		try:
			schedule = LichTap.objects.select_related('Id_HoiVien__Id_HLV').get(
				id=schedule_id,
				Id_HoiVien__Id_HLV=hlv,
			)
		except LichTap.DoesNotExist:
			return Response(
				{'detail': 'Không tìm thấy lịch tập hoặc lịch không thuộc quản lý của bạn.'},
				status=status.HTTP_404_NOT_FOUND,
			)

		schedule.delete()
		return Response(
			{'detail': 'Xóa lịch tập thành công.', 'id': schedule_id},
			status=status.HTTP_200_OK,
		)


class BaiTapByUserIdView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request, user_id):
		request_user = request.user

		try:
			target_hoi_vien = HoiVien.objects.select_related('Id_HLV', 'Id_TaiKhoan').get(
				Id_TaiKhoan_id=user_id,
			)
		except HoiVien.DoesNotExist:
			return Response(
				{'detail': 'Không tìm thấy hội viên tương ứng với user_id.'},
				status=status.HTTP_404_NOT_FOUND,
			)

		# Hội viên chỉ được xem phần của chính mình
		if request_user.groups.filter(name='hoivien').exists():
			if target_hoi_vien.Id_TaiKhoan_id != request_user.id:
				return Response(
					{'detail': 'Hội viên chỉ được xem bài tập của chính mình.'},
					status=status.HTTP_403_FORBIDDEN,
				)

		# HLV chỉ được xem phần hội viên họ đang quản lý
		elif request_user.groups.filter(name='hlv').exists():
			try:
				hlv_profile = HLV.objects.get(Id_TaiKhoan=request_user)
			except HLV.DoesNotExist:
				return Response(
					{'detail': 'Không tìm thấy hồ sơ huấn luyện viên.'},
					status=status.HTTP_404_NOT_FOUND,
				)

			if target_hoi_vien.Id_HLV_id != hlv_profile.id:
				return Response(
					{'detail': 'Hội viên không thuộc quản lý của bạn.'},
					status=status.HTTP_403_FORBIDDEN,
				)
		else:
			return Response(
				{'detail': 'Bạn không có quyền truy cập dữ liệu bài tập.'},
				status=status.HTTP_403_FORBIDDEN,
			)

		bai_tap_qs = BaiTap.objects.filter(Id_HoiVien=target_hoi_vien).prefetch_related(
			'chitietbaitap_set',
		).order_by('id')

		serializer = BaiTapTongHopSerializer(bai_tap_qs, many=True)
		return Response(
			{
				'user_id': user_id,
				'count': len(serializer.data),
				'results': serializer.data,
			},
			status=status.HTTP_200_OK,
		)


class CreateBaiTapView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request):
		user = request.user

		if not user.groups.filter(name='hlv').exists():
			return Response(
				{'detail': 'Chỉ huấn luyện viên mới có thể tạo ngày tập.'},
				status=status.HTTP_403_FORBIDDEN,
			)

		try:
			hlv = HLV.objects.get(Id_TaiKhoan=user)
		except HLV.DoesNotExist:
			return Response(
				{'detail': 'Không tìm thấy hồ sơ huấn luyện viên.'},
				status=status.HTTP_404_NOT_FOUND,
			)

		serializer = BaiTapCreateSerializer(data=request.data)
		if not serializer.is_valid():
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

		payload = serializer.validated_data
		try:
			hoi_vien = HoiVien.objects.select_related('Id_HLV').get(id=payload['hoi_vien_id'], Id_HLV=hlv)
		except HoiVien.DoesNotExist:
			return Response(
				{'detail': 'Hội viên không tồn tại hoặc không thuộc quản lý của bạn.'},
				status=status.HTTP_404_NOT_FOUND,
			)

		thu_tu_ngay_tap = payload.get('thu_tu_ngay_tap')
		if not thu_tu_ngay_tap:
			thu_tu_ngay_tap = str(BaiTap.objects.filter(Id_HoiVien=hoi_vien).count() + 1)

		new_day = BaiTap.objects.create(
			Id_HoiVien=hoi_vien,
			ThuTuNgayTap=thu_tu_ngay_tap,
		)

		create_system_notification(
			recipients=[hoi_vien.Id_TaiKhoan],
			title='Bài tập mới',
			content='Bạn vừa có ngày tập mới trong giáo án.',
			notification_type='REMINDER',
		)

		return Response(
			{
				'detail': 'Tạo ngày tập thành công.',
				'data': {
					'Id_BaiTap': new_day.id,
					'id_hoivien': new_day.Id_HoiVien_id,
					'ThuTuNgayTap': new_day.ThuTuNgayTap,
					'chitietbaitap': [],
				},
			},
			status=status.HTTP_201_CREATED,
		)


class CreateChiTietBaiTapView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request):
		user = request.user

		if not user.groups.filter(name='hlv').exists():
			return Response(
				{'detail': 'Chỉ huấn luyện viên mới có thể thêm bài tập.'},
				status=status.HTTP_403_FORBIDDEN,
			)

		try:
			HLV.objects.get(Id_TaiKhoan=user)
		except HLV.DoesNotExist:
			return Response(
				{'detail': 'Không tìm thấy hồ sơ huấn luyện viên.'},
				status=status.HTTP_404_NOT_FOUND,
			)

		serializer = ChiTietBaiTapCreateSerializer(data=request.data)
		if not serializer.is_valid():
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

		payload = serializer.validated_data
		try:
			baitap = BaiTap.objects.select_related('Id_HoiVien__Id_HLV').get(id=payload['id_baitap'])
		except BaiTap.DoesNotExist:
			return Response(
				{'detail': 'Không tìm thấy ngày tập.'},
				status=status.HTTP_404_NOT_FOUND,
			)

		if baitap.Id_HoiVien.Id_HLV.Id_TaiKhoan_id != user.id:
			return Response(
				{'detail': 'Ngày tập không thuộc quản lý của bạn.'},
				status=status.HTTP_403_FORBIDDEN,
			)

		detail = ChiTietBaiTap.objects.create(
			Id_BaiTap=baitap,
			MucLuc=payload['muc_luc'],
			TenBai=payload['ten_bai'],
			ThoiGian=payload.get('thoi_gian') or '',
			SoLan=payload.get('so_lan'),
			SoHiep=payload.get('so_hiep'),
			Nghi=payload.get('nghi') or '',
			CuongDo=payload.get('cuong_do') or '',
		)

		create_system_notification(
			recipients=[baitap.Id_HoiVien.Id_TaiKhoan],
			title='Bài tập mới',
			content=f"Bạn vừa được thêm bài tập '{detail.TenBai}'.",
			notification_type='REMINDER',
		)

		return Response(
			{
				'detail': 'Thêm bài tập thành công.',
				'data': {
					'id': detail.id,
					'Id_BaiTap': baitap.id,
					'MucLuc': detail.MucLuc,
					'TenBai': detail.TenBai,
					'ThoiGian': detail.ThoiGian,
					'SoLan': detail.SoLan,
					'SoHiep': detail.SoHiep,
					'Nghi': detail.Nghi,
					'CuongDo': detail.CuongDo,
				},
			},
			status=status.HTTP_201_CREATED,
		)


class DeleteBaiTapView(APIView):
	permission_classes = [IsAuthenticated]

	def delete(self, request, baitap_id):
		user = request.user

		if not user.groups.filter(name='hlv').exists():
			return Response(
				{'detail': 'Chỉ huấn luyện viên mới có thể xóa ngày tập.'},
				status=status.HTTP_403_FORBIDDEN,
			)

		try:
			HLV.objects.get(Id_TaiKhoan=user)
		except HLV.DoesNotExist:
			return Response(
				{'detail': 'Không tìm thấy hồ sơ huấn luyện viên.'},
				status=status.HTTP_404_NOT_FOUND,
			)

		try:
			baitap = BaiTap.objects.select_related('Id_HoiVien__Id_HLV').get(id=baitap_id)
		except BaiTap.DoesNotExist:
			return Response(
				{'detail': 'Không tìm thấy ngày tập.'},
				status=status.HTTP_404_NOT_FOUND,
			)

		if baitap.Id_HoiVien.Id_HLV.Id_TaiKhoan_id != user.id:
			return Response(
				{'detail': 'Ngày tập không thuộc quản lý của bạn.'},
				status=status.HTTP_403_FORBIDDEN,
			)

		baitap.delete()
		return Response({'detail': 'Xóa ngày tập thành công.', 'id': baitap_id}, status=status.HTTP_200_OK)


class DeleteChiTietBaiTapView(APIView):
	permission_classes = [IsAuthenticated]

	def delete(self, request, detail_id):
		user = request.user

		if not user.groups.filter(name='hlv').exists():
			return Response(
				{'detail': 'Chỉ huấn luyện viên mới có thể xóa bài tập.'},
				status=status.HTTP_403_FORBIDDEN,
			)

		try:
			HLV.objects.get(Id_TaiKhoan=user)
		except HLV.DoesNotExist:
			return Response(
				{'detail': 'Không tìm thấy hồ sơ huấn luyện viên.'},
				status=status.HTTP_404_NOT_FOUND,
			)

		try:
			detail = ChiTietBaiTap.objects.select_related('Id_BaiTap__Id_HoiVien__Id_HLV').get(id=detail_id)
		except ChiTietBaiTap.DoesNotExist:
			return Response(
				{'detail': 'Không tìm thấy bài tập.'},
				status=status.HTTP_404_NOT_FOUND,
			)

		if detail.Id_BaiTap.Id_HoiVien.Id_HLV.Id_TaiKhoan_id != user.id:
			return Response(
				{'detail': 'Bài tập không thuộc quản lý của bạn.'},
				status=status.HTTP_403_FORBIDDEN,
			)

		detail.delete()
		return Response({'detail': 'Xóa bài tập thành công.', 'id': detail_id}, status=status.HTTP_200_OK)


class BuaAnByUserIdView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request, user_id):
		request_user = request.user

		try:
			target_hoi_vien = HoiVien.objects.select_related('Id_HLV', 'Id_TaiKhoan').get(
				Id_TaiKhoan_id=user_id,
			)
		except HoiVien.DoesNotExist:
			return Response(
				{'detail': 'Không tìm thấy hội viên tương ứng với user_id.'},
				status=status.HTTP_404_NOT_FOUND,
			)

		if request_user.groups.filter(name='hoivien').exists():
			if target_hoi_vien.Id_TaiKhoan_id != request_user.id:
				return Response(
					{'detail': 'Hội viên chỉ được xem lịch ăn của chính mình.'},
					status=status.HTTP_403_FORBIDDEN,
				)
		elif request_user.groups.filter(name='hlv').exists():
			try:
				hlv_profile = HLV.objects.get(Id_TaiKhoan=request_user)
			except HLV.DoesNotExist:
				return Response(
					{'detail': 'Không tìm thấy hồ sơ huấn luyện viên.'},
					status=status.HTTP_404_NOT_FOUND,
				)

			if target_hoi_vien.Id_HLV_id != hlv_profile.id:
				return Response(
					{'detail': 'Hội viên không thuộc quản lý của bạn.'},
					status=status.HTTP_403_FORBIDDEN,
				)
		else:
			return Response(
				{'detail': 'Bạn không có quyền truy cập dữ liệu lịch ăn.'},
				status=status.HTTP_403_FORBIDDEN,
			)

		meal_qs = BuaAn.objects.filter(Id_HoiVien=target_hoi_vien).prefetch_related(
			'chitietbuaan_set',
		).order_by('id')

		serializer = BuaAnTongHopSerializer(meal_qs, many=True)
		results = serializer.data
		for meal in results:
			meal['TenBua'] = normalize_meal_type(meal.get('TenBua'))
		return Response(
			{
				'user_id': user_id,
				'count': len(results),
				'results': results,
			},
			status=status.HTTP_200_OK,
		)


class CreateBuaAnView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request):
		user = request.user

		if not user.groups.filter(name='hlv').exists():
			return Response(
				{'detail': 'Chỉ huấn luyện viên mới có thể tạo bữa ăn.'},
				status=status.HTTP_403_FORBIDDEN,
			)

		try:
			hlv = HLV.objects.get(Id_TaiKhoan=user)
		except HLV.DoesNotExist:
			return Response(
				{'detail': 'Không tìm thấy hồ sơ huấn luyện viên.'},
				status=status.HTTP_404_NOT_FOUND,
			)

		serializer = BuaAnCreateSerializer(data=request.data)
		if not serializer.is_valid():
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

		payload = serializer.validated_data
		try:
			hoi_vien = HoiVien.objects.select_related('Id_HLV').get(id=payload['hoi_vien_id'], Id_HLV=hlv)
		except HoiVien.DoesNotExist:
			return Response(
				{'detail': 'Hội viên không tồn tại hoặc không thuộc quản lý của bạn.'},
				status=status.HTTP_404_NOT_FOUND,
			)

		bua_an, created = BuaAn.objects.get_or_create(
			Id_HoiVien=hoi_vien,
			TenBua=payload['ten_bua'],
		)

		if created:
			create_system_notification(
				recipients=[hoi_vien.Id_TaiKhoan],
				title='Lịch ăn mới',
				content='Bạn vừa có lịch ăn mới được giao bởi huấn luyện viên.',
				notification_type='REMINDER',
			)

		response_data = BuaAnTongHopSerializer(bua_an).data
		return Response(
			{
				'detail': 'Tạo bữa ăn thành công.' if created else 'Bữa ăn đã tồn tại.',
				'data': response_data,
			},
			status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
		)


class CreateChiTietBuaAnView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request):
		user = request.user

		if not user.groups.filter(name='hlv').exists():
			return Response(
				{'detail': 'Chỉ huấn luyện viên mới có thể thêm món ăn.'},
				status=status.HTTP_403_FORBIDDEN,
			)

		try:
			HLV.objects.get(Id_TaiKhoan=user)
		except HLV.DoesNotExist:
			return Response(
				{'detail': 'Không tìm thấy hồ sơ huấn luyện viên.'},
				status=status.HTTP_404_NOT_FOUND,
			)

		serializer = ChiTietBuaAnCreateSerializer(data=request.data)
		if not serializer.is_valid():
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

		payload = serializer.validated_data
		try:
			bua_an = BuaAn.objects.select_related('Id_HoiVien__Id_HLV').get(id=payload['id_lich_an'])
		except BuaAn.DoesNotExist:
			return Response(
				{'detail': 'Không tìm thấy bữa ăn.'},
				status=status.HTTP_404_NOT_FOUND,
			)

		if bua_an.Id_HoiVien.Id_HLV.Id_TaiKhoan_id != user.id:
			return Response(
				{'detail': 'Bữa ăn không thuộc quản lý của bạn.'},
				status=status.HTTP_403_FORBIDDEN,
			)

		detail = ChiTietBuaAn.objects.create(
			Id_LichAn=bua_an,
			TenThucPham=payload['ten_thuc_pham'],
			Luong=payload['luong'],
			Calo=payload['calo'],
			Protein=payload['protein'],
			Carb=payload['carb'],
			Fat=payload['fat'],
		)

		create_system_notification(
			recipients=[bua_an.Id_HoiVien.Id_TaiKhoan],
			title='Lịch ăn mới',
			content=f"Bạn vừa được thêm món ăn '{detail.TenThucPham}'.",
			notification_type='REMINDER',
		)

		return Response(
			{
				'detail': 'Thêm món ăn thành công.',
				'data': {
					'id': detail.id,
					'Id_LichAn': bua_an.id,
					'TenThucPham': detail.TenThucPham,
					'Luong': detail.Luong,
					'Calo': detail.Calo,
					'Protein': detail.Protein,
					'Carb': detail.Carb,
					'Fat': detail.Fat,
				},
			},
			status=status.HTTP_201_CREATED,
		)


class DeleteBuaAnView(APIView):
	permission_classes = [IsAuthenticated]

	def delete(self, request, bua_an_id):
		user = request.user

		if not user.groups.filter(name='hlv').exists():
			return Response(
				{'detail': 'Chỉ huấn luyện viên mới có thể xóa bữa ăn.'},
				status=status.HTTP_403_FORBIDDEN,
			)

		try:
			HLV.objects.get(Id_TaiKhoan=user)
		except HLV.DoesNotExist:
			return Response(
				{'detail': 'Không tìm thấy hồ sơ huấn luyện viên.'},
				status=status.HTTP_404_NOT_FOUND,
			)

		try:
			bua_an = BuaAn.objects.select_related('Id_HoiVien__Id_HLV').get(id=bua_an_id)
		except BuaAn.DoesNotExist:
			return Response(
				{'detail': 'Không tìm thấy bữa ăn.'},
				status=status.HTTP_404_NOT_FOUND,
			)

		if bua_an.Id_HoiVien.Id_HLV.Id_TaiKhoan_id != user.id:
			return Response(
				{'detail': 'Bữa ăn không thuộc quản lý của bạn.'},
				status=status.HTTP_403_FORBIDDEN,
			)

		bua_an.delete()
		return Response({'detail': 'Xóa bữa ăn thành công.', 'id': bua_an_id}, status=status.HTTP_200_OK)


class DeleteChiTietBuaAnView(APIView):
	permission_classes = [IsAuthenticated]

	def delete(self, request, detail_id):
		user = request.user

		if not user.groups.filter(name='hlv').exists():
			return Response(
				{'detail': 'Chỉ huấn luyện viên mới có thể xóa món ăn.'},
				status=status.HTTP_403_FORBIDDEN,
			)

		try:
			HLV.objects.get(Id_TaiKhoan=user)
		except HLV.DoesNotExist:
			return Response(
				{'detail': 'Không tìm thấy hồ sơ huấn luyện viên.'},
				status=status.HTTP_404_NOT_FOUND,
			)

		try:
			detail = ChiTietBuaAn.objects.select_related('Id_LichAn__Id_HoiVien__Id_HLV').get(id=detail_id)
		except ChiTietBuaAn.DoesNotExist:
			return Response(
				{'detail': 'Không tìm thấy món ăn.'},
				status=status.HTTP_404_NOT_FOUND,
			)

		if detail.Id_LichAn.Id_HoiVien.Id_HLV.Id_TaiKhoan_id != user.id:
			return Response(
				{'detail': 'Món ăn không thuộc quản lý của bạn.'},
				status=status.HTTP_403_FORBIDDEN,
			)

		detail.delete()
		return Response({'detail': 'Xóa món ăn thành công.', 'id': detail_id}, status=status.HTTP_200_OK)


class CreateChiSoCoTheView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request):
		try:
			user = request.user

			if not user.groups.filter(name='hlv').exists():
				return Response(
					{'detail': 'Chỉ huấn luyện viên mới có thể tạo chỉ số cơ thể.'},
					status=status.HTTP_403_FORBIDDEN,
				)

			try:
				hlv = HLV.objects.get(Id_TaiKhoan=user)
			except HLV.DoesNotExist:
				return Response(
					{'detail': 'Không tìm thấy hồ sơ huấn luyện viên.'},
					status=status.HTTP_404_NOT_FOUND,
				)

			serializer = ChiSoCoTheCreateSerializer(data=request.data)
			if not serializer.is_valid():
				return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

			payload = serializer.validated_data
			try:
				hoi_vien = HoiVien.objects.select_related('Id_HLV').get(
					id=payload['hoi_vien_id'],
					Id_HLV=hlv,
				)
			except HoiVien.DoesNotExist:
				return Response(
					{'detail': 'Hội viên không tồn tại hoặc không thuộc quản lý của bạn.'},
					status=status.HTTP_404_NOT_FOUND,
				)

			age = calculate_age_from_dob(hoi_vien.NgaySinh)
			if age is None or age <= 0:
				return Response(
					{'detail': 'Không xác định được tuổi hợp lệ của hội viên để tính chỉ số.'},
					status=status.HTTP_400_BAD_REQUEST,
				)

			can_nang = float(payload['can_nang'])
			chieu_cao = float(payload['chieu_cao'])
			vong_bung = float(payload['vong_bung'])
			vong_mong = float(payload['vong_mong'])

			if chieu_cao <= 0 or can_nang <= 0:
				return Response(
					{'detail': 'Cân nặng và chiều cao phải lớn hơn 0.'},
					status=status.HTTP_400_BAD_REQUEST,
				)

			bmi = can_nang / ((chieu_cao / 100.0) ** 2)

			gioi_tinh = str(hoi_vien.GioiTinh or '').strip().lower()
			is_male = gioi_tinh in ('nam', 'male', 'm')

			if is_male:
				phan_tram_mo = (1.39 * bmi) + (0.16 * age) - 19.34
				lbm = (0.32810 * can_nang) + (0.33929 * chieu_cao) - 29.5336
				bmr = (10 * can_nang) + (6.25 * chieu_cao) - (5 * age) + 5
			else:
				phan_tram_mo = (1.39 * bmi) + (0.16 * age) - 9
				lbm = (0.29569 * can_nang) + (0.41813 * chieu_cao) - 43.2933
				bmr = (10 * can_nang) + (6.25 * chieu_cao) - (5 * age) - 161

			phan_tram_co = (lbm / can_nang) * 100.0

			record = ChiSoCoThe.objects.create(
				Id_HoiVien=hoi_vien,
				CanNang=round(can_nang, 2),
				ChieuCao=round(chieu_cao, 2),
				VongBung=round(vong_bung, 2),
				VongMong=round(vong_mong, 2),
				BMI=round(bmi, 2),
				PhanTramMo=round(phan_tram_mo, 2),
				PhanTramCo=round(phan_tram_co, 2),
				TyLeTraoDoiChat=int(round(bmr)),
			)

			create_system_notification(
				recipients=[hoi_vien.Id_TaiKhoan],
				title='Kết quả tập luyện mới',
				content='Đã có kết quả tập luyện/chỉ số cơ thể mới được cập nhật.',
				notification_type='REMINDER',
			)

			result = ChiSoCoTheSerializer(record).data
			return Response(
				{
					'detail': 'Tạo chỉ số cơ thể thành công.',
					'data': result,
				},
				status=status.HTTP_201_CREATED,
			)
		except Exception as exc:
			print('[CreateChiSoCoTheView] ERROR:', str(exc))
			print(traceback.format_exc())
			return Response(
				{'detail': f'Lỗi khi tạo chỉ số cơ thể: {str(exc)}'},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			)


class DeleteChiSoCoTheView(APIView):
	permission_classes = [IsAuthenticated]

	def delete(self, request, chisocothe_id):
		request_user = request.user

		if not request_user.groups.filter(name='hlv').exists():
			return Response(
				{'detail': 'Chỉ huấn luyện viên mới có thể xóa bản ghi chỉ số cơ thể.'},
				status=status.HTTP_403_FORBIDDEN,
			)

		try:
			record = ChiSoCoThe.objects.select_related('Id_HoiVien__Id_HLV').get(id=chisocothe_id)
		except ChiSoCoThe.DoesNotExist:
			return Response(
				{'detail': 'Không tìm thấy bản ghi chỉ số cơ thể.'},
				status=status.HTTP_404_NOT_FOUND,
			)

		# Kiểm tra quyền trực tiếp qua chuỗi quan hệ: ChiSoCoThe -> HoiVien -> HLV -> TaiKhoan
		if record.Id_HoiVien.Id_HLV is None or record.Id_HoiVien.Id_HLV.Id_TaiKhoan_id != request_user.id:
			return Response(
				{'detail': 'Bản ghi chỉ số không thuộc hội viên bạn quản lý.'},
				status=status.HTTP_403_FORBIDDEN,
			)

		record.delete()
		return Response(
			{'detail': 'Xóa bản ghi chỉ số cơ thể thành công.', 'id': chisocothe_id},
			status=status.HTTP_200_OK,
		)

class ChiSoCoTheByUserIdView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request, user_id):
		request_user = request.user

		try:
			target_hoi_vien = HoiVien.objects.select_related('Id_HLV', 'Id_TaiKhoan').get(
				Id_TaiKhoan_id=user_id,
			)
		except HoiVien.DoesNotExist:
			return Response(
				{'detail': 'Không tìm thấy hội viên tương ứng với user_id.'},
				status=status.HTTP_404_NOT_FOUND,
			)

		if request_user.groups.filter(name='hoivien').exists():
			if target_hoi_vien.Id_TaiKhoan_id != request_user.id:
				return Response(
					{'detail': 'Hội viên chỉ được xem chỉ số cơ thể của chính mình.'},
					status=status.HTTP_403_FORBIDDEN,
				)
		elif request_user.groups.filter(name='hlv').exists():
			try:
				hlv_profile = HLV.objects.get(Id_TaiKhoan=request_user)
			except HLV.DoesNotExist:
				return Response(
					{'detail': 'Không tìm thấy hồ sơ huấn luyện viên.'},
					status=status.HTTP_404_NOT_FOUND,
				)

			if target_hoi_vien.Id_HLV_id != hlv_profile.id:
				return Response(
					{'detail': 'Hội viên không thuộc quản lý của bạn.'},
					status=status.HTTP_403_FORBIDDEN,
				)
		else:
			return Response(
				{'detail': 'Bạn không có quyền truy cập dữ liệu chỉ số cơ thể.'},
				status=status.HTTP_403_FORBIDDEN,
			)

		chiso_qs = ChiSoCoThe.objects.filter(Id_HoiVien=target_hoi_vien).order_by('-id')

		serializer = ChiSoCoTheSerializer(chiso_qs, many=True)
		return Response(
			{
				'user_id': user_id,
				'count': len(serializer.data),
				'results': serializer.data,
			},
			status=status.HTTP_200_OK,
		)
		