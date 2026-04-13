from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import time

from accounts.models import HLV, HoiVien

from .models import LichTap
from .serializers import LichTapNormalizedSerializer


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

