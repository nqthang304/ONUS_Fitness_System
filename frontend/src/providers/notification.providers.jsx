import { createContext, useContext, useState, useMemo } from "react";
import { useAuth } from "@/providers/auth.providers";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const currentUserId = String(user?.id || "");

  const [thongBao] = useState([
    {
      Id: 1,
      TieuDe: "Thông báo bài viết mới",
      NoiDung: "Admin vừa đăng một bài viết mới. Hãy cùng đọc và thảo luận nhé!",
      LoaiThongBao: "SYSTEM",
      NgayTao: "2026-03-25T10:00:00",
    },
    {
      Id: 2,
      TieuDe: "Nhắc nhở lịch tập",
      NoiDung: "Bạn có lịch tập vào lúc 16:00 hôm nay với HLV Trần B.",
      LoaiThongBao: "REMINDER",
      NgayTao: "2026-03-24T08:30:00",
    },
  ]);

  const [chiTietThongBao, setChiTietThongBao] = useState([
    { Id: 101, Id_NguoiNhan: "1", Id_ThongBao: 1, DaXem: false },
    { Id: 102, Id_NguoiNhan: "2", Id_ThongBao: 1, DaXem: false },
    { Id: 103, Id_NguoiNhan: "4", Id_ThongBao: 2, DaXem: false },
    { Id: 104, Id_NguoiNhan: "3", Id_ThongBao: 2, DaXem: false },
  ]);

  const notifications = useMemo(() => {
    if (!currentUserId) return [];

    return chiTietThongBao
      .filter((detail) => String(detail.Id_NguoiNhan) === currentUserId)
      .map((detail) => {
        const thongBaoGoc = thongBao.find((tb) => tb.Id === detail.Id_ThongBao);
        if (!thongBaoGoc) return null;

        return {
          ChiTietId: detail.Id,
          DaXem: detail.DaXem,
          ...thongBaoGoc,
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.NgayTao) - new Date(a.NgayTao));
  }, [chiTietThongBao, currentUserId, thongBao]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.DaXem).length,
    [notifications]
  );

  const markAsRead = (chiTietId) => {
    setChiTietThongBao((prev) =>
      prev.map((detail) =>
        detail.Id === chiTietId && String(detail.Id_NguoiNhan) === currentUserId
          ? { ...detail, DaXem: true }
          : detail
      )
    );
  };

  const markAllAsRead = () => {
    setChiTietThongBao((prev) =>
      prev.map((detail) =>
        String(detail.Id_NguoiNhan) === currentUserId
          ? { ...detail, DaXem: true }
          : detail
      )
    );
  };

  return (
    <NotificationContext.Provider value={{ 
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);