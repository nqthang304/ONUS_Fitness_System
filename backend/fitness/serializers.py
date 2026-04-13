from rest_framework import serializers

from .models import LichTap, BuaAn, BaiTap, ChiTietBuaAn, ChiTietBaiTap


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


class BaiTapCreateSerializer(serializers.Serializer):
	hoi_vien_id = serializers.IntegerField()
	thu_tu_ngay_tap = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class ChiTietBaiTapCreateSerializer(serializers.Serializer):
	id_baitap = serializers.IntegerField()
	muc_luc = serializers.ChoiceField(choices=[choice[0] for choice in ChiTietBaiTap.MUC_LUC_CHOICES])
	ten_bai = serializers.CharField(max_length=255)
	thoi_gian = serializers.CharField(required=False, allow_blank=True, allow_null=True)
	so_lan = serializers.IntegerField(required=False, allow_null=True)
	so_hiep = serializers.IntegerField(required=False, allow_null=True)
	nghi = serializers.CharField(required=False, allow_blank=True, allow_null=True)
	cuong_do = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class ChiTietBuaAnNestedSerializer(serializers.ModelSerializer):
	class Meta:
		model = ChiTietBuaAn
		fields = [
			'id',
			'TenThucPham',
			'Luong',
			'Calo',
			'Protein',
			'Carb',
			'Fat',
		]


class BuaAnTongHopSerializer(serializers.ModelSerializer):
	id_hoivien = serializers.IntegerField(source='Id_HoiVien_id', read_only=True)
	Id_LichAn = serializers.IntegerField(source='id', read_only=True)
	chitietbuaan = ChiTietBuaAnNestedSerializer(source='chitietbuaan_set', many=True, read_only=True)

	class Meta:
		model = BuaAn
		fields = [
			'id_hoivien',
			'Id_LichAn',
			'TenBua',
			'chitietbuaan',
		]


class BuaAnCreateSerializer(serializers.Serializer):
	hoi_vien_id = serializers.IntegerField()
	ten_bua = serializers.ChoiceField(choices=['BuaSang', 'BuaTrua', 'BuaToi', 'BuaPhu'])


class ChiTietBuaAnCreateSerializer(serializers.Serializer):
	id_lich_an = serializers.IntegerField()
	ten_thuc_pham = serializers.CharField(max_length=100)
	luong = serializers.CharField(max_length=50)
	calo = serializers.DecimalField(max_digits=7, decimal_places=2)
	protein = serializers.DecimalField(max_digits=6, decimal_places=2)
	carb = serializers.DecimalField(max_digits=6, decimal_places=2)
	fat = serializers.DecimalField(max_digits=6, decimal_places=2)
