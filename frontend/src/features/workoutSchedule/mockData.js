export const MOCK_MEMBERS = [
  { id: "3", name: "Hội viên C" },
  { id: "4", name: "Nguyễn Văn A" },
];

// Bảng BaiTap
export const MOCK_DAYS = [
  { id: 1, id_hoivien: "3", thu_tu_ngay_tap: 1 }, // 1 = DAY A
  { id: 2, id_hoivien: "3", thu_tu_ngay_tap: 2 }, // 2 = DAY B
  { id: 3, id_hoivien: "4", thu_tu_ngay_tap: 1 },
];

// Bảng ChiTietBaiTap
export const MOCK_EXERCISES = [
  { id: 1, id_baitap: 1, muc_luc: "KHOI_DONG", ten_bai: "Dynamic Stretching", thoi_gian: "5 phút", so_lan: "-", so_hiep: "1", nghi: "-", cuong_do: "-" },
  { id: 2, id_baitap: 1, muc_luc: "BAI_TAP_CHINH", ten_bai: "A. DB Bulgarian Split Squat", thoi_gian: "-", so_lan: "10", so_hiep: "3", nghi: "60s", cuong_do: "RPE 7" },
  { id: 3, id_baitap: 1, muc_luc: "BAI_TAP_CHINH", ten_bai: "B1. DB Standing Calf Raise", thoi_gian: "-", so_lan: "12", so_hiep: "3", nghi: "30s", cuong_do: "RPE 7" },
];

export const SECTIONS = [
  { id: "KHOI_DONG", label: "KHỞI ĐỘNG" },
  { id: "BAI_TAP_CHINH", label: "BÀI TẬP CHÍNH" },
  { id: "CARDIO", label: "CARDIO" },
  { id: "GIAN_CO", label: "GIÃN CƠ" },
];