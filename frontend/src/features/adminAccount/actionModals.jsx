import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export const ConfirmActionModal = ({ isOpen, onClose, onConfirm, title, confirmText, isDestructive }) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[400px] rounded-2xl font-figtree p-5 gap-4">
        <AlertDialogHeader className="items-center text-center">
          <AlertDialogTitle className="text-center text-lg font-medium leading-snug">{title}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row w-full items-center gap-3 mt-4 sm:space-x-0">
          <AlertDialogCancel className="flex-1 h-10 mt-0 rounded-xl bg-slate-100 hover:bg-slate-200 border-none text-slate-700 font-medium text-center">
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className={`flex-1 h-10 rounded-xl !text-white font-medium text-center ${isDestructive ? '!bg-red-600 hover:!bg-red-700' : '!bg-blue-600 hover:!bg-blue-700'}`}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};