import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { WorkoutMemberSelector } from "@/features/workoutSchedule/WorkoutMemberSelector";
import { WorkoutTopBar } from "@/features/workoutSchedule/WorkoutTopBar";
import { DayTabs } from "@/features/workoutSchedule/DayTabs";
import { WorkoutTable } from "@/features/workoutSchedule/WorkoutTable";
import { WorkoutModals } from "@/features/workoutSchedule/workoutModals";
import workoutApi from "@/api/workoutApi";
import profileApi from "@/api/profileApi";

// Dữ liệu giả

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

const BACKEND_SECTION_MAP = {
  KHOI_DONG: "KhoiDong",
  BAI_TAP_CHINH: "BaiTapChinh",
  CARDIO: "Cardio",
  GIAN_CO: "GianCo",
};

const toBackendSection = (value) => BACKEND_SECTION_MAP[value] || "BaiTapChinh";

const normalizeMember = (member) => ({
  id: String(member?.account_info?.id || member?.Id_TaiKhoan || ""),
  hoi_vien_id: String(member?.id || ""),
  name: member?.HoTen || member?.ho_ten || member?.account_info?.username || member?.username || "",
});

const normalizeWorkoutDay = (item, fallbackMemberId, fallbackIndex) => ({
  id: String(item?.Id_BaiTap || item?.id || ""),
  id_hoivien: String(item?.id_hoivien || item?.Id_HoiVien || fallbackMemberId),
  thu_tu_ngay_tap: String(item?.ThuTuNgayTap || item?.thu_tu_ngay_tap || fallbackIndex + 1),
});

const normalizeWorkoutExercise = (item, fallbackDayId, fallbackIndex) => ({
  id: String(item?.id || fallbackIndex),
  id_baitap: String(item?.Id_BaiTap || item?.id_baitap || fallbackDayId || ""),
  muc_luc: normalizeSection(item?.MucLuc || item?.muc_luc),
  ten_bai: item?.TenBai || item?.ten_bai || "",
  thoi_gian: item?.ThoiGian || item?.thoi_gian || "-",
  so_lan: item?.SoLan ?? item?.so_lan ?? "-",
  so_hiep: item?.SoHiep ?? item?.so_hiep ?? "-",
  nghi: item?.Nghi || item?.nghi || "-",
  cuong_do: item?.CuongDo || item?.cuong_do || "-",
});

const WorkoutSchedulePage = () => {
  const location = useLocation();
  const stateMemberId = String(location.state?.memberId || "");

  // STATE
  const [selectedMember, setSelectedMember] = useState(stateMemberId);
  const [activeMemberId, setActiveMemberId] = useState(stateMemberId);
  const [days, setDays] = useState([]);
  const [activeDayId, setActiveDayId] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteData, setDeleteData] = useState({ isOpen: false, type: "", dayId: null, exerciseId: null });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await profileApi.getHoiVienList();
        const rawMembers = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.results)
            ? response.data.results
            : [];

        setMembers(rawMembers.map(normalizeMember).filter(member => member.id));
      } catch (memberError) {
        console.error("Lỗi khi lấy danh sách hội viên:", memberError);
        setMembers([]);
      }
    };

    fetchMembers();
  }, []);

  useEffect(() => {
    if (!stateMemberId) return;
    setSelectedMember(stateMemberId);
    setActiveMemberId(stateMemberId);
  }, [stateMemberId]);

  const loadWorkout = async (memberId) => {
    if (!memberId) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await workoutApi.getWorkoutByUserId(memberId);
      const results = Array.isArray(response?.data?.results) ? response.data.results : [];

      const nextDays = results.map((item, index) => normalizeWorkoutDay(item, memberId, index));
      const nextExercises = results.flatMap((item) => {
        const chiTietList = Array.isArray(item?.chitietbaitap) ? item.chitietbaitap : [];
        return chiTietList.map((detail, detailIndex) =>
          normalizeWorkoutExercise(detail, item?.Id_BaiTap, detailIndex)
        );
      });

      setDays(nextDays);
      setExercises(nextExercises);
      setActiveDayId(nextDays[0]?.id || null);
    } catch (apiError) {
      console.error("Lỗi khi lấy dữ liệu bài tập:", apiError);
      const detail = apiError?.response?.data?.detail;
      setError(detail || "Không thể tải dữ liệu bài tập.");
      setDays([]);
      setExercises([]);
      setActiveDayId(null);
    } finally {
      setIsLoading(false);
    }
  };

  // EFFECTS: Load dữ liệu khi HLV chọn hội viên
  useEffect(() => {
    if (!activeMemberId) {
      setDays([]);
      setExercises([]);
      setActiveDayId(null);
      setError("");
      setIsLoading(false);
      return;
    }

    loadWorkout(activeMemberId);
  }, [activeMemberId]);

  // LOGIC HANDLERS
  const handleAddDay = async () => {
    if (!activeMemberId) return;

    const activeMemberRecord = members.find((member) => String(member.id) === String(activeMemberId));
    const hoiVienId = activeMemberRecord?.hoi_vien_id;

    if (!hoiVienId) {
      setError("Không xác định được hội viên để tạo ngày tập.");
      return;
    }

    setIsActionLoading(true);
    setError("");

    try {
      const response = await workoutApi.createWorkoutDay({
        hoi_vien_id: Number(hoiVienId),
        thu_tu_ngay_tap: String(days.length + 1),
      });

      const createdDay = response?.data?.data || response?.data || {};
      const newDay = {
        id: String(createdDay.Id_BaiTap || createdDay.id || ""),
        id_hoivien: String(createdDay.id_hoivien || hoiVienId),
        thu_tu_ngay_tap: String(createdDay.ThuTuNgayTap || createdDay.thu_tu_ngay_tap || days.length + 1),
      };

      setDays((prev) => [...prev, newDay]);
      setActiveDayId(newDay.id);
    } catch (apiError) {
      console.error("Lỗi khi tạo ngày tập:", apiError);
      setError(apiError?.response?.data?.detail || "Không thể tạo ngày tập.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteDay = (dayId) => {
    setDeleteData({ isOpen: true, type: "day", dayId, exerciseId: null });
  };

  const handleAddExercise = async (newEx) => {
    if (!activeDayId) return;

    setIsActionLoading(true);
    setError("");

    try {
      const response = await workoutApi.createWorkoutExercise({
        id_baitap: activeDayId,
        muc_luc: toBackendSection(newEx.muc_luc),
        ten_bai: newEx.ten_bai,
        thoi_gian: newEx.thoi_gian || "",
        so_lan: newEx.so_lan ? Number(newEx.so_lan) : null,
        so_hiep: newEx.so_hiep ? Number(newEx.so_hiep) : null,
        nghi: newEx.nghi || "",
        cuong_do: newEx.cuong_do || "",
      });

      const createdExercise = response?.data?.data || response?.data || {};
      const normalizedExercise = normalizeWorkoutExercise(createdExercise, activeDayId, Date.now());

      setExercises((prev) => [...prev, normalizedExercise]);
    } catch (apiError) {
      console.error("Lỗi khi tạo bài tập:", apiError);
      setError(apiError?.response?.data?.detail || "Không thể tạo bài tập.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteExercise = (exId) => {
    setDeleteData({ isOpen: true, type: "exercise", dayId: null, exerciseId: exId });
  };

  const confirmDeleteDay = async (dayId) => {
    setIsActionLoading(true);
    setError("");

    try {
      await workoutApi.deleteWorkoutDay(dayId);
      const nextDays = days.filter((d) => String(d.id) !== String(dayId));
      const nextExercises = exercises.filter((ex) => String(ex.id_baitap) !== String(dayId));

      setDays(nextDays);
      setExercises(nextExercises);

      if (activeDayId === dayId) {
        setActiveDayId(nextDays[0]?.id || null);
      }
    } catch (apiError) {
      console.error("Lỗi khi xóa ngày tập:", apiError);
      setError(apiError?.response?.data?.detail || "Không thể xóa ngày tập.");
    } finally {
      setIsActionLoading(false);
      setDeleteData({ isOpen: false, type: "", dayId: null, exerciseId: null });
    }
  };

  const confirmDeleteExercise = async (exerciseId) => {
    setIsActionLoading(true);
    setError("");

    try {
      await workoutApi.deleteWorkoutExercise(exerciseId);
      setExercises(exercises.filter((ex) => String(ex.id) !== String(exerciseId)));
    } catch (apiError) {
      console.error("Lỗi khi xóa bài tập:", apiError);
      setError(apiError?.response?.data?.detail || "Không thể xóa bài tập.");
    } finally {
      setIsActionLoading(false);
      setDeleteData({ isOpen: false, type: "", dayId: null, exerciseId: null });
    }
  };

  // MÀN HÌNH 1: Chưa chọn người -> Gọi Component Selector
  if (!activeMemberId) {
    return (
      <WorkoutMemberSelector 
        selectedMember={selectedMember} 
        onSelect={setSelectedMember}
        onView={() => selectedMember && setActiveMemberId(selectedMember)} 
        members={members} 
      />
    );
  }

  // Chuẩn bị dữ liệu cho Màn hình 2
  const currentExercises = exercises.filter(ex => String(ex.id_baitap) === String(activeDayId));

  // MÀN HÌNH 2: Quản lý bài tập -> Lắp ráp các Component
  return (
    <div className="flex flex-col gap-3 w-full p-4">
      <WorkoutTopBar 
        memberId={activeMemberId}
        members={members} 
        onMemberChange={(val) => setSelectedMember(val)} 
        lockMemberChange={true}
        onBack={() => setActiveMemberId("")}
      />

      <DayTabs 
        days={days} 
        activeDayId={activeDayId} 
        onDaySelect={setActiveDayId} 
        onAddDay={handleAddDay}
        onDeleteDay={handleDeleteDay}
      />

      {isLoading && (
        <div className="bg-white p-6 text-center text-slate-500 border border-slate-100 border-t-0 rounded-b-2xl shadow-sm">
          Đang tải dữ liệu bài tập...
        </div>
      )}

      {isActionLoading && !isLoading && (
        <div className="bg-white p-6 text-center text-slate-500 border border-slate-100 border-t-0 rounded-b-2xl shadow-sm">
          Đang xử lý thay đổi...
        </div>
      )}

      {!isLoading && error && (
        <div className="bg-red-50 p-6 text-center text-red-600 border border-red-100 border-t-0 rounded-b-2xl shadow-sm">
          {error}
        </div>
      )}

      {/* Chỉ hiện bảng nếu có ngày tập được chọn */}
      {!isLoading && !error && activeDayId ? (
        <WorkoutTable 
          exercises={currentExercises} 
          onAddExercise={handleAddExercise}
          onDeleteExercise={handleDeleteExercise}
        />
      ) : !isLoading && !error ? (
        <div className="bg-white p-8 text-center text-slate-400 border border-slate-100 border-t-0 rounded-b-2xl shadow-sm">
          Chưa có ngày tập nào. Hãy thêm ngày tập mới.
        </div>
      ) : null}

      <WorkoutModals
        deleteData={deleteData}
        setDeleteData={setDeleteData}
        onConfirmDeleteDay={confirmDeleteDay}
        onConfirmDeleteExercise={confirmDeleteExercise}
      />
    </div>
  );
};

export default WorkoutSchedulePage;