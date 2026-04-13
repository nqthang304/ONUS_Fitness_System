import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Imports
import { CalendarGrid } from "@/features/trainerSchedule/calendarGrid";
import { AddScheduleModal } from "@/features/trainerSchedule/addScheduleModal";
import { CancelConfirmModal } from "@/features/trainerSchedule/cancelConfirmModal";
import scheduleApi from "@/api/scheduleApi";
import profileApi from "@/api/profileApi";

const TrainerSchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [myMembers, setMyMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [createError, setCreateError] = useState(null);
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteData, setDeleteData] = useState({ isOpen: false, schedule: null, memberName: "" });

  const normalizeMember = (member) => ({
    Id_TaiKhoan: member?.id,
    HoTen: member?.HoTen ?? "Hội viên",
    Id_HLV: member?.hlv_id ?? null,
  });

  const fetchSchedules = async () => {
      try {
        setIsLoading(true);
        const response = await scheduleApi.getLichTap();
        const schedulesData = response?.data?.results || [];
        console.log('Lịch tập nhận được từ API:', schedulesData);
        console.log(response);
        setSchedules(schedulesData);
      } catch (err) {
        console.error('Lỗi khi lấy lịch tập:', err);
        setError(err?.response?.data?.detail || 'Không thể tải lịch tập');
        setSchedules([]);
      } finally {
        setIsLoading(false);
      }
    };


    const fetchMyMembers = async () => {
      try {
        const response = await profileApi.getHoiVienList();
        const membersData = Array.isArray(response?.data) ? response.data : [];
        setMyMembers(membersData.map(normalizeMember));
      } catch (err) {
        console.error('Lỗi khi lấy danh sách hội viên:', err);
        setMyMembers([]);
      }
    };

  // Load Data
  useEffect(() => {
    fetchMyMembers();

    fetchSchedules();
  }, []);

  // Handlers
  const handleSaveSchedule = async (newSchedule) => {
    try {
      setIsCreating(true);
      setCreateError(null);

      // Chuyển đổi tên field từ FE sang BE
      const payload = {
        hoi_vien_id: newSchedule.Id_HoiVien,
        thu_trong_tuan: newSchedule.ThuTrongTuan,
        gio_bat_dau: newSchedule.GioBatDau,
        gio_ket_thuc: newSchedule.GioKetThuc,
      };

      const response = await scheduleApi.createLichTap(payload);

      const createdSchedule = response?.data?.data || response?.data;

      if (createdSchedule) {
        // Thêm lịch mới vào danh sách
        setSchedules(prevSchedules => [...prevSchedules, createdSchedule]);
        setIsAddOpen(false);
      }
    } catch (err) {
      console.error('Lỗi khi tạo lịch tập:', err);
      const errorMsg = err?.response?.data?.detail || 'Không thể tạo lịch tập';
      setCreateError(errorMsg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteClick = (schedule, memberName) => {
    setDeleteData({ isOpen: true, schedule, memberName });
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);

      const scheduleId = deleteData?.schedule?.Id ?? deleteData?.schedule?.id;
      if (!scheduleId) {
        return;
      }

      await scheduleApi.deleteLichTap(scheduleId);
      setSchedules(prevSchedules => prevSchedules.filter(s => String(s.Id ?? s.id) !== String(scheduleId)));
      setDeleteData({ isOpen: false, schedule: null, memberName: "" });
    } catch (err) {
      console.error('Lỗi khi xóa lịch tập:', err);
      setError(err?.response?.data?.detail || 'Không thể xóa lịch tập');
    } finally {
      setIsDeleting(false);
    }
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
      {isLoading ? (
        <div className="bg-white p-8 text-center text-slate-400 border border-slate-100 rounded-2xl shadow-sm">
          Đang tải lịch dạy...
        </div>
      ) : error ? (
        <div className="bg-red-50 p-8 text-center text-red-600 border border-red-100 rounded-2xl shadow-sm">
          {error}
        </div>
      ) : (
        <CalendarGrid 
          schedules={schedules} 
          onDeleteClick={handleDeleteClick} 
        />
      )}

      {/* Dialogs */}
      {createError && (
        <div className="bg-red-50 p-4 text-sm text-red-600 border border-red-100 rounded-xl shadow-sm mb-3">
          {createError}
        </div>
      )}
      <AddScheduleModal 
        isOpen={isAddOpen} 
        onClose={() => {
          setIsAddOpen(false);
          setCreateError(null);
        }}
        onSave={handleSaveSchedule} 
        members={myMembers}
        existingSchedules={schedules}
        isLoading={isCreating}
      />

      <CancelConfirmModal 
        isOpen={deleteData.isOpen} 
        onClose={() => setDeleteData({ ...deleteData, isOpen: false })} 
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        scheduleData={deleteData.isOpen ? deleteData : null}
      />
    </div>
  );
};

export default TrainerSchedulePage;