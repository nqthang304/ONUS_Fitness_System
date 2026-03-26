import { Card } from "@/components/ui/card";
import { StatRow } from "./ResultLatest";

export const ResultHistory = ({ historyResults }) => {
  if (!historyResults || historyResults.length === 0) return null;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  };

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-lg font-bold text-slate-900">Lịch sử kết quả tập luyện</h2>
      
      {historyResults.map((record) => (
        <div key={record.Id} className="space-y-3">
          <p className="text-sm font-medium text-slate-500">{formatDate(record.NgayTao)}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 rounded-2xl border-slate-100 shadow-sm opacity-80">
              <h3 className="font-bold text-slate-900 mb-2">Thông tin thể trạng</h3>
              <div className="mt-4">
                <StatRow label="Cân nặng" value={`${record.CanNang} kg`} />
                <StatRow label="Chiều cao" value={`${record.ChieuCao} cm`} />
                <StatRow label="Vòng bụng" value={`${record.VongBung} cm`} />
                <StatRow label="Vòng mông" value={`${record.VongMong} cm`} />
              </div>
            </Card>

            <Card className="p-6 rounded-2xl border-slate-100 shadow-sm opacity-80">
              <h3 className="font-bold text-slate-900 mb-2">Chỉ số cơ thể</h3>
              <div className="mt-4">
                <StatRow label="BMI" value={record.BMI} valueClass="text-blue-600" />
                <StatRow label="Tỷ lệ mỡ" value={`${record.PhanTramMo} %`} />
                <StatRow label="Tỷ lệ cơ" value={`${record.PhamTramCo} %`} />
                <StatRow label="BMR (Trao đổi chất)" value={`${record.TyLeTraoDoiChat} kcal`} />
              </div>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );
};