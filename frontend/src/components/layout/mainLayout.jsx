import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";

const MainLayout = () => {
  return (
    <div className="flex h-screen bg-white overflow-hidden font-figtree">
      {/* 1. THANH SIDEBAR CỐ ĐỊNH BÊN TRÁI */}
      <Sidebar />

      {/* 2. VÙNG NỘI DUNG CHÍNH BÊN PHẢI */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 overflow-hidden">
        
        {/* Header giả (Optional): Bạn có thể thêm thanh Search hoặc Thông báo ở đây sau này */}
        {/* <header className="h-16 border-bottom bg-white flex items-center px-8 shadow-sm">
           <h2 className="font-bold text-slate-800">Tiêu đề trang</h2>
        </header> 
        */}

        {/* VÙNG CUỘN NỘI DUNG TRANG CON */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto">
             {/* Outlet: Nơi các component con (Feed, Profile, v.v.) sẽ render vào */}
             <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;