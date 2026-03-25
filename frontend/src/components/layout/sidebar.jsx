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

const Sidebar = () => {
  const { user, role, logout } = useAuth();

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
        
        <button 
          onClick={logout}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          title="Đăng xuất"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;