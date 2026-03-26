import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const WorkoutModals = ({ deleteData, setDeleteData, onConfirmDeleteDay, onConfirmDeleteExercise }) => {
  const closeDeleteModal = () => {
    setDeleteData({ isOpen: false, type: "", dayId: null, exerciseId: null });
  };

  const handleConfirmDelete = () => {
    if (deleteData.type === "day" && deleteData.dayId !== null) {
      onConfirmDeleteDay(deleteData.dayId);
      return;
    }

    if (deleteData.type === "exercise" && deleteData.exerciseId !== null) {
      onConfirmDeleteExercise(deleteData.exerciseId);
      return;
    }

    closeDeleteModal();
  };

  const title =
    deleteData.type === "day"
      ? "Xác nhận xóa toàn bộ bài tập của ngày này"
      : "Xác nhận xóa bài tập này";

  return (
    <AlertDialog open={deleteData.isOpen} onOpenChange={(open) => !open && closeDeleteModal()}>
      <AlertDialogContent className="max-w-[400px] rounded-2xl font-figtree p-5 gap-4">
        <AlertDialogHeader className="items-center text-center">
          <AlertDialogTitle className="text-center text-lg font-medium leading-snug">{title}</AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-row w-full items-center gap-3 mt-4 sm:space-x-0">
          <AlertDialogCancel className="flex-1 h-10 mt-0 rounded-xl bg-slate-100 hover:bg-slate-200 border-none text-slate-700 font-medium text-center">Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmDelete} className="flex-1 h-10 bg-red-600 hover:bg-red-700 rounded-xl font-medium text-center">
            Xác nhận
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
