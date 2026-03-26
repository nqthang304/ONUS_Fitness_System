import { useNavigate } from "react-router-dom";
import { Dumbbell, Utensils, FileText, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

// Mảng cấu hình các module để dễ dàng thêm/bớt sau này
const TRACKING_MODULES = [
  {
    id: "workout",
    title: "Bài tập hôm nay",
    description: "Xem danh sách bài tập cần thực hiện",
    icon: Dumbbell,
    path: "/lich-tap", // Đường dẫn tương ứng trong router của bạn
    bgIcon: "bg-blue-100",
    colorIcon: "text-blue-600",
  },
  {
    id: "diet",
    title: "Lịch ăn hôm nay",
    description: "Theo dõi chế độ dinh dưỡng",
    icon: Utensils,
    path: "/lich-an",
    bgIcon: "bg-green-100",
    colorIcon: "text-green-600",
  },
  {
    id: "results",
    title: "Kết quả tập luyện",
    description: "Xem chỉ số cơ thể và InBody",
    icon: FileText,
    path: "/ket-qua", 
    bgIcon: "bg-purple-100",
    colorIcon: "text-purple-600",
  },
];

const TrackingHubPage = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 w-fullmx-auto font-figtree">
      {/* Tiêu đề trang */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Theo dõi tập luyện</h2>
        <p className="text-slate-600">Quản lý bài tập và dinh dưỡng cá nhân</p>
      </div>

      {/* Grid danh sách các thẻ chức năng */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TRACKING_MODULES.map((module) => {
          const IconComponent = module.icon;

          return (
            <Card 
              key={module.id} 
              // Thêm class hover và cursor-pointer để cả thẻ có thể click được
              className="p-8 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group flex flex-col h-full bg-white"
              onClick={() => navigate(module.path)}
            >
              {/* Icon Box */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${module.bgIcon}`}>
                <IconComponent className={`w-7 h-7 ${module.colorIcon}`} />
              </div>

              {/* Nội dung text (flex-1 để đẩy nút Xem chi tiết xuống đáy) */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{module.title}</h3>
                <p className="text-sm text-slate-500">{module.description}</p>
              </div>

              {/* Nút Xem chi tiết */}
              <div className="mt-8 flex items-center text-blue-600 font-bold text-sm group-hover:text-blue-700">
                Xem chi tiết 
                <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TrackingHubPage;