import { Card } from "@/components/ui/card";
// 1. Nhớ import thêm SelectContent và SelectItem
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"; 

export const MacroOverview = ({ memberId, isEditing, totals, members }) => {
  // Lấy ID hiện tại (phòng trường hợp Hội viên vào xem không có ID trên URL thì lấy mặc định)
  const activeMemberId = memberId || "101"; 
  const currentMemberName = members.find(m => m.id === activeMemberId)?.name || "Nguyễn Văn An";

  return (
    <Card className="flex flex-row w-full p-6 rounded-2xl border-slate-100 shadow-sm mb-6 flex flex-wrap gap-6 items-end font-figtree">
      <div className="flex-1 min-w-[200px]">
        <label className="text-xs font-semibold text-slate-500 mb-2 block">Hội viên</label>
        
        {isEditing ? (
           // 2. Thêm thuộc tính disabled chuẩn của React
           <Select value={activeMemberId} disabled>
             {/* disabled:opacity-100 giúp chữ không bị mờ đi khi bị khóa */}
             <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-none disabled:opacity-100 disabled:cursor-not-allowed text-slate-900 font-medium">
                <SelectValue placeholder={currentMemberName} />
             </SelectTrigger>
             
             {/* 3. Phải có SelectContent thì SelectValue mới biết đường lấy tên hiển thị */}
             <SelectContent>
               {members.map(m => (
                 <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
               ))}
             </SelectContent>
           </Select>
        ) : (
          <div className="h-11 px-4 flex items-center bg-slate-50 rounded-xl text-slate-700 font-medium">
            {currentMemberName}
          </div>
        )}
      </div>
      
      {/* Box Macros (Giữ nguyên) */}
      {[
        { label: "Tổng calo", val: totals.calo },
        { label: "Tổng đạm (g)", val: totals.p },
        { label: "Tổng tinh bột (g)", val: totals.c },
        { label: "Tổng chất béo (g)", val: totals.f },
      ].map((item, idx) => (
        <div key={idx} className="w-32">
          <label className="text-xs font-semibold text-slate-500 mb-2 block">{item.label}</label>
          <div className="h-11 flex items-center justify-center bg-slate-50 rounded-xl font-bold text-slate-800 text-lg">
            {item.val}
          </div>
        </div>
      ))}
    </Card>
  );
};