import { Card } from "@/components/ui/card";

export const StatRow = ({ label, value, valueClass = "text-slate-900" }) => (
  <div className="flex justify-between items-center py-4 border-b border-slate-50 last:border-0">
    <span className="text-sm font-medium text-slate-500">{label}</span>
    <span className={`text-sm font-bold ${valueClass}`}>{value}</span>
  </div>
);

export const ResultLatest = ({ latestResult }) => {
  if (!latestResult) {
    return (
      <Card className="p-8 text-center text-slate-400 rounded-2xl border-slate-100 shadow-sm">
        Chưa có dữ liệu chỉ số cơ thể.
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Bảng 1: Thông tin thể trạng */}
      <Card className="p-6 rounded-2xl border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-2">Thông tin thể trạng</h3>
        <div className="mt-4">
          <StatRow label="Cân nặng" value={`${latestResult.CanNang} kg`} />
          <StatRow label="Chiều cao" value={`${latestResult.ChieuCao} cm`} />
          <StatRow label="Vòng bụng" value={`${latestResult.VongBung} cm`} />
          <StatRow label="Vòng mông" value={`${latestResult.VongMong} cm`} />
        </div>
      </Card>

      {/* Bảng 2: Chỉ số cơ thể */}
      <Card className="p-6 rounded-2xl border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-2">Chỉ số cơ thể</h3>
        <div className="mt-4">
          <StatRow label="BMI" value={latestResult.BMI} valueClass="text-blue-600" />
          <StatRow label="Tỷ lệ mỡ" value={`${latestResult.PhanTramMo} %`} />
          <StatRow label="Tỷ lệ cơ" value={`${latestResult.PhamTramCo} %`} />
          <StatRow label="BMR (Trao đổi chất)" value={`${latestResult.TyLeTraoDoiChat} kcal`} />
        </div>
      </Card>
    </div>
  );
};