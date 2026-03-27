import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/auth.providers";

// Import các component con vừa tạo
import { MemberSelector } from "@/features/mealSchedule/MemberSelector";
import { ScheduleHeader } from "@/features/mealSchedule/ScheduleHeader";
import { MacroOverview } from "@/features/mealSchedule/MacroOverview";
import { MealList } from "@/features/mealSchedule/MealList";
import { MealModals } from "@/features/mealSchedule/MealModals";

const MOCK_MEMBERS = [
  { id: "3", name: "Hội viên C" },
  { id: "4", name: "Nguyễn Văn A" },
];

const INITIAL_MEALS = {
  breakfast: [
    { id: 1, name: "Yến mạch", amount: "50g", calo: 190, p: 6, c: 32, f: 3 },
  ],
  lunch: [
    { id: 3, name: "Ức gà luộc", amount: "100g", calo: 165, p: 31, c: 0, f: 3.6 },
  ],
  dinner: [],
  snack: [
    { id: 4, name: "Sữa chua không đường", amount: "100g", calo: 59, p: 10, c: 3.6, f: 0.4 },
  ],
};

const MealSchedulePage = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  useEffect(() => {
    if (role === "HOIVIEN" && memberId && memberId !== String(user.id)) {
      navigate("/lich-an", { replace: true });
    }
    setIsEditing(false);
  }, [role, memberId, user.id, navigate]);

  const [selectedMember, setSelectedMember] = useState(memberId || "");
  const [isEditing, setIsEditing] = useState(false);
  const [meals, setMeals] = useState(INITIAL_MEALS);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [currentMealType, setCurrentMealType] = useState("");
  const [newDish, setNewDish] = useState({ name: "", amount: "", calo: "", p: "", c: "", f: "" });
  const [deleteData, setDeleteData] = useState({ isOpen: false, mealType: "", dishId: null });

  const totals = { calo: 0, p: 0, c: 0, f: 0 };
  Object.values(meals).flat().forEach(dish => {
    totals.calo += Number(dish.calo);
    totals.p += Number(dish.p);
    totals.c += Number(dish.c);
    totals.f += Number(dish.f);
  });

  const handleAddDish = () => {
    setMeals(prev => ({
      ...prev,
      [currentMealType]: [...prev[currentMealType], { ...newDish, id: Date.now() }]
    }));
    setIsAddOpen(false);
    setNewDish({ name: "", amount: "", calo: "", p: "", c: "", f: "" });
  };

  const confirmDelete = () => {
    setMeals(prev => ({
      ...prev,
      [deleteData.mealType]: prev[deleteData.mealType].filter(d => d.id !== deleteData.dishId)
    }));
    setDeleteData({ isOpen: false, mealType: "", dishId: null });
  };

  // Nếu là PT và chưa chọn ID -> Bật Component Selector
  if (role !== "HOIVIEN" && !memberId) {
    return (
      <MemberSelector 
        selectedMember={selectedMember} 
        onSelect={setSelectedMember} 
        onView={() => navigate(`/lich-an/${selectedMember}`)} 
        members={MOCK_MEMBERS} 
      />
    );
  }

  // Layout chính
  return (
    <div className="flex flex-col gap-3 w-full p-4">
      <ScheduleHeader 
        isEditing={isEditing} 
        setIsEditing={setIsEditing} 
        role={role} 
        onBack={() => navigate('/lich-an')} 
      />

      <MacroOverview 
        memberId={memberId} 
        isEditing={isEditing} 
        totals={totals} 
        members={MOCK_MEMBERS} 
      />

      <MealList 
        meals={meals} 
        isEditing={isEditing} 
        onAddClick={(type) => { setCurrentMealType(type); setIsAddOpen(true); }} 
        onDeleteClick={(type, id) => setDeleteData({ isOpen: true, mealType: type, dishId: id })} 
      />

      <MealModals 
        isAddOpen={isAddOpen} setIsAddOpen={setIsAddOpen}
        newDish={newDish} setNewDish={setNewDish}
        handleAddDish={handleAddDish}
        deleteData={deleteData} setDeleteData={setDeleteData}
        confirmDelete={confirmDelete}
      />
    </div>
  );
};

export default MealSchedulePage;