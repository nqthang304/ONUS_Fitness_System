import { createContext, useContext, useState, useMemo } from "react";

const FitnessContext = createContext();

export const FitnessProvider = ({ children }) => {
  // 1. Dữ liệu thực đơn hiện tại (Mock từ bảng LichAn + ChiTietLichAn)
  const [mealPlan, setMealPlan] = useState([
    { id: 1, tenBua: "Bữa sáng", calo: 295, p: 31, c: 30, f: 5 },
    { id: 2, tenBua: "Bữa trưa", calo: 600, p: 45, c: 50, f: 12 },
    { id: 3, tenBua: "Bữa tối", calo: 0, p: 0, c: 0, f: 0 },
    { id: 4, tenBua: "Bữa phụ", calo: 0, p: 0, c: 0, f: 0 },
  ]);

  // 2. Tính toán 4 chỉ số tổng (Dùng cho 4 ô to ở trên cùng giao diện)
  const totals = useMemo(() => {
    return mealPlan.reduce(
      (acc, meal) => ({
        calo: acc.calo + meal.calo,
        protein: acc.protein + meal.p,
        carb: acc.carb + meal.c,
        fat: acc.fat + meal.f,
      }),
      { calo: 0, protein: 0, carb: 0, fat: 0 }
    );
  }, [mealPlan]);

  // 3. Hàm cập nhật món ăn (Khi HLV chỉnh sửa)
  const updateMeal = (id, newData) => {
    setMealPlan(prev => prev.map(m => m.id === id ? { ...m, ...newData } : m));
  };

  return (
    <FitnessContext.Provider value={{ mealPlan, totals, updateMeal }}>
      {children}
    </FitnessContext.Provider>
  );
};

export const useFitness = () => useContext(FitnessContext);