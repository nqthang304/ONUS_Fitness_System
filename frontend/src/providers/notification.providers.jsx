import { createContext, useContext, useState, useMemo } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  // 1. Danh sách thông báo (Dữ liệu Mock khớp với bảng ThongBao)
  const [notifications, setNotifications] = useState([
    { 
        id: 1, 
        tieuDe: "Bình luận mới", 
        noiDung: "HLV Trần B đã bình luận về bài tập của bạn.", 
        daXem: false, // Trạng thái Unseen
        thoiGian: "10:00 25/03"
    },
    { 
        id: 2, 
        tieuDe: "Cập nhật thực đơn", 
        noiDung: "Thực đơn mới cho tuần này đã sẵn sàng.", 
        daXem: true,  // Trạng thái Seen
        thoiGian: "08:30 24/03"
    },
  ]);

  // 2. Tính số lượng thông báo "Chưa xem" (Unseen)
  // Hiển thị con số này trên biểu tượng Chuông ở Navbar
  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.daXem).length, 
  [notifications]);

  // 3. Hàm đánh dấu một thông báo là đã xem
  const markAsRead = (id) => {
    setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, daXem: true } : n)
    );
  };

  // 4. Hàm đánh dấu tất cả là đã xem (Dùng cho nút "Đọc tất cả")
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, daXem: true })));
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