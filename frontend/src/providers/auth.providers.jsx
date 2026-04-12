import { createContext, useContext, useState } from "react";
import authApi from "@/api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("onus_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = async (soDienThoai, password) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Gọi API đăng nhập
    try {
      const response = await authApi.login(soDienThoai, password);
      const data = response.data;

      // Lưu token vào localStorage
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      // Lưu thông tin người dùng (trừ mật khẩu) vào localStorage
      localStorage.setItem("onus_user", JSON.stringify(data.user));

      // Cập nhật state người dùng
      setUser(data.user);
      setIsLoading(false);
      window.location.href = "/";
      
      return null;
    } catch (error) {
      setIsLoading(false);
      console.error("Chi tiết lỗi Đăng nhập:", error);
      
      // Xử lý lỗi đăng nhập
      if (error.response && error.response.status === 401) {
        return "Số điện thoại hoặc mật khẩu không chính xác!";
      }

      return "Máy chủ đang bảo trì hoặc mất kết nối. Vui lòng thử lại!";
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("onus_user");
    
    setUser(null);
    window.location.href = "/login";
  };

  const value = {
    user,
    isLoggedIn: !!user,
    role: user?.role,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};