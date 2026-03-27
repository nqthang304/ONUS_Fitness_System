import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth.providers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { ProfileInfo } from "@/features/profile/profileInfo";
import { PasswordModal } from "@/features/profile/passwordModal";

// --- MOCK DATABASE ---
const MOCK_DB_USERS = [
  { id: "1", name: "Quản trị hệ thống", phone: "0999999999", dob: "1990-01-01", gender: "Nam" },
  { id: "2", name: "HLV B", phone: "0988888888", dob: "1993-06-12", gender: "Nam" },
  { id: "3", name: "Hội viên C", phone: "0901234567", dob: "2001-11-05", gender: "Nữ" },
];

const ProfilePage = () => {
  const { user } = useAuth(); // Lấy thông tin user đang đăng nhập
  const currentUserId = String(user?.id || "");

  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Giả lập Fetch dữ liệu cá nhân
  useEffect(() => {
    const data = MOCK_DB_USERS.find(u => u.id === currentUserId);
    if (data) {
      setUserData(data);
      return;
    }

    if (user) {
      setUserData({
        id: String(user.id),
        name: user.tenHienThi || "Người dùng",
        phone: user.soDienThoai || "",
        dob: "",
        gender: "Nam",
      });
      return;
    }

    setUserData(null);
  }, [currentUserId, user]);

  // Xử lý lưu thông tin chung
  const handleSaveProfile = (updatedData) => {
    console.log("Dữ liệu cần gửi lên API cập nhật Profile:", updatedData);
    // TODO: Gọi API PUT/PATCH lên server
    setUserData({ ...userData, ...updatedData }); // Cập nhật state nội bộ cho UI nhảy số
  };

  // Xử lý đổi mật khẩu
  const handleChangePassword = (currentPass, newPass) => {
    console.log("Gửi API đổi mật khẩu với:", { currentPass, newPass });
    // TODO: Gọi API POST lên server
  };

  if (!userData) return <div className="p-8 text-center text-slate-500">Đang tải...</div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto font-figtree w-full">
      {/* Tiêu đề trang */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Hồ sơ cá nhân</h1>
        <p className="text-slate-500 text-sm">Quản lý thông tin cá nhân và bảo mật</p>
      </div>

      {/* Component 1: Khối thông tin chung (Có form Xem/Sửa) */}
      <ProfileInfo userData={userData} onSave={handleSaveProfile} isEditing={isEditing} setIsEditing={setIsEditing} />

      {/* Component 2: Khối bảo mật (Đổi mật khẩu) */}
      {!isEditing && (
        <Card className="p-6 md:p-8 rounded-2xl border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Bảo mật</h3>
            <p className="text-sm text-slate-500 mt-1">Đổi mật khẩu và bảo mật tài khoản</p>
          </div>
          <Button 
            variant="outline" 
            className="rounded-xl font-medium border-slate-200 text-slate-700 hover:bg-slate-50 h-10 px-6 shrink-0"
            onClick={() => setIsPasswordModalOpen(true)}
          >
            Đổi mật khẩu
          </Button>
        </Card>
      )}

      {/* Modal nhập mật khẩu */}
      <PasswordModal 
        isOpen={isPasswordModalOpen} 
        onOpenChange={setIsPasswordModalOpen} 
        onSubmit={handleChangePassword} 
      />
    </div>
  );
};

export default ProfilePage;