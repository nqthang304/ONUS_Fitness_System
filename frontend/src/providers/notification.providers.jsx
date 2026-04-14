import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/providers/auth.providers";
import notificationApi from "@/api/notificationApi";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { currentUserId } = useAuth();
  const normalizedUserId = String(currentUserId || "");
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(async () => {
    if (!normalizedUserId) {
      setNotifications([]);
      return;
    }

    try {
      const response = await notificationApi.getNotifications();
      const rows = Array.isArray(response?.data) ? response.data : [];
      setNotifications(rows);
    } catch (error) {
      console.error("Không thể tải thông báo:", error);
      setNotifications([]);
    }
  }, [normalizedUserId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!normalizedUserId) return undefined;

    const pollId = window.setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => window.clearInterval(pollId);
  }, [fetchNotifications, normalizedUserId]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.DaXem).length,
    [notifications]
  );

  const markAsRead = (chiTietId) => {
    setNotifications((prev) =>
      prev.map((detail) =>
        detail.ChiTietId === chiTietId
          ? { ...detail, DaXem: true }
          : detail
      )
    );

    notificationApi.markAsRead(chiTietId).catch((error) => {
      console.error("Không thể đánh dấu thông báo đã xem:", error);
      fetchNotifications();
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((detail) => ({ ...detail, DaXem: true })));

    notificationApi.markAllAsRead().catch((error) => {
      console.error("Không thể đánh dấu tất cả thông báo đã xem:", error);
      fetchNotifications();
    });
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