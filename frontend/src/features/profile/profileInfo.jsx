import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const ProfileInfo = ({ userData, onSave, isEditing, setIsEditing }) => {
  const [formData, setFormData] = useState({
    name: "", phone: "", dob: "", gender: ""
  });

  // Load dữ liệu khi có userData
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        phone: userData.phone || "",
        dob: userData.dob || "",
        gender: userData.gender || "Nam"
      });
    }
  }, [userData]);

  const handleCancel = () => {
    // Reset lại dữ liệu như ban đầu nếu hủy
    setFormData({
      name: userData.name || "",
      phone: userData.phone || "",
      dob: userData.dob || "",
      gender: userData.gender || "Nam"
    });
    setIsEditing(false);
  };

  const handleSubmit = () => {
    // Gọi hàm onSave truyền từ Page xuống
    onSave(formData);
    setIsEditing(false);
  };

  const avatarInitial = (formData.name || "N").trim().charAt(0).toUpperCase() || "N";

  return (
    <Card className="p-6 md:p-8 rounded-2xl border-slate-100 shadow-sm font-figtree mb-6">
      <div className="flex justify-between items-start mb-8">
        <h3 className="font-bold text-lg text-slate-900">Thông tin chung</h3>
        {!isEditing && (
          <Button variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl" onClick={() => setIsEditing(true)}>
            Chỉnh sửa
          </Button>
        )}
      </div>

      {/* Avatar giả lập */}
      <div className="mb-8">
        <Avatar className="size-24 border-4 border-white shadow-sm">
          <AvatarFallback className="bg-slate-100 text-slate-500 text-2xl font-semibold">
            {avatarInitial}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        {/* Họ tên */}
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-2 block">Họ và tên</label>
          <Input 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={!isEditing}
            className="h-11 rounded-xl bg-slate-50 border-slate-200 disabled:opacity-100 disabled:bg-slate-50/50" 
          />
        </div>

        {/* Số điện thoại (Luôn bị khóa) */}
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-2 block">Số điện thoại</label>
          <Input 
            value={formData.phone} 
            disabled 
            className="h-11 rounded-xl bg-slate-100 border-transparent text-slate-500 disabled:opacity-100 cursor-not-allowed mb-1" 
          />
          <p className="text-[11px] text-slate-400">Không thể thay đổi số điện thoại</p>
        </div>

        {/* Ngày sinh */}
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-2 block">Ngày sinh</label>
          <Input 
            type="date"
            value={formData.dob} 
            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            disabled={!isEditing}
            className="h-11 rounded-xl bg-slate-50 border-slate-200 disabled:opacity-100 disabled:bg-slate-50/50" 
          />
        </div>

        {/* Giới tính */}
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-2 block">Giới tính</label>
          <Select value={formData.gender} onValueChange={(val) => setFormData({ ...formData, gender: val })} disabled={!isEditing}>
            <SelectTrigger className="h-11 w-full rounded-xl bg-slate-50 border-slate-200 disabled:opacity-100 disabled:bg-slate-50/50">
              <SelectValue placeholder="Chọn giới tính" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Nam">Nam</SelectItem>
              <SelectItem value="Nữ">Nữ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Buttons (Chỉ hiện khi đang chỉnh sửa) */}
      {isEditing && (
        <div className="mt-8 flex gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8" onClick={handleSubmit}>
            Lưu thay đổi
          </Button>
          <Button variant="ghost" className="rounded-xl px-8 bg-slate-100 hover:bg-slate-200 text-slate-700" onClick={handleCancel}>
            Hủy
          </Button>
        </div>
      )}
    </Card>
  );
};