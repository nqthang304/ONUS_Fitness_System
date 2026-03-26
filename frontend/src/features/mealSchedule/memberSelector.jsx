import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const MemberSelector = ({ selectedMember, onSelect, onView, members }) => {
  return (
    <div className="p-4 w-full mx-auto font-figtree">
      <header className="flex flex-col gap-1 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Quản lý lịch ăn</h2>
        <p className="text-slate-600">Chọn hội viên để quản lý lịch ăn</p>
      </header>

      <Card className="p-6 flex flex-row justify-between items-center gap-4 rounded-2xl shadow-sm border-slate-100">
        <div className="flex-1 max-w-xs">
          <label className="text-xs font-semibold text-slate-500 mb-2 block">Chọn hội viên</label>
          <Select value={selectedMember} onValueChange={onSelect}>
            <SelectTrigger className="h-11 rounded-xl">
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