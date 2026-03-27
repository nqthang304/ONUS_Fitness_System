import { X } from "lucide-react";
import { parseTimeToMinutes } from "./mockData";

export const CalendarGrid = ({ schedules, members, onDeleteClick, hideDelete = false, getScheduleLabel }) => {
  const days = [
    { label: "Thứ 2", value: 2 }, { label: "Thứ 3", value: 3 },
    { label: "Thứ 4", value: 4 }, { label: "Thứ 5", value: 5 },
    { label: "Thứ 6", value: 6 }, { label: "Thứ 7", value: 7 }
  ];
  
  // Khung giờ hiển thị: 06:00 đến 22:00 (16 tiếng)
  const START_HOUR = 6;
  const TOTAL_HOURS = 16;
  const HOUR_HEIGHT = 60; // 1 pixel = 1 phút

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden font-figtree">
      {/* Header (Thứ) */}
      <div className="grid grid-cols-[60px_repeat(6,1fr)] bg-slate-50 border-b border-slate-100 text-sm font-bold text-slate-600">
        <div className="p-4 text-center border-r border-slate-100">GMT+7</div>
        {days.map(day => (
          <div key={day.value} className="p-4 text-center border-r border-slate-100 last:border-r-0 uppercase tracking-wider">
            {day.label}
          </div>
        ))}
      </div>

      {/* Body Lịch */}
      <div className="grid grid-cols-[60px_repeat(6,1fr)] relative h-[960px] overflow-y-auto custom-scrollbar">
        
        {/* Lưới ngang (Hiển thị các mốc giờ) */}
        <div className="absolute inset-0 pointer-events-none grid grid-rows-[repeat(16,60px)]">
          {Array.from({ length: TOTAL_HOURS }).map((_, i) => (
            <div key={i} className="border-b border-slate-50 w-full" />
          ))}
        </div>

        {/* Cột 0: Các mốc giờ (06:00, 07:00...) */}
        <div className="border-r border-slate-100 bg-white z-10">
          {Array.from({ length: TOTAL_HOURS }).map((_, i) => (
            <div key={i} className="h-[60px] text-xs font-semibold text-slate-400 text-right pr-2 pt-1">
              {String(START_HOUR + i).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* 6 Cột: Các ngày trong tuần */}
        {days.map(day => {
          const daySchedules = schedules.filter(s => s.ThuTrongTuan === day.value);
          
          return (
            <div key={day.value} className="relative border-r border-slate-100 last:border-r-0">
              {daySchedules.map(sch => {
                const startMins = parseTimeToMinutes(sch.GioBatDau);
                const endMins = parseTimeToMinutes(sch.GioKetThuc);
                const duration = endMins - startMins;
                const topPosition = startMins - (START_HOUR * 60);
                
                // Lấy tên hội viên
                const memberName = members.find(m => m.Id_TaiKhoan === sch.Id_HoiVien)?.HoTen || "Hội viên";
                const scheduleLabel = getScheduleLabel
                  ? getScheduleLabel({ schedule: sch, memberName })
                  : memberName;

                return (
                  <div 
                    key={sch.Id}
                    // Tính toán vị trí top và height dựa trên số phút (1px = 1phút)
                    style={{ top: `${topPosition}px`, height: `${duration}px` }}
                    className="absolute left-1 right-1 bg-blue-100 border border-blue-200 rounded-lg p-2 overflow-hidden shadow-sm group hover:z-20 transition-all hover:ring-2 hover:ring-blue-400"
                  >
                    <div className={`font-bold text-blue-800 text-sm leading-tight truncate ${hideDelete ? "" : "pr-4"}`}>{scheduleLabel}</div>
                    <div className="text-xs text-blue-600 font-medium mt-0.5">{sch.GioBatDau} - {sch.GioKetThuc}</div>
                    
                    {/* Nút hủy (ẩn mặc định, hover mới hiện) */}
                    {!hideDelete && onDeleteClick && (
                      <button 
                        className="absolute top-1 right-1 w-5 h-5 bg-white/50 hover:bg-red-500 hover:text-white text-blue-800 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        onClick={(e) => { e.stopPropagation(); onDeleteClick(sch, memberName); }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};