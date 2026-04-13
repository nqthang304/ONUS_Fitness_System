from rest_framework import serializers

from .models import LichTap, BaiTap, ChiTietBaiTap


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


class ChiTietBaiTapNestedSerializer(serializers.ModelSerializer):
	class Meta:
		model = ChiTietBaiTap
		fields = [
			'id',
			'MucLuc',
			'TenBai',
			'ThoiGian',
			'SoLan',
			'SoHiep',
			'Nghi',
			'CuongDo',
		]


class BaiTapTongHopSerializer(serializers.ModelSerializer):
	id_hoivien = serializers.IntegerField(source='Id_HoiVien_id', read_only=True)
	id_hlv = serializers.IntegerField(source='Id_HoiVien.Id_HLV_id', read_only=True)
	Id_BaiTap = serializers.IntegerField(source='id', read_only=True)
	chitietbaitap = ChiTietBaiTapNestedSerializer(source='chitietbaitap_set', many=True, read_only=True)

	class Meta:
		model = BaiTap
		fields = [
			'id_hoivien',
			'id_hlv',
			'Id_BaiTap',
			'ThuTuNgayTap',
			'chitietbaitap',
		]
