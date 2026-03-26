import { createBrowserRouter, Navigate } from "react-router-dom";
import { authLoader, loginLoader } from "@/loaders/auth.loaders";
import Login from "@/pages/login";
import MainLayout from "@/components/layout/mainLayout";
import Feed from "@/pages/Feed";
import MemberPage from "@/pages/memberPage";
import MealSchedulePage from "@/pages/mealSchedulePage";
import WorkoutSchedulePage from "@/pages/workoutSchedulePage";
import TrackingHubPage from "@/pages/trackingHub";
import MemberWorkoutPage from "@/pages/memberWorkoutPage";
import ResultPage from "@/pages/ResultPage";
import MessagePage from "@/pages/messagePage";
import NotificationPage from "@/pages/notificationPage";

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
        element: <TrackingHubPage />
      },
      {
        path: "lich-tap",
        element: <div>Đây là trang lịch tập</div>
      },
      {
        path: "tin-nhan",
        element: <MessagePage />
      },
      {
        path: "thong-bao",
        element: <NotificationPage />
      },
      {
        path: "quan-ly-hoi-vien",
        element: <MemberPage />
      },
      {
        path: "lich-day",
        element: <div>Đây là trang Lịch dạy</div>
      },
      {
        path: "bai-tap-cua-toi",
        element: <MemberWorkoutPage />
      },
      {
        path: "bai-tap",
        children: [
          {
            index: true,
            element: <WorkoutSchedulePage />
          }, 
          {
            path: ":memberId",
            element: <WorkoutSchedulePage />
          }
        ]
      },
      {
        path: "lich-an",
        children: [
          { index: true, element: <MealSchedulePage /> }, // Xem của bản thân (HoiVien)
          { path: ":memberId", element: <MealSchedulePage /> }, // Xem của từng hội viên (HLV)
        ]
      },
      {
        path: 'ket-qua',
        children: [
          { index: true, element: <ResultPage /> }, // Hub chọn (HLV) hoặc Xem của mình (Hội viên)
          { path: ":memberId", element: <ResultPage /> } // Xem chi tiết theo ID (HLV)
        ]
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