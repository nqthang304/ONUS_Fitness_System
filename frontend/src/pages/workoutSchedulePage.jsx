import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WorkoutMemberSelector } from "@/features/workoutSchedule/WorkoutMemberSelector";
import { WorkoutTopBar } from "@/features/workoutSchedule/WorkoutTopBar";
import { DayTabs } from "@/features/workoutSchedule/DayTabs";
import { WorkoutTable } from "@/features/workoutSchedule/WorkoutTable";
import { WorkoutModals } from "@/features/workoutSchedule/workoutModals";

// Dữ liệu giả
import { MOCK_MEMBERS, MOCK_DAYS, MOCK_EXERCISES } from "@/features/workoutSchedule/mockData";

const WorkoutSchedulePage = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();

  // STATE
  const [selectedMember, setSelectedMember] = useState(memberId || "");
  const [days, setDays] = useState([]);
  const [activeDayId, setActiveDayId] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [deleteData, setDeleteData] = useState({ isOpen: false, type: "", dayId: null, exerciseId: null });

  useEffect(() => {
    setSelectedMember(memberId || "");
  }, [memberId]);

  // EFFECTS: Load dữ liệu khi URL có memberId
  useEffect(() => {
    if (memberId) {
      const memberDays = MOCK_DAYS.filter(d => d.id_hoivien === memberId);
      setDays(memberDays);
      if (memberDays.length === 0) {
        setActiveDayId(null);
        setExercises([]);
        return;
      }

      const firstDayId = memberDays[0].id;
      const memberDayIds = new Set(memberDays.map(day => day.id));

      setActiveDayId(firstDayId);
      setExercises(MOCK_EXERCISES.filter(ex => memberDayIds.has(ex.id_baitap)));
    }
  }, [memberId]);

  // LOGIC HANDLERS
  const handleAddDay = () => {
    const newDay = { id: Date.now(), id_hoivien: memberId, thu_tu_ngay_tap: days.length + 1 };
    setDays([...days, newDay]);
    setActiveDayId(newDay.id);
  };

  const handleDeleteDay = (dayId) => {
    setDeleteData({ isOpen: true, type: "day", dayId, exerciseId: null });
  };

  const handleAddExercise = (newEx) => {
    setExercises([...exercises, { ...newEx, id: Date.now(), id_baitap: activeDayId }]);
  };

  const handleDeleteExercise = (exId) => {
    setDeleteData({ isOpen: true, type: "exercise", dayId: null, exerciseId: exId });
  };

  const confirmDeleteDay = (dayId) => {
    const nextDays = days.filter(d => d.id !== dayId);
    const nextExercises = exercises.filter(ex => ex.id_baitap !== dayId);

    setDays(nextDays);
    setExercises(nextExercises);

    if (activeDayId === dayId) {
      setActiveDayId(nextDays[0]?.id || null);
    }

    setDeleteData({ isOpen: false, type: "", dayId: null, exerciseId: null });
  };

  const confirmDeleteExercise = (exerciseId) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
    setDeleteData({ isOpen: false, type: "", dayId: null, exerciseId: null });
  };

  // MÀN HÌNH 1: Chưa chọn người -> Gọi Component Selector
  if (!memberId) {
    return (
      <WorkoutMemberSelector 
        selectedMember={selectedMember} 
        onSelect={setSelectedMember} 
        onView={() => selectedMember && navigate(`/bai-tap/${selectedMember}`)} 
        members={MOCK_MEMBERS} 
      />
    );
  }

  // Chuẩn bị dữ liệu cho Màn hình 2
  const currentExercises = exercises.filter(ex => ex.id_baitap === activeDayId);

  // MÀN HÌNH 2: Quản lý bài tập -> Lắp ráp các Component
  return (
    <div className="flex flex-col gap-3 w-full p-4">
      <WorkoutTopBar 
        memberId={memberId}
        members={MOCK_MEMBERS} 
        onMemberChange={(val) => navigate(`/bai-tap/${val}`)} 
        lockMemberChange={true}
        onBack={() => navigate('/bai-tap')}
      />

      <DayTabs 
        days={days} 
        activeDayId={activeDayId} 
        onDaySelect={setActiveDayId} 
        onAddDay={handleAddDay}
        onDeleteDay={handleDeleteDay}
      />

      {/* Chỉ hiện bảng nếu có ngày tập được chọn */}
      {activeDayId ? (
        <WorkoutTable 
          exercises={currentExercises} 
          onAddExercise={handleAddExercise}
          onDeleteExercise={handleDeleteExercise}
        />
      ) : (
        <div className="bg-white p-8 text-center text-slate-400 border border-slate-100 border-t-0 rounded-b-2xl shadow-sm">
          Chưa có ngày tập nào. Hãy thêm ngày tập mới.
        </div>
      )}

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