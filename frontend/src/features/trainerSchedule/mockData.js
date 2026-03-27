export const DB_HOI_VIEN = [
  { Id_TaiKhoan: 3, HoTen: "Hội viên C", Id_HLV: 2 },
  { Id_TaiKhoan: 4, HoTen: "Nguyễn Văn A", Id_HLV: 2 },
];

export const DB_LICH_TAP = [
  { Id: 1, Id_HoiVien: 3, ThuTrongTuan: 2, GioBatDau: "08:00", GioKetThuc: "09:30" },
  { Id: 2, Id_HoiVien: 4, ThuTrongTuan: 4, GioBatDau: "16:00", GioKetThuc: "17:15" },
  { Id: 3, Id_HoiVien: 3, ThuTrongTuan: 6, GioBatDau: "18:30", GioKetThuc: "20:00" },
];

// Hàm chuyển đổi "08:30" thành số phút (VD: 510) để tính toán vị trí trên Calendar
export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};