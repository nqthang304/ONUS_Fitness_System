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
                <AlertDialogContent className="max-w-[350px] rounded-2xl font-figtree">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-center">Xác nhận xóa món ăn</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-row w-full gap-3 mt-4 sm:space-x-0">
                        <AlertDialogCancel className="flex-1 mt-0 rounded-xl">
                            Hủy
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl">
                            Xác nhận
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};