import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Imports
import { DB_HOI_VIEN, DB_LICH_TAP } from "@/features/trainerSchedule/mockData";
import { CalendarGrid } from "@/features/trainerSchedule/calendarGrid";
import { AddScheduleModal } from "@/features/trainerSchedule/addScheduleModal";
import { CancelConfirmModal } from "@/features/trainerSchedule/cancelConfirmModal";

const TrainerSchedulePage = () => {
  const currentTrainerId = 2; // Giả lập ID HLV đăng nhập

  const [schedules, setSchedules] = useState([]);
  const [myMembers, setMyMembers] = useState([]);
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteData, setDeleteData] = useState({ isOpen: false, schedule: null, memberName: "" });

  // Load Data
  useEffect(() => {
    // Chỉ lấy hội viên thuộc HLV này
    const members = DB_HOI_VIEN.filter(m => m.Id_HLV === currentTrainerId);
    setMyMembers(members);

    // Lấy lịch tập của HLV này (thông qua hội viên)
    const memberIds = members.map(m => m.Id_TaiKhoan);
    const trainerSchedules = DB_LICH_TAP.filter(sch => memberIds.includes(sch.Id_HoiVien));
    setSchedules(trainerSchedules);
  }, []);

  // Handlers
  const handleSaveSchedule = (newSchedule) => {
    const record = { ...newSchedule, Id: Date.now() };
    setSchedules([...schedules, record]);
    setIsAddOpen(false);
  };

  const handleDeleteClick = (schedule, memberName) => {
    setDeleteData({ isOpen: true, schedule, memberName });
  };

  const confirmDelete = () => {
    setSchedules(schedules.filter(s => s.Id !== deleteData.schedule.Id));
    setDeleteData({ isOpen: false, schedule: null, memberName: "" });
  };

  return (
    <div className="flex flex-col gap-3 w-full p-4 font-figtree">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-slate-900">Lịch dạy</h2>
          <p className="text-slate-600">Quản lý và sắp xếp thời gian huấn luyện</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6 h-11 shadow-sm" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-5 h-5 mr-2" /> Thêm mới
        </Button>
      </header>

      {/* Main Calendar UI */}
      <CalendarGrid 
        schedules={schedules} 
        members={myMembers} 
        onDeleteClick={handleDeleteClick} 
      />

      {/* Dialogs */}
      <AddScheduleModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onSave={handleSaveSchedule} 
        members={myMembers}
        existingSchedules={schedules}
      />

      <CancelConfirmModal 
        isOpen={deleteData.isOpen} 
        onClose={() => setDeleteData({ ...deleteData, isOpen: false })} 
        onConfirm={confirmDelete}
        scheduleData={deleteData.isOpen ? deleteData : null}
      />
    </div>
  );
};

export default TrainerSchedulePage;