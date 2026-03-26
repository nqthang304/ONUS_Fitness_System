import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const DayTabs = ({ days, activeDayId, onDaySelect, onAddDay, onDeleteDay }) => {
  // Hàm dịch số 1, 2, 3 thành A, B, C
  const getDayLetter = (index) => String.fromCharCode(65 + index);

  return (
    <div className="flex bg-white rounded-t-2xl border border-slate-100 border-b-0 overflow-hidden font-figtree">
      {days.map((day, index) => {
        const isActive = activeDayId === day.id;
        return (
          <button
            key={day.id}
            onClick={() => onDaySelect(day.id)}
            className={cn(
              "flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors border-r border-slate-100 relative group flex items-center justify-center gap-2",
              isActive ? "text-orange-600 bg-white" : "text-slate-500 bg-slate-50 hover:bg-slate-100"
            )}
          >
            DAY {getDayLetter(index)}
            {/* Nút xóa ngày hiện ra khi tab đang được active */}
            {isActive && (
              <Trash2 
                className="w-4 h-4 text-slate-300 hover:text-red-500 absolute right-4 transition-colors z-10" 
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn sự kiện click lan ra tab
                  onDeleteDay(day.id);
                }}
              />
            )}
            {isActive && <div className="absolute top-0 left-0 right-0 h-1 bg-orange-600" />}
          </button>
        );
      })}
      
      <button onClick={onAddDay} className="flex-1 py-4 text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 flex items-center justify-center gap-2 transition-colors">
        <Plus className="w-4 h-4" /> Thêm ngày
      </button>
    </div>
  );
};