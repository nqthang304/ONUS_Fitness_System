from django.contrib.auth.models import User

from .models import ThongBao, ChiTietThongBao


def create_system_notification(recipients, title, content, notification_type="SYSTEM"):
    recipient_users = []
    seen_user_ids = set()

    for recipient in recipients or []:
        if not recipient:
            continue

        user = recipient if isinstance(recipient, User) else None
        if user is None and hasattr(recipient, "Id_TaiKhoan"):
            user = getattr(recipient, "Id_TaiKhoan", None)

        if not user or not getattr(user, "id", None):
            continue

        if user.id in seen_user_ids:
            continue

        seen_user_ids.add(user.id)
        recipient_users.append(user)

    if not recipient_users:
        return None

    notification = ThongBao.objects.create(
        TieuDe=str(title or "Thông báo hệ thống")[:255],
        NoiDung=str(content or "")[:2000],
        LoaiThongBao=str(notification_type or "SYSTEM")[:50],
    )

    ChiTietThongBao.objects.bulk_create(
        [
            ChiTietThongBao(
                Id_NguoiNhan=user,
                Id_ThongBao=notification,
                DaXem=False,
            )
            for user in recipient_users
        ]
    )

    return notification
