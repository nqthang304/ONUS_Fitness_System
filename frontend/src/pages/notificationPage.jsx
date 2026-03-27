import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth.providers";
import { Card } from "@/components/ui/card";
import { Info, User } from "lucide-react";

// --- MOCK DATABASE ---
const DB_THONG_BAO = [
  { 
    Id: 1, 
    TieuDe: "Thông báo bài viết mới", 
    NoiDung: "Admin vừa đăng một bài viết mới. Hãy cùng đọc và thảo luận nhé!", 
    LoaiThongBao: "SYSTEM", // Loại hệ thống
    NgayTao: "2023-08-30 09:00" 
  },
  { 
    Id: 2, 
    TieuDe: "Nhắc nhở lịch tập", 
    NoiDung: "Bạn có lịch tập vào lúc 16:00 hôm nay với HLV Trần B.", 
    LoaiThongBao: "REMINDER", 
    NgayTao: "2023-11-20 08:00" 
  },
];

const DB_CHI_TIET_THONG_BAO = [
  { Id: 101, Id_NguoiNhan: "1", Id_ThongBao: 1, DaXem: false },
  { Id: 102, Id_NguoiNhan: "2", Id_ThongBao: 1, DaXem: false },
  { Id: 103, Id_NguoiNhan: "2", Id_ThongBao: 2, DaXem: false },
  { Id: 104, Id_NguoiNhan: "3", Id_ThongBao: 2, DaXem: false },
];

const NotificationPage = () => {
  const { user } = useAuth();
  const currentUserId = String(user?.id || "");

  const [notifications, setNotifications] = useState([]);

  // Hàm mô phỏng việc gọi API để Lấy danh sách thông báo và JOIN 2 bảng
  useEffect(() => {
    // 1. Lấy các chi tiết thông báo của user hiện tại
    const myDetails = DB_CHI_TIET_THONG_BAO.filter(ct => ct.Id_NguoiNhan === currentUserId);

    // 2. Map (Join) với bảng ThongBao gốc để lấy Tiêu đề, Nội dung...
    const combinedData = myDetails.map(detail => {
      const thongBaoGoc = DB_THONG_BAO.find(tb => tb.Id === detail.Id_ThongBao);
      if (!thongBaoGoc) return null;
      return {
        ...thongBaoGoc,          // Chứa TieuDe, NoiDung, LoaiThongBao, NgayTao
        ChiTietId: detail.Id,    // ID của bảng chi tiết (dùng để update DaXem)
        DaXem: detail.DaXem      // Trạng thái đã xem
      };
    }).filter(Boolean);

    // Sắp xếp ngày mới nhất lên đầu
    combinedData.sort((a, b) => new Date(b.NgayTao) - new Date(a.NgayTao));
    setNotifications(combinedData);
  }, [currentUserId]);

  // Xử lý sự kiện click để đánh dấu đã đọc
  const handleMarkAsRead = (chiTietId, daXemHienTai) => {
    // Nếu đã xem rồi thì không làm gì cả
    if (daXemHienTai) return;

    // Cập nhật state nội bộ (UI update)
    setNotifications(prev => 
      prev.map(notif => 
        notif.ChiTietId === chiTietId ? { ...notif, DaXem: true } : notif
      )
    );

    // TODO: Gọi API xuống Backend để update cột DaXem trong bảng ChiTietThongBao thành True
    // fetch(`/api/thong-bao/chi-tiet/${chiTietId}/da-xem`, { method: 'PUT' })
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
        {notifications.length > 0 ? (
          notifications.map((notif) => {
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