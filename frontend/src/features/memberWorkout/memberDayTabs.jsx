import { cn } from "@/lib/utils";

export const MemberDayTabs = ({ days, activeDayId, onDaySelect }) => {
  // Hàm dịch số (index 0, 1, 2) thành ký tự (A, B, C)
  const getDayLetter = (index) => String.fromCharCode(65 + index);

  return (
    <div className="flex w-full bg-white rounded-t-2xl border border-slate-100 border-b-0 overflow-hidden font-figtree">
      {days.map((day, index) => {
        const isActive = activeDayId === day.id;
        
        return (
          <button
            key={day.id}
            onClick={() => onDaySelect(day.id)}
            className={cn(
              "flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors border-r border-slate-100 last:border-r-0 relative flex items-center justify-center",
              isActive ? "text-orange-600 bg-white" : "text-slate-500 bg-slate-50 hover:bg-slate-100"
            )}
          >
            DAY {getDayLetter(index)}
            {/* Đường gạch ngang màu cam khi tab được chọn */}
            {isActive && <div className="absolute top-0 left-0 right-0 h-1 bg-orange-600" />}
          </button>
        );
      })}
    </div>
  );
};