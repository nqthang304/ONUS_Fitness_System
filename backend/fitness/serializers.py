from rest_framework import serializers

from .models import LichTap


class LichTapNormalizedSerializer(serializers.ModelSerializer):
	# Giữ key theo format cũ ở FE để thay dữ liệu mock dễ hơn.
	Id = serializers.IntegerField(source='id', read_only=True)
	Id_taikhoan = serializers.IntegerField(source='Id_HoiVien.Id_TaiKhoan_id', read_only=True)
	HoiVienId = serializers.IntegerField(source='Id_HoiVien_id', read_only=True)
	HoiVienHoTen = serializers.CharField(source='Id_HoiVien.HoTen', read_only=True)
	Id_HLV = serializers.IntegerField(source='Id_HoiVien.Id_HLV.Id_TaiKhoan_id', read_only=True)
	HLVHoTen = serializers.CharField(source='Id_HoiVien.Id_HLV.HoTen', read_only=True)

	class Meta:
		model = LichTap
		fields = [
			'Id',
			'Id_taikhoan',
			'HoiVienId',
			'HoiVienHoTen',
			'Id_HLV',
			'HLVHoTen',
			'ThuTrongTuan',
			'GioBatDau',
			'GioKetThuc',
		]
