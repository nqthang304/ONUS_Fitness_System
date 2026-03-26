import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const ResultHeader = ({ role, latestDate, onAddClick, onBack }) => {
  // Chuyển đổi format ngày từ YYYY-MM-DD sang D-M-YYYY cho giống thiết kế
  const formatDate = (dateStr) => {
    if (!dateStr) return "Chưa có dữ liệu";
    const date = new Date(dateStr);
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  };

  return (
    <div className="flex justify-between items-center pb-4 font-figtree">
      <div className="flex items-center gap-3">
        {role !== "HOIVIEN" && onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kết quả tập luyện</h1>
          <p className="text-slate-500 text-sm mt-1">
            Cập nhật lần cuối: <span className="font-medium">{formatDate(latestDate)}</span>
          </p>
        </div>
      </div>

      {role !== "HOIVIEN" && (
        <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 h-10 px-6 font-semibold shadow-sm" onClick={onAddClick}>
          Thêm mới
        </Button>
      )}
    </div>
  );
};