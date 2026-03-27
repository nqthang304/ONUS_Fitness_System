import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { parseTimeToMinutes } from "./mockData";

const MIN_ALLOWED_TIME = "06:00";
const MAX_ALLOWED_TIME = "21:00";
const MIN_ALLOWED_MINUTES = parseTimeToMinutes(MIN_ALLOWED_TIME);
const MAX_ALLOWED_MINUTES = parseTimeToMinutes(MAX_ALLOWED_TIME);

export const AddScheduleModal = ({ isOpen, onClose, onSave, members, existingSchedules }) => {
  const [formData, setFormData] = useState({ memberId: "", day: "2", startTime: "", endTime: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData({ memberId: "", day: "2", startTime: "", endTime: "" });
      setError("");
    }
  }, [isOpen]);

  const handleSave = () => {
    setError(""); // Reset lỗi
    const { memberId, day, startTime, endTime } = formData;

    if (!memberId || !startTime || !endTime) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    const newStart = parseTimeToMinutes(startTime);
    const newEnd = parseTimeToMinutes(endTime);

    // Chặn khung giờ ngoài 06:00 - 21:00
    if (newStart < MIN_ALLOWED_MINUTES || newEnd > MAX_ALLOWED_MINUTES) {
      setError("Chỉ được chọn thời gian trong khung 06:00 đến 21:00.");
      return;
    }

    // Kiểm tra giờ bắt đầu phải < giờ kết thúc
    if (newStart >= newEnd) {
      setError("Giờ bắt đầu phải sớm hơn giờ kết thúc.");
      return;
    }

    // THUẬT TOÁN KIỂM TRA TRÙNG LỊCH (Overlap)
    const currentDay = Number(day);
    const hasOverlap = existingSchedules.some(sch => {
      if (sch.ThuTrongTuan !== currentDay) return false; // Khác ngày thì không trùng
      
      const sStart = parseTimeToMinutes(sch.GioBatDau);
      const sEnd = parseTimeToMinutes(sch.GioKetThuc);
      
      // Công thức trùng lắp: BắtĐầuMới < KếtThúcCũ VÀ KếtThúcMới > BắtĐầuCũ
      return (newStart < sEnd && newEnd > sStart);
    });

    if (hasOverlap) {
      setError("Trùng lịch tập! Vui lòng chọn khung giờ khác.");
      return;
    }

    // Nếu mọi thứ ổn, gửi dữ liệu lên
    onSave({
      Id_HoiVien: Number(memberId),
      ThuTrongTuan: currentDay,
      GioBatDau: startTime,
      GioKetThuc: endTime
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl font-figtree border-none bg-slate-50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Thêm lịch tập mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Tên hội viên</label>
            <Select value={formData.memberId} onValueChange={v => setFormData({...formData, memberId: v})}>
              <SelectTrigger className="h-11 bg-white rounded-xl"><SelectValue placeholder="Chọn hội viên..." /></SelectTrigger>
              <SelectContent>
                {members.map(m => (
                  <SelectItem key={m.Id_TaiKhoan} value={String(m.Id_TaiKhoan)}>{m.HoTen}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Thứ</label>
            <Select value={formData.day} onValueChange={v => setFormData({...formData, day: v})}>
              <SelectTrigger className="h-11 bg-white rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2">Thứ 2</SelectItem>
                <SelectItem value="3">Thứ 3</SelectItem>
                <SelectItem value="4">Thứ 4</SelectItem>
                <SelectItem value="5">Thứ 5</SelectItem>
                <SelectItem value="6">Thứ 6</SelectItem>
                <SelectItem value="7">Thứ 7</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Giờ bắt đầu</label>
              <Input
                type="time"
                min={MIN_ALLOWED_TIME}
                max={MAX_ALLOWED_TIME}
                className="h-11 bg-white rounded-xl"
                value={formData.startTime}
                onChange={e => setFormData({...formData, startTime: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Giờ kết thúc</label>
              <Input
                type="time"
                min={MIN_ALLOWED_TIME}
                max={MAX_ALLOWED_TIME}
                className="h-11 bg-white rounded-xl"
                value={formData.endTime}
                onChange={e => setFormData({...formData, endTime: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* NƠI HIỂN THỊ LỖI TRỰC TIẾP GIỮA FORM VÀ NÚT */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm font-semibold p-3 rounded-xl border border-red-100 text-center -mt-2 mb-2 animate-in fade-in zoom-in duration-200">
            {error}
          </div>
        )}

        <DialogFooter className="gap-3 sm:space-x-0 mt-2">
          <Button variant="ghost" className="rounded-xl flex-1 bg-slate-200/50 hover:bg-slate-200 text-slate-700" onClick={onClose}>Hủy</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl flex-1 shadow-sm" onClick={handleSave}>Lưu lịch tập</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};