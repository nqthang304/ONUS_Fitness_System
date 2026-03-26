import { Button } from "@/components/ui/button";
import { Activity, Calendar, Utensils, BookOpen, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils"; 
import { cloneElement } from "react";

const MemberTable = ({ data, onAction }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden font-figtree">
      {/* Header của bảng */}
      <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/50 text-sm font-bold text-slate-500 border-b border-slate-100">
        <div className="col-span-2 uppercase tracking-wider">Họ và tên</div>
        <div className="col-span-2 uppercase tracking-wider">Số điện thoại</div>
        <div className="col-span-8 text-right uppercase tracking-wider">Thao tác quản lý</div>
      </div>

      {/* Nội dung bảng */}
      <div className="divide-y divide-slate-50">
        {data.length > 0 ? (
          data.map((member) => (
            <div key={member.id} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-slate-50/40 transition-colors">
              <div className="col-span-2 font-bold text-slate-800">{member.name}</div>
              <div className="col-span-2 text-slate-600 font-medium">{member.phone}</div>
              
              <div className="col-span-8 flex justify-end gap-2 flex-wrap">
                <ActionButton icon={<Activity />} label="Kết quả" color="text-blue-600 bg-blue-50" onClick={() => onAction(member.id, 'ket-qua')} />
                <ActionButton icon={<Calendar />} label="Lịch tập" color="text-purple-600 bg-purple-50" onClick={() => onAction(member.id, 'lich-tap')} />
                <ActionButton icon={<Utensils />} label="Lịch ăn" color="text-orange-600 bg-orange-50" onClick={() => onAction(member.id, 'lich-an')} />
                <ActionButton icon={<BookOpen />} label="Bài tập" color="text-green-600 bg-green-50" onClick={() => onAction(member.id, 'bai-tap')} />

                <Button variant="outline" className="rounded-xl border-slate-200 h-9 px-3 gap-2" onClick={() => onAction(member.id, 'ho-so')}>
                  <UserCircle className="w-4 h-4" />
                  <span className="font-bold text-sm">Hồ sơ</span>
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-slate-400">Không tìm thấy hội viên nào phù hợp.</div>
        )}
      </div>
    </div>
  );
};

// Component con hỗ trợ render nút nhanh
const ActionButton = ({ icon, label, color, onClick }) => (
  <Button onClick={onClick} className={cn("rounded-xl h-9 px-3 border-none shadow-none gap-2 hover:opacity-80 transition-opacity", color)}>
    {cloneElement(icon, { className: "w-4 h-4" })}
    <span className="font-bold text-sm">{label}</span>
  </Button>
);

export default MemberTable;