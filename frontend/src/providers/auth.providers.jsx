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
    const username = String(soDienThoai || "").trim();
    const rawPassword = String(password || "");

    if (!username || !rawPassword.trim()) {
      return "Vui lòng nhập đầy đủ số điện thoại và mật khẩu.";
    }

    setIsLoading(true);
    // Gọi API đăng nhập
    try {
      const response = await authApi.login(username, rawPassword);
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

      const statusCode = error?.response?.status;
      const errorData = error?.response?.data || {};
      const detail = errorData?.detail;
      const usernameErrors = errorData?.username;
      const passwordErrors = errorData?.password;
      const nonFieldErrors = errorData?.non_field_errors;

      // Sai thông tin đăng nhập
      if (statusCode === 401) {
        return "Số điện thoại hoặc mật khẩu không chính xác!";
      }

      // Thiếu input hoặc payload không hợp lệ
      if (statusCode === 400) {
        if (Array.isArray(usernameErrors) && usernameErrors.length > 0) {
          return usernameErrors[0];
        }
        if (Array.isArray(passwordErrors) && passwordErrors.length > 0) {
          return passwordErrors[0];
        }
        if (Array.isArray(nonFieldErrors) && nonFieldErrors.length > 0) {
          return nonFieldErrors[0];
        }
        if (typeof detail === "string" && detail.trim()) {
          return detail;
        }
        return "Vui lòng nhập đúng thông tin đăng nhập.";
      }

      if (!error?.response) {
        return "Mất kết nối tới máy chủ. Vui lòng kiểm tra mạng và thử lại.";
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