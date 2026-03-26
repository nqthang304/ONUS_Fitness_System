import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const PasswordModal = ({ isOpen, onOpenChange, onSubmit }) => {
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      handleClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [success]);

  const handleClose = () => {
    setPasswords({ current: "", new: "", confirm: "" });
    setError("");
    setSuccess("");
    onOpenChange(false);
  };

  const handleSave = () => {
    setError("");
    setSuccess("");
    // 1. Kiểm tra rỗng
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setError("Vui lòng điền đầy đủ các trường.");
      return;
    }
    // 2. Kiểm tra độ dài & ký tự đặc biệt (Có thể dùng Regex nâng cao hơn nếu cần)
    if (passwords.new.length < 8) {
      setError("Mật khẩu mới phải có tối thiểu 8 ký tự.");
      return;
    }
    // 3. Kiểm tra khớp mật khẩu
    if (passwords.new !== passwords.confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    // Nếu qua hết các bước kiểm tra, gửi dữ liệu lên component cha
    onSubmit(passwords.current, passwords.new);
    setSuccess("Đổi mật khẩu thành công! Tự động đóng sau vài giây...");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl font-figtree p-5 gap-2">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold">Đổi mật khẩu</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Mật khẩu hiện tại</label>
            <Input 
              type="password" 
              className="h-11 rounded-xl bg-slate-50" 
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              disabled={!!success}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Mật khẩu mới</label>
            <Input 
              type="password" 
              className="h-11 rounded-xl bg-slate-50 mb-1" 
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              disabled={!!success}
            />
            <p className="text-[11px] text-slate-400">Tối thiểu 8 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Xác nhận mật khẩu mới</label>
            <Input 
              type="password" 
              className="h-11 rounded-xl bg-slate-50" 
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              disabled={!!success}
            />
          </div>

          {error && <p className="text-sm text-red-500 font-medium text-center p-3 bg-red-50 rounded-xl">{error}</p>}
          {success && <p className="text-sm text-emerald-600 font-medium text-center p-3 bg-emerald-50 rounded-xl">{success}</p>}
        </div>

        <DialogFooter className="gap-2 sm:space-x-0 mt-0">
          <Button variant="ghost" className="rounded-xl flex-1 bg-slate-100 hover:bg-slate-200" onClick={handleClose} disabled={!!success}>
            Hủy
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl flex-1" onClick={handleSave} disabled={!!success}>
            {success ? "Đã lưu" : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};