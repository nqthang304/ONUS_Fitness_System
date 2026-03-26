import { createBrowserRouter, Navigate } from "react-router-dom";
import { authLoader, loginLoader } from "@/loaders/auth.loaders";
import Login from "@/pages/login";
import MainLayout from "@/components/layout/mainLayout";
import Feed from "@/pages/Feed";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
    loader: loginLoader, // Chặn nếu đã login
  },
  {
    path: "/",
    element: <MainLayout />, 
    loader: authLoader, // Chặn nếu chưa login
    children: [
      {
        index: true, 
        element: <Feed />
      },
      {
        path: "theo-doi",
        element: <div>Đây là trang Theo dõi tập luyện</div>
      },
      {
        path: "lich-tap",
        element: <div>Đây là trang Lịch tập</div>
      },
      {
        path: "tin-nhan",
        element: <div>Đây là trang Nhắn tin</div>
      },
      {
        path: "thong-bao",
        element: <div>Đây là trang Thông báo</div>
      },
      {
        path: "quan-ly-hoi-vien",
        element: <div>Đây là trang Quản lý hội viên</div>
      },
      {
        path: "lich-day",
        element: <div>Đây là trang Lịch dạy</div>
      },
      {
        path: "bai-tap",
        element: <div>Đây là trang Quản lý bài tập</div>
      },
      {
        path: "lich-an",
        element: <div>Đây là trang Quản lý lịch ăn</div>
      },
      {
        path: "tai-khoan",
        element: <div>Đây là trang Quản lý tài khoản (Admin)</div>
      },
      {
        path: "ho-so",
        element: <div>Đây là trang Hồ sơ cá nhân</div>
      },
    ]
  },
  // Chuyển hướng về trang chủ nếu truy cập vào đường dẫn không tồn tại
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);