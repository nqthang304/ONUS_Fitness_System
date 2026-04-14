import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth.providers";
import { CalendarGrid } from "@/features/trainerSchedule/calendarGrid";
import scheduleApi from "@/api/scheduleApi";
import profileApi from "@/api/profileApi";

const MemberSchedulePage = () => {
  const { user } = useAuth();
  const [mySchedules, setMySchedules] = useState([]);
  const [myHlvName, setMyHlvName] = useState("Đang cập nhật...");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [profileResponse, scheduleResponse] = await Promise.all([
          profileApi.getProfile(),
          scheduleApi.getLichTap(),
        ]);

        const profileData = profileResponse?.data || {};
        const accountUserId = profileData?.account_info?.id;
        const schedulesData = scheduleResponse?.data?.results || [];

        // Lấy lịch theo id user của hội viên (Id_taikhoan do BE trả về)
        const myData = accountUserId
          ? schedulesData.filter((sch) => String(sch.Id_taikhoan) === String(accountUserId))
          : schedulesData;

        setMySchedules(myData);

        // Hiển thị tên HLV từ dữ liệu lịch, fallback sang profile
        const hlvFromSchedule = myData[0]?.HLVHoTen;
        const hlvFromProfile = profileData?.ten_hlv;
        setMyHlvName(hlvFromSchedule || hlvFromProfile || "Chưa có HLV");
      } catch (err) {
        console.error("Lỗi khi lấy lịch tập hội viên:", err);
        setMySchedules([]);
        setMyHlvName("Đang cập nhật...");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  return (
    <div className="flex flex-col gap-3 w-full p-4 font-figtree">
      <header className="flex flex-col gap-1 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Lịch tập của tôi</h2>
        <p className="text-slate-600">Xem thời gian và lịch hẹn với huấn luyện viên</p>
      </header>

      {isLoading ? (
        <div className="bg-white p-8 text-center text-slate-400 border border-slate-100 rounded-2xl shadow-sm">
          Đang tải lịch tập...
        </div>
      ) : (
        <CalendarGrid
          schedules={mySchedules}
          hideDelete={true}
          getScheduleLabel={() => `HLV: ${myHlvName}`}
        />
      )}
    </div>
  );
};

export default MemberSchedulePage;