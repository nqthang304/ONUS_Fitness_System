import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/providers/auth.providers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileInfo } from "@/features/profile/profileInfo";
import { PasswordModal } from "@/features/profile/passwordModal";
import profileApi from "@/api/profileApi";

const normalizeProfile = (data) => {
  if (!data) return null;

  return {
    id: String(data.Id_HoiVien || data.Id_HLV || data.account_info?.username || data.username || ""),
    name: data.HoTen || "",
    phone: data.account_info?.username || data.username || "",
    dob: data.NgaySinh || "",
    gender: data.GioiTinh || "Nam",
    avatar: data.AnhDaiDien || null,
    role: data.role || "",
    hlvId: data.hlv_id || data.Id_HLV || null,
    trainerName: data.ten_hlv || "",
  };
};

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { memberId } = useParams();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const currentUserId = String(user?.id || user?.username || "");
  const currentUsername = String(user?.username || "");
  const currentRole = String(user?.role || "").toLowerCase();
  const canViewOtherProfiles = currentRole === "hlv" || currentRole === "admin";

  const isOwnerProfile =
    !memberId ||
    String(memberId) === currentUserId ||
    String(memberId) === currentUsername;

  useEffect(() => {
    let isCancelled = false;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        console.debug("[Profile] context", {
          currentUserId,
          currentUsername,
          currentRole,
          memberId,
          isOwnerProfile,
          canViewOtherProfiles,
          tokenPresent: Boolean(localStorage.getItem("access_token")),
        });

        if (memberId && !isOwnerProfile && !canViewOtherProfiles) {
          navigate("/ho-so", { replace: true });
          return;
        }

        const params = memberId && !isOwnerProfile
          ? (/^\d+$/.test(String(memberId)) ? { id: memberId } : { username: memberId })
          : {};

        console.debug("[Profile] request params", params);

        const response = await profileApi.getProfile(params);
        console.log("[Profile] backend response:", response.data);

        const normalized = normalizeProfile(response.data);
        if (!isCancelled) {
          setUserData(normalized);
        }
      } catch (error) {
        console.error("Lỗi khi lấy hồ sơ:", error);
        console.error("[Profile] error detail:", error?.response?.data);

        if (!isCancelled) {
          if (error.response?.status === 403) {
            setErrorMessage(error?.response?.data?.detail || "Bạn không có quyền xem hồ sơ này.");
            if (memberId && !isOwnerProfile) {
              navigate("/ho-so", { replace: true });
            }
          } else if (error.response?.status === 404) {
            setErrorMessage(error?.response?.data?.detail || "Không tìm thấy hồ sơ.");
          } else {
            setErrorMessage("Không tải được hồ sơ.");
          }
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchProfile();
    }

    return () => {
      isCancelled = true;
    };
  }, [canViewOtherProfiles, isOwnerProfile, memberId, navigate, user]);

  useEffect(() => {
    if (!isOwnerProfile && isEditing) {
      setIsEditing(false);
    }
  }, [isEditing, isOwnerProfile]);

  const handleSaveProfile = (updatedData) => {
    console.log("Dữ liệu cần gửi lên API cập nhật Profile:", updatedData);
    setUserData({ ...userData, ...updatedData });
  };

  const handleChangePassword = (currentPass, newPass) => {
    console.log("Gửi API đổi mật khẩu với:", { currentPass, newPass });
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải hồ sơ...</div>;
  if (!userData) return <div className="p-8 text-center text-red-500">{errorMessage || "Hồ sơ không tồn tại."}</div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto font-figtree w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          {isOwnerProfile ? "Hồ sơ cá nhân" : "Hồ sơ hội viên"}
        </h1>
        <p className="text-slate-500 text-sm">
          {isOwnerProfile
            ? "Quản lý thông tin cá nhân và bảo mật"
            : `Thông tin chi tiết của ${userData.name || "hội viên"}`}
        </p>
      </div>

      <ProfileInfo
        userData={userData}
        onSave={handleSaveProfile}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        canEdit={isOwnerProfile}
      />

      {isOwnerProfile && !isEditing && (
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

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onOpenChange={setIsPasswordModalOpen}
        onSubmit={handleChangePassword}
      />
    </div>
  );
};

export default ProfilePage;