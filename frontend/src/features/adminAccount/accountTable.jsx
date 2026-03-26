import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Lock, Unlock, Trash2 } from "lucide-react";

export const AccountTable = ({ data, onEdit, onToggleStatus, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden font-figtree">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 bg-slate-50/50 uppercase font-bold border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Họ và tên</th>
              <th className="px-6 py-4">Số điện thoại</th>
              <th className="px-6 py-4 text-center">Vai trò</th>
              <th className="px-6 py-4 text-center">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.length > 0 ? data.map((acc) => (
              <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-900">{acc.name}</td>
                <td className="px-6 py-4 text-slate-600">{acc.phone}</td>
                <td className="px-6 py-4 text-center">
                  <Badge variant="secondary" className={`border-none ${acc.role === 'HLV' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                    {acc.role}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-center">
                  <Badge variant="secondary" className={`border-none ${acc.status === 'Hoạt động' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {acc.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-1">
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600" onClick={() => onEdit(acc)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-orange-600" onClick={() => onToggleStatus(acc)}>
                    {acc.status === 'Hoạt động' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600" onClick={() => onDelete(acc)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-400">Không tìm thấy tài khoản nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};