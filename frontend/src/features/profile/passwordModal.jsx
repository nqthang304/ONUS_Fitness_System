import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const PasswordModal = ({ isOpen, onOpenChange, onSubmit }) => {
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      handleClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [success]);

  const handleClose = () => {
    // Chỉ cho phép đóng khi không đang trong quá trình call API
    if (isLoading) return;
    setPasswords({ current: "", new: "", confirm: "" });
    setError("");
    setSuccess("");
    setIsLoading(false);
    onOpenChange(false);
  };

  // --- SỬA LỖI 1: Bổ sung tên hàm handleSave ---
  const handleSave = async () => {
    setError("");
    setSuccess("");

    // 1. Kiểm tra rỗng
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setError("Vui lòng điền đầy đủ các trường.");
      return;
    }
    // 2. Kiểm tra độ dài
    if (passwords.new.length < 8) {
      setError("Mật khẩu mới phải có tối thiểu 8 ký tự.");
      return;
    }
    // 3. Kiểm tra có chữ hoa
    if (!/[A-Z]/.test(passwords.new)) {
      setError("Mật khẩu phải chứa ít nhất 1 ký tự hoa.");
      return;
    }
    // 4. Kiểm tra có chữ thường
    if (!/[a-z]/.test(passwords.new)) {
      setError("Mật khẩu phải chứa ít nhất 1 ký tự thường.");
      return;
    }
    // 5. Kiểm tra có số
    if (!/[0-9]/.test(passwords.new)) {
      setError("Mật khẩu phải chứa ít nhất 1 chữ số.");
      return;
    }
    // 6. Kiểm tra khớp mật khẩu
    if (passwords.new !== passwords.confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setIsLoading(true);
      console.log("[PasswordModal] Calling onSubmit with:", { current: passwords.current, new: passwords.new, confirm: passwords.confirm });
      // Call API qua component cha (ProfilePage)
      const result = await onSubmit(passwords.current, passwords.new, passwords.confirm);
      console.log("[PasswordModal] onSubmit result:", result);
      setSuccess("Đổi mật khẩu thành công! Tự động đóng sau vài giây...");
    } catch (err) {
      console.error("Lỗi đổi mật khẩu:", err);
      console.error("[PasswordModal] Error response:", {
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        data: err?.response?.data
      });
      
      // Xử lý lỗi từ backend
      let errorMsg = "Đổi mật khẩu thất bại. Vui lòng thử lại.";
      const errorData = err?.response?.data;
      
      if (err?.response?.status === 400) {
        // Lỗi validation từ backend
        if (errorData?.old_password?.[0]) {
          errorMsg = errorData.old_password[0]; // "Mật khẩu cũ không chính xác."
        } else if (errorData?.new_password?.[0]) {
          errorMsg = errorData.new_password[0]; // Lỗi validation mật khẩu
        } else if (errorData?.confirm_password?.[0]) {
          errorMsg = errorData.confirm_password[0];
        } else if (errorData?.detail) {
          errorMsg = errorData.detail;
        }
      } else if (err?.response?.status === 401) {
        errorMsg = "Phiên làm việc hết hạn. Vui lòng đăng nhập lại.";
      }
      
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
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
              // --- SỬA LỖI 2: Xóa đoạn 'isLoading ||' viết sai cú pháp ---
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              disabled={isLoading || !!success}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Mật khẩu mới</label>
            <Input 
              type="password" 
              className="h-11 rounded-xl bg-slate-50 mb-1" 
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              disabled={isLoading || !!success}
            />
            <p className="text-[11px] text-slate-400">Tối thiểu 8 ký tự: có chữ hoa, thường, số</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Xác nhận mật khẩu mới</label>
            <Input 
              type="password" 
              className="h-11 rounded-xl bg-slate-50" 
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              disabled={isLoading || !!success}
            />
          </div>

          {error && <p className="text-sm text-red-500 font-medium text-center p-3 bg-red-50 rounded-xl">{error}</p>}
          {success && <p className="text-sm text-emerald-600 font-medium text-center p-3 bg-emerald-50 rounded-xl">{success}</p>}
        </div>

        <DialogFooter className="gap-2 sm:space-x-0 mt-0">
          <Button 
            variant="ghost" 
            className="rounded-xl flex-1 bg-slate-100 hover:bg-slate-200" 
            onClick={handleClose} 
            disabled={isLoading || !!success}
          >
            Hủy
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 rounded-xl flex-1" 
            onClick={handleSave} 
            disabled={isLoading || !!success}
          >
            {isLoading ? "Đang lưu..." : success ? "Đã lưu" : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};