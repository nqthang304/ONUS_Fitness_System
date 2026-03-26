import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/providers/auth.providers";
import { MemberDayTabs } from "@/features/memberWorkout/MemberDayTabs";
import { MemberWorkoutTable } from "@/features/memberWorkout/MemberWorkoutTable";

// MOCK DATA (Thay bằng API thật sau này)
const MOCK_DB_BAI_TAP = [
    { id: 1, Id_HoiVien: "3", ThuTuNgayTap: 1 },
    { id: 2, Id_HoiVien: "3", ThuTuNgayTap: 2 },
];

const MOCK_DB_CHI_TIET = [
    { Id: 1, Id_BaiTap: 1, MucLuc: "KHOI_DONG", TenBai: "Dynamic Stretching", ThoiGian: "5 phút", SoLan: "-", SoHiep: "1", Nghi: "-", CuongDo: "-" },
    { Id: 2, Id_BaiTap: 1, MucLuc: "BAI_TAP_CHINH", TenBai: "A. DB Bulgarian Split Squat", ThoiGian: "-", SoLan: "10", SoHiep: "3", Nghi: "60s", CuongDo: "RPE 7" },
    { Id: 3, Id_BaiTap: 2, MucLuc: "CARDIO", TenBai: "Chạy bộ", ThoiGian: "15 phút", SoLan: "-", SoHiep: "1", Nghi: "-", CuongDo: "RPE 6" },
];

const MemberWorkoutPage = () => {
    const { user } = useAuth();
    const { memberId } = useParams();
    const currentUserId = memberId || String(user?.id || "3");

    const [days, setDays] = useState([]);
    const [activeDayId, setActiveDayId] = useState(null);
    const [allExercises, setAllExercises] = useState([]);

    // Tải dữ liệu từ DB (Chỉ lấy bài của Hội viên này)
    useEffect(() => {
        const myDays = MOCK_DB_BAI_TAP.filter(bt => bt.Id_HoiVien === currentUserId);

        // Sắp xếp ngày tập theo ThuTuNgayTap để đảm bảo DAY A, B, C đúng thứ tự
        myDays.sort((a, b) => a.ThuTuNgayTap - b.ThuTuNgayTap);

        setDays(myDays);

        if (myDays.length > 0) {
            setActiveDayId(myDays[0].id); // Mặc định chọn ngày đầu tiên
        }

        // Load tất cả chi tiết bài tập
        setAllExercises(MOCK_DB_CHI_TIET);
    }, [currentUserId]);

    // Lọc bài tập theo Ngày (Tab) đang được chọn
    const currentExercises = allExercises.filter(ex => ex.Id_BaiTap === activeDayId);

    return (
        <div className="flex flex-col gap-3 w-full p-4">
            <header >
                <h2 className="text-2xl font-bold text-slate-900">Bài tập của tôi</h2>
            </header>

            {days.length > 0 ? (
                <div className="w-full">
                    {/* Component Tabs */}
                    <MemberDayTabs
                        days={days}
                        activeDayId={activeDayId}
                        onDaySelect={setActiveDayId}
                    />

                    {/* Component Bảng dữ liệu */}
                    <MemberWorkoutTable
                        exercises={currentExercises}
                    />
                </div>
            ) : (
                <div className="w-full text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-100">
                    Hiện tại bạn chưa có lịch tập nào.
                </div>
            )}

        </div>
    );
};

export default MemberWorkoutPage;