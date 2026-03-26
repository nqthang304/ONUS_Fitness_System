import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export const MealModals = ({
    isAddOpen, setIsAddOpen, newDish, setNewDish, handleAddDish,
    deleteData, setDeleteData, confirmDelete
}) => {
    return (
        <>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-[450px] rounded-2xl font-figtree">
                    <DialogHeader><DialogTitle>Thêm món mới</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="col-span-2">
                            <label className="text-xs font-semibold text-slate-600">Tên thực phẩm</label>
                            <Input className="mt-1 bg-slate-50 h-11" value={newDish.name} onChange={e => setNewDish({ ...newDish, name: e.target.value })} />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-semibold text-slate-600">Lượng</label>
                            <Input className="mt-1 bg-slate-50 h-11" value={newDish.amount} onChange={e => setNewDish({ ...newDish, amount: e.target.value })} />
                        </div>
                        {['calo', 'p', 'c', 'f'].map(field => (
                            <div key={field}>
                                <label className="text-xs font-semibold text-slate-600 uppercase">{field}</label>
                                <Input type="number" className="mt-1 bg-slate-50 h-11" value={newDish[field]} onChange={e => setNewDish({ ...newDish, [field]: e.target.value })} />
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Hủy</Button>
                        <Button onClick={handleAddDish} className="bg-blue-600 hover:bg-blue-700">Lưu kết quả</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteData.isOpen} onOpenChange={(open) => !open && setDeleteData({ isOpen: false, mealType: "", dishId: null })}>
                <AlertDialogContent className="max-w-[400px] rounded-2xl font-figtree p-5 gap-4">
                    <AlertDialogHeader className="items-center text-center">
                        <AlertDialogTitle className="text-center text-lg font-medium leading-snug">Xác nhận xóa món ăn</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-row w-full items-center gap-3 mt-4 sm:space-x-0">
                        <AlertDialogCancel className="flex-1 h-10 mt-0 rounded-xl bg-slate-100 hover:bg-slate-200 border-none text-slate-700 font-medium text-center">
                            Hủy
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="flex-1 h-10 bg-red-600 hover:bg-red-700 rounded-xl font-medium text-center">
                            Xác nhận
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};