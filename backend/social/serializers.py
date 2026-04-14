from rest_framework import serializers
from django.contrib.auth.models import User
from .models import BaiDang, TuongTac, BinhLuan, TinNhan, ThongBao, ChiTietThongBao
from accounts.models import HLV, HoiVien


class BaiDangSerializer(serializers.ModelSerializer):
    class Meta:
        model = BaiDang
        fields = '__all__'


class BaiDangReadSerializer(serializers.ModelSerializer):
    author_id = serializers.IntegerField(source='Id_NguoiDang_id', read_only=True)
    author_name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    hlv_id = serializers.SerializerMethodField()
    content = serializers.CharField(source='NoiDung', read_only=True)
    created_at = serializers.DateTimeField(source='ThoiGianDang', format='%H:%M %d/%m/%Y', read_only=True)
    image_url = serializers.SerializerMethodField()
    likes = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = BaiDang
        fields = [
            'id',
            'author_id',
            'author_name',
            'role',
            'hlv_id',
            'content',
            'created_at',
            'image_url',
            'likes',
            'comment_count',
            'is_liked',
        ]

    def _resolve_user_role(self, user):
        if not user:
            return None

        if user.is_staff or user.groups.filter(name__iexact='admin').exists():
            return 'admin'

        if user.groups.filter(name__iexact='hlv').exists():
            return 'hlv'

        return None

    def get_author_name(self, obj):
        user = obj.Id_NguoiDang
        role = self.get_role(obj)

        if role == 'hlv':
            profile = HLV.objects.filter(Id_TaiKhoan=user).first()
            return profile.HoTen if profile else user.username

        return 'Admin'

    def get_role(self, obj):
        return self._resolve_user_role(obj.Id_NguoiDang)

    def get_hlv_id(self, obj):
        user = obj.Id_NguoiDang
        role = self.get_role(obj)

        if role == 'hlv':
            profile = HLV.objects.filter(Id_TaiKhoan=user).first()
            return profile.id if profile else user.id

        return None

    def get_image_url(self, obj):
        if not obj.anhURL:
            return None

        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.anhURL.url)
        return obj.anhURL.url

    def get_likes(self, obj):
        return TuongTac.objects.filter(Id_BaiDang=obj).count()

    def get_comment_count(self, obj):
        return BinhLuan.objects.filter(Id_BaiDang=obj).count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)

        if not request or not user or not user.is_authenticated:
            return False

        return TuongTac.objects.filter(Id_BaiDang=obj, Id_NguoiDung=user).exists()
        
class TuongTacSerializer(serializers.ModelSerializer):
    class Meta:
        model = TuongTac
        fields = '__all__'

class BinhLuanSerializer(serializers.ModelSerializer):
    class Meta:
        model = BinhLuan
        fields = '__all__'


class BinhLuanReadSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='Id_NguoiDung_id', read_only=True)
    user_name = serializers.SerializerMethodField()
    text = serializers.CharField(source='NoiDung', read_only=True)
    created_at = serializers.DateTimeField(source='ThoiGianBinhLuan', format='%H:%M %d/%m/%Y', read_only=True)

    class Meta:
        model = BinhLuan
        fields = ['id', 'user_id', 'user_name', 'text', 'created_at']

    def get_user_name(self, obj):
        user = obj.Id_NguoiDung
        if user.groups.filter(name__iexact='hlv').exists():
            profile = HLV.objects.filter(Id_TaiKhoan=user).first()
            return profile.HoTen if profile else user.username

        if user.groups.filter(name__iexact='hoivien').exists():
            profile = HoiVien.objects.filter(Id_TaiKhoan=user).first()
            return profile.HoTen if profile else user.username

        return user.username or 'Admin'


class BinhLuanCreateSerializer(serializers.ModelSerializer):
    text = serializers.CharField(source='NoiDung', required=False, allow_blank=True, write_only=True)
    NoiDung = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = BinhLuan
        fields = ['text', 'NoiDung']

    def validate(self, attrs):
        text = attrs.get('NoiDung', attrs.get('NoiDung', None))
        if text is None:
            text = attrs.get('NoiDung', '')
        if not text:
            text = self.initial_data.get('text') or self.initial_data.get('NoiDung') or ''

        if not str(text).strip():
            raise serializers.ValidationError('Noi dung binh luan khong duoc de trong.')

        attrs['NoiDung'] = str(text).strip()
        return attrs

    def create(self, validated_data):
        validated_data.pop('text', None)
        return super().create(validated_data)

    def to_representation(self, instance):
        return BinhLuanReadSerializer(instance, context=self.context).data
        
class TinNhanSerializer(serializers.ModelSerializer):
    class Meta:
        model = TinNhan
        fields = '__all__'


class TinNhanReadSerializer(serializers.ModelSerializer):
    sender_id = serializers.IntegerField(source='Id_NguoiGui_id', read_only=True)
    receiver_id = serializers.IntegerField(source='Id_NguoiNhan_id', read_only=True)
    text = serializers.CharField(source='NoiDung', read_only=True)
    sent_at = serializers.DateTimeField(source='ThoiGianGui', read_only=True)
    time = serializers.DateTimeField(source='ThoiGianGui', format='%H:%M %d/%m/%Y', read_only=True)
    is_me = serializers.SerializerMethodField()

    class Meta:
        model = TinNhan
        fields = ['id', 'sender_id', 'receiver_id', 'text', 'sent_at', 'time', 'is_me']

    def get_is_me(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        return bool(user and user.is_authenticated and obj.Id_NguoiGui_id == user.id)


class TinNhanCreateSerializer(serializers.ModelSerializer):
    receiver_id = serializers.IntegerField(write_only=True, required=False)
    text = serializers.CharField(source='NoiDung', required=False, allow_blank=True, write_only=True)
    NoiDung = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = TinNhan
        fields = ['receiver_id', 'text', 'NoiDung']

    def validate(self, attrs):
        text = attrs.get('NoiDung') or self.initial_data.get('text') or self.initial_data.get('NoiDung') or ''
        if not str(text).strip():
            raise serializers.ValidationError('Noi dung tin nhan khong duoc de trong.')

        receiver_id = attrs.get('receiver_id')
        if receiver_id is None:
            receiver_id = self.initial_data.get('receiver_id')

        try:
            receiver_id = int(receiver_id)
        except (ValueError, TypeError):
            raise serializers.ValidationError('receiver_id khong hop le.')

        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            raise serializers.ValidationError('Nguoi nhan khong ton tai.')

        attrs['NoiDung'] = str(text).strip()
        attrs['Id_NguoiNhan'] = receiver
        return attrs

    def create(self, validated_data):
        validated_data.pop('receiver_id', None)
        validated_data.pop('text', None)
        return super().create(validated_data)

    def to_representation(self, instance):
        return TinNhanReadSerializer(instance, context=self.context).data


class ThongBaoReadSerializer(serializers.ModelSerializer):
    ChiTietId = serializers.IntegerField(source='id', read_only=True)
    Id = serializers.IntegerField(source='Id_ThongBao_id', read_only=True)
    TieuDe = serializers.CharField(source='Id_ThongBao.TieuDe', read_only=True)
    NoiDung = serializers.CharField(source='Id_ThongBao.NoiDung', read_only=True)
    LoaiThongBao = serializers.CharField(source='Id_ThongBao.LoaiThongBao', read_only=True)
    NgayTao = serializers.DateTimeField(source='Id_ThongBao.NgayTao', format='%H:%M %d/%m/%Y', read_only=True)

    class Meta:
        model = ChiTietThongBao
        fields = ['ChiTietId', 'DaXem', 'Id', 'TieuDe', 'NoiDung', 'LoaiThongBao', 'NgayTao']


class BaiDangCreateSerializer(serializers.ModelSerializer):
    content = serializers.CharField(required=False, allow_blank=True, write_only=True)
    NoiDung = serializers.CharField(required=False, allow_blank=True, write_only=True)
    image = serializers.ImageField(source='anhURL', required=False, allow_null=True, write_only=True)

    class Meta:
        model = BaiDang
        fields = ['content', 'NoiDung', 'image', 'anhURL']
        extra_kwargs = {
            'anhURL': {'required': False, 'allow_null': True, 'write_only': True},
        }

    def validate(self, attrs):
        content = attrs.get('content', attrs.get('NoiDung', ''))
        image = attrs.get('anhURL')

        if not content and not image:
            raise serializers.ValidationError('Noi dung hoac anhURL la bat buoc.')

        request = self.context.get('request')
        user = getattr(request, 'user', None)
        is_admin = bool(user and (user.is_staff or user.groups.filter(name__iexact='admin').exists()))
        is_hlv = bool(user and user.groups.filter(name__iexact='hlv').exists())
        if not (is_admin or is_hlv):
            raise serializers.ValidationError('Chi admin hoac hlv moi duoc dang bai.')

        attrs['NoiDung'] = content
        return attrs

    def create(self, validated_data):
        validated_data.pop('content', None)
        request = self.context.get('request')

        if not request or not request.user or not request.user.is_authenticated:
            raise serializers.ValidationError('Khong xac dinh duoc nguoi dang bai.')

        validated_data['Id_NguoiDang'] = request.user
        return super().create(validated_data)

    def to_representation(self, instance):
        return BaiDangReadSerializer(instance, context=self.context).data


class BaiDangUpdateSerializer(serializers.ModelSerializer):
    content = serializers.CharField(required=False, allow_blank=True, write_only=True)
    NoiDung = serializers.CharField(required=False, allow_blank=True, write_only=True)
    image = serializers.ImageField(source='anhURL', required=False, allow_null=True, write_only=True)
    remove_image = serializers.BooleanField(required=False, write_only=True, default=False)

    class Meta:
        model = BaiDang
        fields = ['content', 'NoiDung', 'image', 'anhURL', 'remove_image']
        extra_kwargs = {
            'anhURL': {'required': False, 'allow_null': True, 'write_only': True},
        }

    def validate(self, attrs):
        content = attrs.get('content', attrs.get('NoiDung', None))
        image = attrs.get('anhURL')
        remove_image = attrs.get('remove_image', False)
        instance = getattr(self, 'instance', None)

        request = self.context.get('request')
        user = getattr(request, 'user', None)
        is_admin = bool(user and (user.is_staff or user.groups.filter(name__iexact='admin').exists()))
        is_hlv = bool(user and user.groups.filter(name__iexact='hlv').exists())

        if not (is_admin or is_hlv):
            raise serializers.ValidationError('Chi admin hoac hlv moi duoc sua bai.')

        if instance and not is_admin and instance.Id_NguoiDang_id != user.id:
            raise serializers.ValidationError('Ban khong co quyen sua bai dang nay.')

        if content is None:
            content = instance.NoiDung if instance else ''

        if content is not None:
            attrs['NoiDung'] = content

        if image:
            attrs['anhURL'] = image
        elif remove_image:
            attrs['anhURL'] = None
        else:
            attrs.pop('anhURL', None)

        if not attrs.get('NoiDung') and attrs.get('anhURL') is None and not image and not remove_image:
            if instance and instance.NoiDung:
                attrs['NoiDung'] = instance.NoiDung
            else:
                raise serializers.ValidationError('Noi dung hoac anhURL la bat buoc.')

        return attrs

    def update(self, instance, validated_data):
        validated_data.pop('content', None)
        validated_data.pop('remove_image', None)

        noi_dung = validated_data.pop('NoiDung', None)
        if noi_dung is not None:
            instance.NoiDung = noi_dung

        if 'anhURL' in validated_data:
            instance.anhURL = validated_data.pop('anhURL')

        instance.save()
        return instance

    def to_representation(self, instance):
        return BaiDangReadSerializer(instance, context=self.context).data