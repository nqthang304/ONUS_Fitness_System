import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const AccountModal = ({ isOpen, onClose, onSave, initialData, hlvList }) => {
  const isEditMode = !!initialData;
  
  const [formData, setFormData] = useState({
    name: "", phone: "", role: "Hội viên", dob: "", gender: "Nam", hlvId: ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setFormData({ ...initialData, hlvId: initialData.hlvId ? String(initialData.hlvId) : "" });
      } else {
        setFormData({ name: "", phone: "", role: "Hội viên", dob: "", gender: "Nam", hlvId: "" });
      }
      setError("");
      setIsSubmitting(false);
    }
  }, [isOpen, initialData, isEditMode]);

  // Handle Role Change
  const handleRoleChange = (val) => {
    setFormData(prev => ({
      ...prev,
      role: val,
      hlvId: val !== "Hội viên" ? "" : prev.hlvId // Xóa ID HLV nếu đổi thành vai trò khác
    }));
    setError("");
  };

  const phoneRegex = /^0\d{9,10}$/;
  const isNameValid = Boolean(formData.name.trim());
  const isPhoneValid = phoneRegex.test(formData.phone.trim());
  const isDobValid = Boolean(formData.dob);
  const isHlvValid = formData.role !== "Hội viên" || Boolean(formData.hlvId);
  const canSubmit = isNameValid && isPhoneValid && isDobValid && isHlvValid;

  const validateForm = () => {
    if (!isNameValid) return "Vui lòng nhập họ và tên.";
    if (!isPhoneValid) return "Số điện thoại không hợp lệ (bắt đầu bằng 0, 10-11 số).";
    if (!isDobValid) return "Vui lòng chọn ngày sinh.";
    if (!isHlvValid) return "Vui lòng chọn HLV phụ trách cho hội viên.";
    return "";
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);
      await onSave(formData);
    } catch (err) {
      setError(err?.message || "Không thể lưu tài khoản. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl font-figtree p-6 bg-slate-50 border-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            {isEditMode ? "Thông tin tài khoản" : "Thêm tài khoản mới"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 mt-2">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Họ và tên</label>
            <Input className="h-11 bg-white rounded-xl" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={isSubmitting} />
          </div>
          
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Số điện thoại</label>
            <Input className="h-11 bg-white rounded-xl" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} disabled={isSubmitting} />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Vai trò</label>
            <Select value={formData.role} onValueChange={handleRoleChange} disabled={isSubmitting}>
              <SelectTrigger className="h-11 w-full bg-white rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hội viên">Hội viên</SelectItem>
                <SelectItem value="HLV">Huấn luyện viên (HLV)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Ngày sinh</label>
              <Input type="date" className="h-11 bg-white rounded-xl" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} disabled={isSubmitting} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Giới tính</label>
              <Select value={formData.gender} onValueChange={val => setFormData({...formData, gender: val})} disabled={isSubmitting}>
                <SelectTrigger className="h-11 w-full bg-white rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nam">Nam</SelectItem>
                  <SelectItem value="Nữ">Nữ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* CHỈ HIỆN Ô CHỌN HLV KHI VAI TRÒ LÀ HỘI VIÊN */}
          {formData.role === "Hội viên" && (
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">HLV phụ trách</label>
              <Select value={formData.hlvId} onValueChange={val => setFormData({...formData, hlvId: val})} disabled={isSubmitting}>
                <SelectTrigger className="h-11 w-full bg-white rounded-xl">
                  <SelectValue placeholder="Chọn HLV..." />
                </SelectTrigger>
                <SelectContent>
                  {hlvList.map(hlv => (
                    <SelectItem key={hlv.id} value={String(hlv.id)}>{hlv.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 font-medium bg-red-50 rounded-xl p-3">{error}</p>
        )}

        <DialogFooter className="mt-4 gap-3 sm:space-x-0">
          <Button variant="ghost" className="rounded-xl flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 rounded-xl flex-1 shadow-sm" disabled={isSubmitting || !canSubmit}>
            {isSubmitting ? "Đang lưu..." : isEditMode ? "Lưu" : "Thêm mới"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};