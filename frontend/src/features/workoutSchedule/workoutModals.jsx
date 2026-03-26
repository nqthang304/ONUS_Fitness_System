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
      <AlertDialogContent className="max-w-[380px] rounded-2xl font-figtree">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">{title}</AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-row w-full gap-3 mt-4 sm:space-x-0">
          <AlertDialogCancel className="flex-1 mt-0 rounded-xl">Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl">
            Xác nhận
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
