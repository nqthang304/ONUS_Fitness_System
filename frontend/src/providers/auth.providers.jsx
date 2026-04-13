import { createContext, useContext, useEffect, useState } from "react";
import authApi from "@/api/authApi";

const AuthContext = createContext(null);

const normalizeUserRole = (userData) => {
  if (!userData) return null;
  return {
    ...userData,
    role: String(userData.role || "").toLowerCase(),
  };
};

const normalizeAuthenticatedUser = (baseUser, profileData) => {
  if (!baseUser) return null;

  const accountId = profileData?.account_info?.id ?? profileData?.id ?? baseUser.id ?? baseUser.username ?? "";

  return {
    ...baseUser,
    ...profileData,
    id: accountId,
    account_info: profileData?.account_info || baseUser.account_info || null,
    hlv_id: profileData?.hlv_id ?? baseUser.hlv_id ?? null,
    role: String(profileData?.role || baseUser.role || "").toLowerCase(),
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("onus_user");
    return savedUser ? normalizeUserRole(JSON.parse(savedUser)) : null;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const hydrateCurrentUser = async () => {
      const token = localStorage.getItem("access_token");
      if (!token || !user) return;

      if (user.id) return;

      try {
        const response = await authApi.getProfile();
        const profileData = response?.data || null;
        const normalizedUser = normalizeAuthenticatedUser(user, profileData);

        if (normalizedUser) {
          setUser(normalizedUser);
          localStorage.setItem("onus_user", JSON.stringify(normalizedUser));
        }
      } catch (error) {
        console.error("Không thể đồng bộ hồ sơ người dùng hiện tại:", error);
      }
    };

    hydrateCurrentUser();
  }, [user]);

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
      const normalizedUser = normalizeUserRole(data.user);
      localStorage.setItem("onus_user", JSON.stringify(normalizedUser));

      // Cập nhật state người dùng
      setUser(normalizedUser);
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
    role: String(user?.role || "").toLowerCase(),
    currentUserId: String(user?.id || user?.account_info?.id || ""),
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