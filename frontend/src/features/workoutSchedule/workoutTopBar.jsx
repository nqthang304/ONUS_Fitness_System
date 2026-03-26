import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

export const WorkoutTopBar = ({ memberId, members, onMemberChange, lockMemberChange = false, onBack }) => {
  return (
    <>
      <div className="flex items-center gap-3 mb-6 font-figtree">
        <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Lên bài tập cho hội viên</h1>
      </div>

      <Card className="flex flex-row justify-between items-center p-4 rounded-2xl border-slate-100 shadow-sm mb-6 gap-4 font-figtree">
        <div className="w-[200px] min-w-[200px] max-w-[200px] shrink-0">
          <Select value={memberId} onValueChange={onMemberChange} disabled={lockMemberChange}>
            <SelectTrigger className="h-11 w-[200px] min-w-[200px] max-w-[200px] rounded-xl bg-slate-50 border-none font-medium disabled:opacity-100 disabled:cursor-not-allowed">
              <SelectValue className="truncate" />
            </SelectTrigger>
            <SelectContent>
              {members.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 pointer-events-none">
          {lockMemberChange ? "Đang chỉnh sửa" : "Đang xem"}
        </Button>
      </Card>
    </>
  );
};