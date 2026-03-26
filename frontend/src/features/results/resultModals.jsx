import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const InputGroup = ({ label, value, onChange }) => (
  <div>
    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">{label}</label>
    <Input
      type="number"
      className="bg-white h-11 rounded-xl"
      value={value}
      onChange={onChange}
    />
  </div>
);

export const ResultModals = ({ isAddOpen, setIsAddOpen, memberData, handleAddDish, handleAddResult }) => {
  const [formData, setFormData] = useState({
    CanNang: "", ChieuCao: "", VongBung: "", VongMong: ""
  });
  
  const [calculated, setCalculated] = useState({
    bmi: null, fat: null, muscle: null, bmr: null
  });

  // Chạy các công thức tính toán thời gian thực khi Cân nặng & Chiều cao thay đổi
  useEffect(() => {
    const w = parseFloat(formData.CanNang);
    const h = parseFloat(formData.ChieuCao); // Đơn vị: cm
    const age = memberData.age;
    const gender = memberData.gender;

    if (w > 0 && h > 0) {
      // 1. Chỉ số khối cơ thể (BMI)
      const h_met = h / 100;
      const bmi = w / (h_met * h_met);

      let fat = 0, lbm = 0, bmr = 0;

      if (gender === "Nam") {
        // 2. Tỷ lệ mỡ (Nam)
        fat = (1.39 * bmi) + (0.16 * age) - 19.34;
        // 3. Khối lượng cơ thể không mỡ LBM (Nam)
        lbm = (0.32810 * w) + (0.33929 * h) - 29.5336;
        // 4. BMR (Nam)
        bmr = (10 * w) + (6.25 * h) - (5 * age) + 5;
      } else {
        // 2. Tỷ lệ mỡ (Nữ)
        fat = (1.39 * bmi) + (0.16 * age) - 9;
        // 3. Khối lượng cơ thể không mỡ LBM (Nữ)
        lbm = (0.29569 * w) + (0.41813 * h) - 43.2933;
        // 4. BMR (Nữ)
        bmr = (10 * w) + (6.25 * h) - (5 * age) - 161;
      }

      // Tỷ lệ cơ (%) = LBM(kg) / Cân Nặng(kg) * 100
      const muscle = (lbm / w) * 100;

      setCalculated({
        bmi: bmi.toFixed(1),
        fat: fat.toFixed(0),
        muscle: muscle.toFixed(0),
        bmr: Math.round(bmr)
      });
    } else {
      setCalculated({ bmi: null, fat: null, muscle: null, bmr: null });
    }
  }, [formData.CanNang, formData.ChieuCao, memberData]);

  const submitForm = () => {
    handleAddResult({
      CanNang: Number(formData.CanNang),
      ChieuCao: Number(formData.ChieuCao),
      VongBung: Number(formData.VongBung),
      VongMong: Number(formData.VongMong),
      BMI: Number(calculated.bmi),
      PhanTramMo: Number(calculated.fat),
      PhamTramCo: Number(calculated.muscle),
      TyLeTraoDoiChat: Number(calculated.bmr),
    });
    setFormData({ CanNang: "", ChieuCao: "", VongBung: "", VongMong: "" });
  };

  return (
    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl font-figtree bg-slate-50 border-none p-6">
        <DialogHeader><DialogTitle className="text-xl">Thêm kết quả InBody mới</DialogTitle></DialogHeader>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-5 py-2 mt-2">
          <InputGroup
            label="Cân nặng (kg)"
            value={formData.CanNang}
            onChange={(e) => setFormData({ ...formData, CanNang: e.target.value })}
          />
          <InputGroup
            label="Chiều cao (cm)"
            value={formData.ChieuCao}
            onChange={(e) => setFormData({ ...formData, ChieuCao: e.target.value })}
          />
          
          {/* Thông tin readonly từ DB */}
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Tuổi</label>
            <div className="h-11 flex items-center px-3 bg-slate-100 rounded-xl text-slate-500 text-sm font-medium">{memberData.age}</div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Giới tính</label>
            <div className="h-11 flex items-center px-3 bg-slate-100 rounded-xl text-slate-500 text-sm font-medium">{memberData.gender}</div>
          </div>

          <InputGroup
            label="Vòng bụng (cm)"
            value={formData.VongBung}
            onChange={(e) => setFormData({ ...formData, VongBung: e.target.value })}
          />
          <InputGroup
            label="Vòng mông (cm)"
            value={formData.VongMong}
            onChange={(e) => setFormData({ ...formData, VongMong: e.target.value })}
          />
        </div>

        {/* Khối kết quả dự tính */}
        <div className="bg-slate-100 rounded-2xl p-4 mt-2 space-y-3">
          <p className="text-xs font-medium text-slate-500 mb-1">Kết quả dự tính:</p>
          <div className="flex justify-between text-sm"><span className="text-slate-600">BMI:</span> <span className="font-bold">{calculated.bmi || "-"}</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-600">Tỷ lệ mỡ:</span> <span className="font-bold">{calculated.fat || "-"} %</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-600">Tỷ lệ cơ:</span> <span className="font-bold">{calculated.muscle || "-"} %</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-600">BMR (Trao đổi chất):</span> <span className="font-bold">{calculated.bmr || "-"} kcal</span></div>
        </div>

        <DialogFooter className="mt-4 gap-3 sm:space-x-0">
          <Button variant="ghost" className="rounded-xl flex-1 text-slate-500" onClick={() => setIsAddOpen(false)}>Hủy</Button>
          <Button onClick={submitForm} disabled={!calculated.bmi} className="bg-blue-600 hover:bg-blue-700 rounded-xl flex-1 shadow-sm">
            Lưu kết quả
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};