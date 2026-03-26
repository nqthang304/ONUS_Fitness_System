import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const ResultMemberSelector = ({ selectedMember, onSelect, onView, members }) => {
  return (
    <div className="flex flex-col gap-3 w-full p-4 font-figtree">
      <header className="flex flex-col gap-1 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Kết quả tập luyện</h2>
          <p className="text-slate-600">Chọn hội viên để xem chỉ số cơ thể</p>
        </div>
      </header>
      <Card className="p-6 flex flex-row justify-between items-end gap-4 rounded-2xl shadow-sm border-slate-100">
        <div className="w-[200px] min-w-[200px] max-w-[200px] shrink-0">
          <label className="text-xs font-semibold text-slate-500 mb-2 block">Tên hội viên</label>
          <Select value={selectedMember} onValueChange={onSelect}>
            <SelectTrigger className="h-11 w-full rounded-xl bg-slate-50 border-none">
              <SelectValue placeholder="Chọn hội viên..." />
            </SelectTrigger>
            <SelectContent>
              {members.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onView} disabled={!selectedMember} className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700">
          Xem
        </Button>
      </Card>
    </div>
  );
};