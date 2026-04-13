import { useAuth } from "@/providers/auth.providers";
import { cn } from "@/lib/utils";
import {
  LayoutGrid, Activity, Calendar, MessageSquare,
  Bell, User, Users, Dumbbell, Utensils,
  ClipboardList, UserCog, LogOut
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { NavLink } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState, useMemo } from "react";

const Sidebar = () => {
  const { user, role, logout } = useAuth();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // Chuẩn hóa role về chữ thường để tránh lỗi lệch case (HLV vs hlv)
  const currentRole = role?.toLowerCase();

  const displayName = user?.ho_ten || user?.HoTen || user?.tenHienThi || "Chưa đăng nhập";

  // Dùng useMemo để định nghĩa menu, tránh render lại vô ích và cho phép dùng biến 'user'
  const menuConfig = useMemo(() => ({
    hoivien: [
      { icon: LayoutGrid, label: "Trang chủ", path: "/" },
      { icon: Activity, label: "Theo dõi tập luyện", path: "/theo-doi" },
      { icon: Calendar, label: "Lịch tập", path: "/lich-tap" },
      { icon: MessageSquare, label: "Nhắn tin", path: "/tin-nhan" },
      { icon: Bell, label: "Thông báo", path: "/thong-bao" },
      { icon: User, label: "Hồ sơ", path: "/ho-so" },
    ],
    hlv: [
      { icon: LayoutGrid, label: "Trang chủ", path: "/" },
      { icon: Users, label: "Hội viên", path: "/quan-ly-hoi-vien" },
      { icon: Calendar, label: "Lịch dạy", path: "/lich-day" },
      { icon: Dumbbell, label: "Quản lý bài tập", path: "/bai-tap" },
      { icon: Utensils, label: "Quản lý lịch ăn", path: "/lich-an" },
      { icon: ClipboardList, label: "Kết quả tập luyện", path: "/ket-qua" },
      { icon: MessageSquare, label: "Nhắn tin", path: "/tin-nhan" },
      { icon: Bell, label: "Thông báo", path: "/thong-bao" },
      // SỬA TẠI ĐÂY: Dùng template literal để truyền username vào URL
      { icon: User, label: "Hồ sơ", path: `/ho-so` }, 
    ],
    admin: [
      { icon: LayoutGrid, label: "Trang chủ", path: "/" },
      { icon: UserCog, label: "Quản lý tài khoản", path: "/tai-khoan" },
      { icon: Bell, label: "Thông báo", path: "/thong-bao" },
      { icon: User, label: "Hồ sơ", path: "/ho-so" },
    ],
  }), [user]); // Cập nhật menu nếu thông tin user thay đổi

  const currentMenu = menuConfig[currentRole] || [];

  return (
    <aside className="w-72 h-screen flex flex-col bg-white border-r border-slate-100 font-figtree sticky top-0">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-onus-blue w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shadow-blue-100">
          <Activity className="text-white w-6 h-6" />
        </div>
        <span className="text-2xl font-bold text-onus-blue tracking-tight">ONUS</span>
      </div>

      <Separator className="mx-6 bg-slate-50" />

      {/* Danh sách Menu */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
        {currentMenu.length > 0 ? (
          currentMenu.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) => cn(
                "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-blue-50 text-onus-blue font-bold shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn(
                    "w-5 h-5",
                    isActive ? "text-onus-blue" : "text-slate-400 group-hover:text-slate-600"
                  )} />
                  <span className="text-[15px]">{item.label}</span>
                </>
              )}
            </NavLink>
          ))
        ) : (
          <div className="text-xs text-slate-400 text-center py-10">Không có menu cho quyền này</div>
        )}
      </nav>

      <Separator className="bg-slate-50" />

      {/* User Profile Bottom */}
      <div className="p-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="w-10 h-10 border-2 border-slate-50">
            {/* Nếu có AnhDaiDien từ API thì hiển thị */}
            <AvatarImage src={user?.AnhDaiDien} alt={displayName} />
            <AvatarFallback className="bg-blue-100 text-onus-blue font-bold">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-bold text-slate-900 truncate">
              {displayName}
            </span>
            <span className="text-[11px] text-slate-400 capitalize">
              {currentRole === "hoivien" ? "Hội viên" : currentRole === "hlv" ? "Huấn luyện viên" : "Quản trị viên"}
            </span>
          </div>
        </div>

        <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
          <AlertDialogTrigger asChild>
            <button
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl border-none">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-slate-900">Bạn muốn đăng xuất?</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl border-none bg-slate-100">Hủy</AlertDialogCancel>
              <AlertDialogAction 
                onClick={logout}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
              >
                Đăng xuất
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  );
};

export default Sidebar;