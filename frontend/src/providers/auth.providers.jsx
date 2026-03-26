import { createContext, useContext, useState } from "react";

// 1. Cập nhật DB giả: Tất cả đều dùng Số điện thoại
const MOCK_USERS = [
  { id: 1, soDienThoai: "0999999999", password: "123", tenHienThi: "Quản trị hệ thống", role: "ADMIN" },
  { id: 2, soDienThoai: "0988888888", password: "123", tenHienThi: "HLV B", role: "HLV" },
  { id: 3, soDienThoai: "0901234567", password: "123", tenHienThi: "Hội viên C", role: "HOIVIEN",hlv_id: 2 },
];

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("onus_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isLoading, setIsLoading] = useState(false);

  // 2. Đổi tham số nhận vào thành soDienThoai cho chuẩn ngữ nghĩa
  const login = async (soDienThoai, password) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Tìm người dùng dựa trên Số điện thoại
    const foundUser = MOCK_USERS.find(
      (u) => u.soDienThoai === soDienThoai && u.password === password
    );

    if (foundUser) {
      const { password, ...userToSave } = foundUser;
      localStorage.setItem("onus_user", JSON.stringify(userToSave));
      setUser(userToSave);
      setIsLoading(false);
      window.location.href = "/";
    } else {
      setIsLoading(false);
      return "Số điện thoại hoặc mật khẩu không chính xác!";
    }
  };

  const logout = () => {
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