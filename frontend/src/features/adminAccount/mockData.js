
export const DB_TAI_KHOAN = [
  { Id: 2, SDT: "0988888888", VaiTro: "HLV", TinhTrang: "Hoạt động" },
  { Id: 3, SDT: "0901234567", VaiTro: "Hội viên", TinhTrang: "Hoạt động" },
  { Id: 4, SDT: "0912345678", VaiTro: "Hội viên", TinhTrang: "Bị khóa" },
];

export const DB_HOI_VIEN = [
  { Id_TaiKhoan: 3, HoTen: "Hội viên C", NgaySinh: "2001-02-15", GioiTinh: "Nữ", Id_HLV: 2 },
  { Id_TaiKhoan: 4, HoTen: "Nguyễn Văn A", NgaySinh: "1998-10-20", GioiTinh: "Nam", Id_HLV: 2 },
];

export const DB_HLV = [
  { Id_TaiKhoan: 2, HoTen: "HLV B", NgaySinh: "1995-05-15", GioiTinh: "Nam" },
];

// Hàm gom dữ liệu từ 3 bảng để hiển thị lên UI
export const getMergedAccounts = (taikhoans, hoiviens, hlvs) => {
  return taikhoans.map(tk => {
    let detail = null;
    if (tk.VaiTro === "Hội viên") {
      detail = hoiviens.find(hv => hv.Id_TaiKhoan === tk.Id);
    } else {
      detail = hlvs.find(h => h.Id_TaiKhoan === tk.Id);
    }

    return {
      id: tk.Id,
      phone: tk.SDT,
      role: tk.VaiTro,
      status: tk.TinhTrang,
      name: detail?.HoTen || "Chưa cập nhật",
      dob: detail?.NgaySinh || "",
      gender: detail?.GioiTinh || "",
      hlvId: detail?.Id_HLV || null
    };
  });
};