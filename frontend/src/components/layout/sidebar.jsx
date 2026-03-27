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
import { useState } from "react";

const Sidebar = () => {
  const { user, role, logout } = useAuth();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // Cấu hình Menu cho từng Role
  const menuConfig = {
    HOIVIEN: [
      { icon: LayoutGrid, label: "Trang chủ", path: "/" },
      { icon: Activity, label: "Theo dõi tập luyện", path: "/theo-doi" },
      { icon: Calendar, label: "Lịch tập", path: "/lich-tap" },
      { icon: MessageSquare, label: "Nhắn tin", path: "/tin-nhan" },
      { icon: Bell, label: "Thông báo", path: "/thong-bao" },
      { icon: User, label: "Hồ sơ", path: "/ho-so" },
    ],
    HLV: [
      { icon: LayoutGrid, label: "Trang chủ", path: "/" },
      { icon: Users, label: "Hội viên", path: "/quan-ly-hoi-vien" },
      { icon: Calendar, label: "Lịch dạy", path: "/lich-day" },
      { icon: Dumbbell, label: "Quản lý bài tập", path: "/bai-tap" },
      { icon: Utensils, label: "Quản lý lịch ăn", path: "/lich-an" },
      { icon: ClipboardList, label: "Kết quả tập luyện", path: "/ket-qua" },
      { icon: MessageSquare, label: "Nhắn tin", path: "/tin-nhan" },
      { icon: Bell, label: "Thông báo", path: "/thong-bao" },
      { icon: User, label: "Hồ sơ", path: "/ho-so" },
    ],
    ADMIN: [
      { icon: LayoutGrid, label: "Trang chủ", path: "/" },
      { icon: UserCog, label: "Quản lý tài khoản", path: "/tai-khoan" },
      { icon: Bell, label: "Thông báo", path: "/thong-bao" },
    ],
  };

  const currentMenu = menuConfig[role] || [];

  return (
    <aside className="w-72 h-screen flex flex-col bg-white border-r border-slate-100 font-figtree">
      {/* Logo Phần đầu */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-onus-blue w-10 h-10 rounded-lg flex items-center justify-center">
          <Activity className="text-white w-6 h-6" />
        </div>
        <span className="text-2xl font-bold text-onus-blue tracking-tight">ONUS</span>
      </div>

      <Separator className="bg-slate-50" />

      {/* Danh sách Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {currentMenu.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            // isActive là giá trị boolean React Router trả về để biết URL có khớp ko
            className={({ isActive }) => cn(
              "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group",
              isActive
                ? "bg-blue-50 text-onus-blue font-semibold"
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
        ))}
      </nav>

      <Separator className="bg-slate-50" />

      {/* Phần User Profile dưới cùng */}
      <div className="p-4 flex items-center justify-between gap-3 group">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border-2 border-slate-100">
            <AvatarImage src="" />
            <AvatarFallback className="bg-slate-100 text-slate-500 font-bold">
              {user?.tenHienThi?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900 line-clamp-1">
              {user?.tenHienThi || "Chưa đăng nhập"}
            </span>
            <span className="text-xs text-slate-400 capitalize">
              {role === "HOIVIEN" ? "Hội viên" : role === "HLV" ? "Huấn luyện viên" : "Quản trị viên"}
            </span>
          </div>
        </div>

        <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
          <AlertDialogTrigger asChild>
            <button
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Đăng xuất"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </AlertDialogTrigger>

          <AlertDialogContent className="max-w-[400px] rounded-2xl font-figtree p-5 gap-4">
            <AlertDialogHeader className="items-start text-left sm:text-left">
              <AlertDialogTitle className="text-left text-lg font-bold leading-snug text-slate-900">
                Xác nhận đăng xuất
                <br />
                <span className="font-normal text-slate-600">
                  Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
                </span>
              </AlertDialogTitle>
            </AlertDialogHeader>

            <AlertDialogFooter className="flex flex-row w-full items-center gap-3 mt-4 sm:space-x-0">
              <AlertDialogCancel className="flex-1 h-10 mt-0 rounded-xl bg-slate-100 hover:bg-slate-200 border-none text-slate-700 font-medium text-center">
                Hủy
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={logout}
                className="flex-1 h-10 rounded-xl !text-white font-medium text-center !bg-red-600 hover:!bg-red-700"
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