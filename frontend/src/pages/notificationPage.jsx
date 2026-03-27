import { useMemo } from "react";
import { useNotifications } from "@/providers/notification.providers";
import { Card } from "@/components/ui/card";
import { Info, User } from "lucide-react";

const NotificationPage = () => {
  const { notifications, markAsRead } = useNotifications();

  const displayNotifications = useMemo(() => notifications, [notifications]);

  // Xử lý sự kiện click để đánh dấu đã đọc
  const handleMarkAsRead = (chiTietId, daXemHienTai) => {
    if (daXemHienTai) return;
    markAsRead(chiTietId);
  };

  // Render Icon và Nguồn gửi dựa theo loại thông báo
  const getNotificationUI = (loai) => {
    switch (loai) {
      case "SYSTEM":
        return {
          icon: <Info className="w-5 h-5 text-purple-600" />,
          bgClass: "bg-purple-100",
        };
      case "REMINDER":
      default:
        return {
          icon: <User className="w-5 h-5 text-blue-600" />,
          bgClass: "bg-blue-100",
        };
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full p-4 font-figtree">
      <header className="flex flex-col gap-1 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Thông báo</h1>
        <p className="text-slate-500 text-sm">Cập nhật tin tức mới nhất từ ONUS</p>
      </header>

      {/* List */}
      <div className="space-y-3">
        {displayNotifications.length > 0 ? (
          displayNotifications.map((notif) => {
            const uiConfig = getNotificationUI(notif.LoaiThongBao);

            return (
              <Card 
                key={notif.ChiTietId} 
                className="flex flex-row p-4 rounded-2xl border-slate-100 shadow-sm flex gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => handleMarkAsRead(notif.ChiTietId, notif.DaXem)}
              >
                {/* Cột trái: Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${uiConfig.bgClass}`}>
                  {uiConfig.icon}
                </div>

                {/* Cột giữa: Nội dung */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-bold text-slate-900 mb-1">{notif.TieuDe}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{notif.NoiDung}</p>
                </div>

                {/* Cột phải: Thời gian & Chấm xanh */}
                <div className="flex flex-col items-end shrink-0 gap-1">
                  <span className="text-xs text-slate-400 font-medium">{notif.NgayTao}</span>
                  {/* Chỉ hiện chấm xanh nếu DaXem === false */}
                  {!notif.DaXem && (
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                  )}
                </div>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-100">
            Bạn không có thông báo nào.
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;