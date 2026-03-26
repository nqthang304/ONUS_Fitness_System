import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const MemberSearch = ({ value, onChange }) => {
  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      <Input
        placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
        className="pl-10 h-12 rounded-xl border-slate-200 bg-white focus-visible:ring-onus-blue"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default MemberSearch;