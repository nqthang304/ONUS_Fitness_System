import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const ProfileInfo = ({ userData, onSave, isEditing, setIsEditing, canEdit = true }) => {
  const [formData, setFormData] = useState({
    name: "", phone: "", dob: "", gender: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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
    if (!canEdit) return;
    // Reset lại dữ liệu như ban đầu nếu hủy
    setFormData({
      name: userData.name || "",
      phone: userData.phone || "",
      dob: userData.dob || "",
      gender: userData.gender || "Nam"
    });
    setError("");
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    if (!canEdit) return;
    if (!formData.name.trim()) {
      setError("Vui lòng nhập họ và tên.");
      return;
    }
    if (!formData.dob) {
      setError("Vui lòng chọn ngày sinh.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);
      await onSave(formData);
      setIsEditing(false);
    } catch (err) {
      const detail = err?.response?.data?.detail || err?.message || "Không thể cập nhật hồ sơ.";
      setError(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  const avatarInitial = (formData.name || "N").trim().charAt(0).toUpperCase() || "N";

  return (
    <Card className="p-6 md:p-8 rounded-2xl border-slate-100 shadow-sm font-figtree mb-6">
      <div className="flex justify-between items-start mb-8">
        <h3 className="font-bold text-lg text-slate-900">Thông tin chung</h3>
        {canEdit && !isEditing && (
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
            disabled={!canEdit || !isEditing || isSubmitting}
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
            disabled={!canEdit || !isEditing || isSubmitting}
            className="h-11 rounded-xl bg-slate-50 border-slate-200 disabled:opacity-100 disabled:bg-slate-50/50" 
          />
        </div>

        {/* Giới tính */}
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-2 block">Giới tính</label>
          <Select value={formData.gender} onValueChange={(val) => setFormData({ ...formData, gender: val })} disabled={!canEdit || !isEditing || isSubmitting}>
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

      {error && (
        <p className="mt-4 text-sm text-red-600 font-medium bg-red-50 rounded-xl p-3">{error}</p>
      )}

      {/* Buttons (Chỉ hiện khi đang chỉnh sửa) */}
      {canEdit && isEditing && (
        <div className="mt-8 flex gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
          <Button variant="ghost" className="rounded-xl px-8 bg-slate-100 hover:bg-slate-200 text-slate-700" onClick={handleCancel} disabled={isSubmitting}>
            Hủy
          </Button>
        </div>
      )}
    </Card>
  );
};