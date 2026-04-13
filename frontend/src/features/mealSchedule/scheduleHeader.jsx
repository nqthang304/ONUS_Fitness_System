import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const ScheduleHeader = ({
  isEditing,
  setIsEditing,
  role,
  onBack,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  isSubmitting = false,
}) => {
  const currentRole = String(role || "").toLowerCase();

  const handleStartEdit = () => {
    if (onStartEdit) {
      onStartEdit();
      return;
    }
    setIsEditing?.(true);
  };

  const handleCancelEdit = () => {
    if (onCancelEdit) {
      onCancelEdit();
      return;
    }
    setIsEditing?.(false);
  };

  const handleSaveEdit = () => {
    if (onSaveEdit) {
      onSaveEdit();
      return;
    }
    setIsEditing?.(false);
  };

  return (
    <div className="flex justify-between items-center pb-4 font-figtree">
      <div className="flex items-center gap-3">
        {currentRole !== "hoivien" && (
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

      {currentRole !== "hoivien" && (
        <div className="flex gap-3">
          {isEditing ? (
            <Button className="rounded-xl bg-blue-600 hover:bg-blue-700" onClick={handleSaveEdit} disabled={isSubmitting}>
              Xong
            </Button>
          ) : (
            <Button className="rounded-xl bg-blue-600 hover:bg-blue-700" onClick={handleStartEdit} disabled={isSubmitting}>
              Thêm thực đơn
            </Button>
          )}
        </div>
      )}
    </div>
  );
};