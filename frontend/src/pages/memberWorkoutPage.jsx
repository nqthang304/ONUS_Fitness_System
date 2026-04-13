import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth.providers";
import profileApi from "@/api/profileApi";
import workoutApi from "@/api/workoutApi";
import { MemberDayTabs } from "@/features/memberWorkout/MemberDayTabs";
import { MemberWorkoutTable } from "@/features/memberWorkout/MemberWorkoutTable";

const SECTION_MAP = {
    KhoiDong: "KHOI_DONG",
    BaiTapChinh: "BAI_TAP_CHINH",
    Cardio: "CARDIO",
    GianCo: "GIAN_CO",
    KHOI_DONG: "KHOI_DONG",
    BAI_TAP_CHINH: "BAI_TAP_CHINH",
    CARDIO: "CARDIO",
    GIAN_CO: "GIAN_CO",
};

const normalizeSection = (value) => SECTION_MAP[value] || "BAI_TAP_CHINH";

const MemberWorkoutPage = () => {
    const { user } = useAuth();
    const [currentUserId, setCurrentUserId] = useState("");

    const [days, setDays] = useState([]);
    const [activeDayId, setActiveDayId] = useState(null);
    const [allExercises, setAllExercises] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const resolveCurrentUserId = async () => {
            try {
                const response = await profileApi.getProfile();
                const profileData = response?.data || {};
                const accountUserId = profileData?.account_info?.id || profileData?.account_info?.username || profileData?.username || "";

                setCurrentUserId(String(accountUserId));
            } catch (profileError) {
                console.error("Lỗi khi lấy hồ sơ hiện tại:", profileError);
                setCurrentUserId(String(user?.id || user?.username || ""));
            }
        };

        resolveCurrentUserId();
    }, [user]);

    // Tải dữ liệu từ API (Chỉ lấy bài của Hội viên này)
    useEffect(() => {
        if (!currentUserId) {
            setDays([]);
            setActiveDayId(null);
            setAllExercises([]);
            setError("");
            return;
        }

        const fetchWorkout = async () => {
            setIsLoading(true);
            setError("");

            try {
                const response = await workoutApi.getWorkoutByUserId(currentUserId);
                const results = Array.isArray(response?.data?.results) ? response.data.results : [];

                const nextDays = results.map((item, index) => ({
                    id: item?.Id_BaiTap,
                    Id_BaiTap: item?.Id_BaiTap,
                    Id_HoiVien: String(item?.id_hoivien || currentUserId),
                    ThuTuNgayTap: item?.ThuTuNgayTap || String(index + 1),
                }));

                const nextExercises = results.flatMap((item) => {
                    const chiTietList = Array.isArray(item?.chitietbaitap) ? item.chitietbaitap : [];

                    return chiTietList.map((detail, index) => ({
                        Id: detail?.id || `${item?.Id_BaiTap}-${index}`,
                        Id_BaiTap: item?.Id_BaiTap,
                        MucLuc: normalizeSection(detail?.MucLuc),
                        TenBai: detail?.TenBai || "",
                        ThoiGian: detail?.ThoiGian || "-",
                        SoLan: detail?.SoLan ?? "-",
                        SoHiep: detail?.SoHiep ?? "-",
                        Nghi: detail?.Nghi || "-",
                        CuongDo: detail?.CuongDo || "-",
                    }));
                });

                setDays(nextDays);
                setAllExercises(nextExercises);
                setActiveDayId(nextDays[0]?.id || null);
            } catch (fetchError) {
                console.error("Lỗi khi tải bài tập của tôi:", fetchError);
                const detail = fetchError?.response?.data?.detail;
                setError(detail || "Không thể tải bài tập của bạn.");
                setDays([]);
                setActiveDayId(null);
                setAllExercises([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWorkout();
    }, [currentUserId]);

    // Lọc bài tập theo Ngày (Tab) đang được chọn
    const currentExercises = allExercises.filter(ex => ex.Id_BaiTap === activeDayId);

    return (
        <div className="flex flex-col gap-3 w-full p-4">
            <header >
                <h2 className="text-2xl font-bold text-slate-900">Bài tập của tôi</h2>
            </header>

            {!currentUserId || isLoading ? (
                <div className="w-full text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100">
                    Đang tải bài tập...
                </div>
            ) : error ? (
                <div className="w-full text-center py-12 text-red-600 bg-red-50 rounded-2xl border border-red-100">
                    {error}
                </div>
            ) : days.length > 0 ? (
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