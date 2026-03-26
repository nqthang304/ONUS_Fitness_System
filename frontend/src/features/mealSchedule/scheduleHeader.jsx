import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const ScheduleHeader = ({ isEditing, setIsEditing, role, onBack }) => {
  return (
    <div className="flex justify-between items-center pb-4 font-figtree">
      <div className="flex items-center gap-3">
        {role !== "HOIVIEN" && (
          <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditing ? "Thiết kế thực đơn" : "Lịch ăn hôm nay"}
          </h1>
          {isEditing && <p className="text-slate-500 text-sm mt-1">Tùy chỉnh dinh dưỡng theo mục tiêu cá nhân.</p>}
        </div>
      </div>

      {role !== "HOIVIEN" && (
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl">Hủy bỏ</Button>
              <Button className="rounded-xl bg-blue-600 hover:bg-blue-700" onClick={() => setIsEditing(false)}>
                Lưu thực đơn
              </Button>
            </>
          ) : (
            <Button className="rounded-xl bg-blue-600 hover:bg-blue-700" onClick={() => setIsEditing(true)}>
              Thêm thực đơn
            </Button>
          )}
        </div>
      )}
    </div>
  );
};