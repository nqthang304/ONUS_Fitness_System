import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth.providers";
import { CalendarGrid } from "@/features/trainerSchedule/calendarGrid";
import { DB_HOI_VIEN, DB_LICH_TAP } from "@/features/trainerSchedule/mockData";
import { DB_HLV } from "@/features/adminAccount/mockData";

const MemberSchedulePage = () => {
  const { user } = useAuth();
  const currentMemberId = String(user?.id || "3");

  const [mySchedules, setMySchedules] = useState([]);
  const [myHlvName, setMyHlvName] = useState("Đang cập nhật...");

  useEffect(() => {
    // Lấy thông tin HLV phụ trách
    const currentMemberData = DB_HOI_VIEN.find(m => String(m.Id_TaiKhoan) === currentMemberId);
    if (currentMemberData) {
      // Lấy tên HLV
      const hlvData = DB_HLV.find(h => String(h.Id_TaiKhoan) === String(currentMemberData.Id_HLV));
      if (hlvData) setMyHlvName(hlvData.HoTen);
    }

    // 3. Lấy lịch tập chỉ của hội viên này
    const schedules = DB_LICH_TAP.filter(sch => String(sch.Id_HoiVien) === currentMemberId);
    setMySchedules(schedules);
  }, [currentMemberId]);

  return (
    <div className="flex flex-col gap-3 w-full p-4 font-figtree">
      <header className="flex flex-col gap-1 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Lịch tập của tôi</h2>
        <p className="text-slate-600">Xem thời gian và lịch hẹn với huấn luyện viên</p>
      </header>

      <CalendarGrid
        schedules={mySchedules}
        members={DB_HOI_VIEN}
        hideDelete={true}
        getScheduleLabel={() => `HLV: ${myHlvName}`}
      />
    </div>
  );
};

export default MemberSchedulePage;