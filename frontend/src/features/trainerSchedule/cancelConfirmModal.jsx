import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export const CancelConfirmModal = ({ isOpen, onClose, onConfirm, scheduleData }) => {
  if (!scheduleData) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[400px] rounded-2xl font-figtree">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center text-lg text-slate-900 leading-snug">
            Xác nhận xoá giờ tập của <span className="text-blue-600">{scheduleData.memberName}</span><br/>
            vào <span className="text-blue-600">Thứ {scheduleData.schedule.ThuTrongTuan}</span> lúc <span className="text-blue-600">{scheduleData.schedule.GioBatDau} - {scheduleData.schedule.GioKetThuc}</span>?
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row w-full gap-3 mt-4 sm:space-x-0">
          <AlertDialogCancel className="flex-1 mt-0 rounded-xl bg-slate-100 hover:bg-slate-200 border-none text-slate-700">Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="flex-1 rounded-xl bg-red-600 hover:bg-red-700">Xác nhận xóa</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};