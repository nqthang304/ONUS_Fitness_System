import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";

const MainLayout = () => {
  return (
    // <div className="flex h-screen bg-white overflow-hidden font-figtree">
    //   <Sidebar />
    //   <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 overflow-hidden">
        
    //     {/* <header className="h-16 border-bottom bg-white flex items-center px-8 shadow-sm">
    //        <h2 className="font-bold text-slate-800">Tiêu đề trang</h2>
    //     </header> 
    //     */}

    //     <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
    //       <div className="w-full">
    //          <Outlet />
    //       </div>
    //     </div>
    //   </main>
    // </div>
    <div className="flex h-screen bg-white overflow-hidden font-figtree">
      {/* 1. SIDEBAR CỐ ĐỊNH BÊN TRÁI */}
      <Sidebar />

      {/* 2. VÙNG NỘI DUNG CHÍNH */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 overflow-hidden">
        
        {/* - flex-1: Chiếm hết diện tích còn lại
          - overflow-y-auto: Chỉ cho phép cuộn bên trong vùng này
          - p-0: Đảm bảo không có padding mặc định từ cha
        */}
        <div className="flex-1 overflow-y-auto w-full">
           {/* Outlet bây giờ sẽ chạm sát mép Sidebar và mép phải màn hình */}
           <Outlet />
        </div>

      </main>
    </div>
  );
};

export default MainLayout;