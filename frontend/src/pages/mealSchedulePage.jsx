import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/auth.providers";
import profileApi from "@/api/profileApi";
import mealApi from "@/api/mealApi";

// Import các component con vừa tạo
import { MemberSelector } from "@/features/mealSchedule/MemberSelector";
import { ScheduleHeader } from "@/features/mealSchedule/ScheduleHeader";
import { MacroOverview } from "@/features/mealSchedule/MacroOverview";
import { MealList } from "@/features/mealSchedule/MealList";
import { MealModals } from "@/features/mealSchedule/MealModals";

const normalizeMember = (member) => ({
  id: String(member?.account_info?.id || member?.Id_TaiKhoan || member?.id || ""),
  hoi_vien_id: String(member?.id || ""),
  name: member?.HoTen || member?.ho_ten || member?.account_info?.username || member?.username || "",
});

const INITIAL_MEALS = {
  breakfast: [],
  lunch: [],
  dinner: [],
  snack: [],
};

const INITIAL_MEAL_META = {
  breakfast: null,
  lunch: null,
  dinner: null,
  snack: null,
};

const MEAL_TYPE_TO_BACKEND = {
  breakfast: "BuaSang",
  lunch: "BuaTrua",
  dinner: "BuaToi",
  snack: "BuaPhu",
};

const BACKEND_TO_MEAL_TYPE = {
  BuaSang: "breakfast",
  BuaTrua: "lunch",
  BuaToi: "dinner",
  BuaPhu: "snack",
};

const normalizeMealFood = (food) => ({
  id: String(food?.id || ""),
  name: food?.TenThucPham || "",
  amount: String(food?.Luong || ""),
  calo: Number(food?.Calo ?? 0),
  p: Number(food?.Protein ?? 0),
  c: Number(food?.Carb ?? 0),
  f: Number(food?.Fat ?? 0),
});

const MealSchedulePage = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { role, currentUserId } = useAuth();
  const currentRole = String(role || "").toLowerCase();
  const targetUserId = currentRole === "hoivien" ? String(currentUserId || "") : String(memberId || "");

  useEffect(() => {
    if (currentRole === "hoivien" && memberId && memberId !== String(currentUserId || "")) {
      navigate("/lich-an", { replace: true });
    }
    setIsEditing(false);
  }, [currentRole, memberId, currentUserId, navigate]);

  const [selectedMember, setSelectedMember] = useState(memberId || "");
  const [members, setMembers] = useState([]);
  const [selfHoiVienId, setSelfHoiVienId] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [meals, setMeals] = useState(INITIAL_MEALS);
  const [mealMeta, setMealMeta] = useState(INITIAL_MEAL_META);
  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [addModalError, setAddModalError] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [currentMealType, setCurrentMealType] = useState("");
  const [newDish, setNewDish] = useState({ name: "", amount: "", calo: "", p: "", c: "", f: "" });
  const [deleteData, setDeleteData] = useState({ isOpen: false, mealType: "", dishId: null });

  useEffect(() => {
    setSelectedMember(memberId || "");
  }, [memberId]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await profileApi.getHoiVienList();
        const rawMembers = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.results)
            ? response.data.results
            : [];

        setMembers(rawMembers.map(normalizeMember).filter((member) => member.id));
      } catch (memberError) {
        console.error("Lỗi khi lấy danh sách hội viên:", memberError);
        setMembers([]);
      }
    };

    fetchMembers();
  }, []);

  useEffect(() => {
    const fetchSelfProfile = async () => {
      if (currentRole !== "hoivien") return;
      try {
        const response = await profileApi.getProfile();
        setSelfHoiVienId(String(response?.data?.id || ""));
      } catch (profileError) {
        console.error("Lỗi khi lấy hồ sơ hội viên:", profileError);
        setSelfHoiVienId("");
      }
    };

    fetchSelfProfile();
  }, [currentRole]);

  const loadMeals = async () => {
    if (!targetUserId) {
      setMeals(INITIAL_MEALS);
      setMealMeta(INITIAL_MEAL_META);
      return;
    }

    setIsLoading(true);
    setPageError("");

    try {
      const response = await mealApi.getMealByUserId(targetUserId);
      const results = Array.isArray(response?.data?.results) ? response.data.results : [];

      const nextMeals = { ...INITIAL_MEALS };
      const nextMealMeta = { ...INITIAL_MEAL_META };

      results.forEach((meal) => {
        const mealType = BACKEND_TO_MEAL_TYPE[meal?.TenBua];
        if (!mealType) return;

        nextMealMeta[mealType] = String(meal?.Id_LichAn || meal?.id || "");
        const foods = Array.isArray(meal?.chitietbuaan) ? meal.chitietbuaan : [];
        nextMeals[mealType] = foods.map(normalizeMealFood);
      });

      setMeals(nextMeals);
      setMealMeta(nextMealMeta);
    } catch (mealError) {
      console.error("Lỗi khi lấy lịch ăn:", mealError);
      setPageError(mealError?.response?.data?.detail || "Không thể tải thông tin thực đơn.");
      setMeals(INITIAL_MEALS);
      setMealMeta(INITIAL_MEAL_META);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMeals();
  }, [targetUserId]);

  const resolveHoiVienId = () => {
    if (currentRole === "hoivien") {
      return selfHoiVienId;
    }

    const selected = members.find((member) => String(member.id) === String(targetUserId));
    return selected?.hoi_vien_id || "";
  };

  const totals = { calo: 0, p: 0, c: 0, f: 0 };
  Object.values(meals).flat().forEach(dish => {
    totals.calo += Number(dish.calo);
    totals.p += Number(dish.p);
    totals.c += Number(dish.c);
    totals.f += Number(dish.f);
  });

  const handleAddDish = async () => {
    if (!isEditing) return;
    if (!currentMealType) return;

    if (!String(newDish.name || "").trim()) {
      setAddModalError("Vui lòng nhập tên thực phẩm.");
      return;
    }

    const hoiVienId = resolveHoiVienId();
    if (!hoiVienId) {
      setAddModalError("Không xác định được hội viên để cập nhật thực đơn.");
      return;
    }

    const amountValue = String(newDish.amount || "").trim();
    if (!amountValue) {
      setAddModalError("Vui lòng nhập lượng thực phẩm.");
      return;
    }

    setAddModalError("");
    try {
      let mealId = mealMeta[currentMealType];
      if (!mealId) {
        const mealResponse = await mealApi.createMeal({
          hoi_vien_id: Number(hoiVienId),
          ten_bua: MEAL_TYPE_TO_BACKEND[currentMealType],
        });
        mealId = String(mealResponse?.data?.data?.Id_LichAn || mealResponse?.data?.data?.id || "");
        setMealMeta((prev) => ({ ...prev, [currentMealType]: mealId }));
      }

      const response = await mealApi.createMealFood({
        id_lich_an: Number(mealId),
        ten_thuc_pham: String(newDish.name || "").trim(),
        luong: amountValue,
        calo: Number(newDish.calo || 0),
        protein: Number(newDish.p || 0),
        carb: Number(newDish.c || 0),
        fat: Number(newDish.f || 0),
      });

      const createdFood = normalizeMealFood(response?.data?.data || {});
      setMeals((prev) => ({
        ...prev,
        [currentMealType]: [...prev[currentMealType], createdFood],
      }));

      setIsAddOpen(false);
      setNewDish({ name: "", amount: "", calo: "", p: "", c: "", f: "" });
      setAddModalError("");
    } catch (apiError) {
      console.error("Lỗi khi thêm món ăn:", apiError);
      setAddModalError(apiError?.response?.data?.detail || "Không thể thêm món ăn.");
    }
  };

  const confirmDelete = async () => {
    if (!isEditing) {
      setDeleteData({ isOpen: false, mealType: "", dishId: null });
      return;
    }

    try {
      await mealApi.deleteMealFood(deleteData.dishId);
      setMeals((prev) => ({
        ...prev,
        [deleteData.mealType]: prev[deleteData.mealType].filter((d) => String(d.id) !== String(deleteData.dishId)),
      }));
      setDeleteData({ isOpen: false, mealType: "", dishId: null });
    } catch (apiError) {
      console.error("Lỗi khi xóa món ăn:", apiError);
      setPageError(apiError?.response?.data?.detail || "Không thể xóa món ăn.");
    }
  };

  // Nếu là PT và chưa chọn ID -> Bật Component Selector
  if (currentRole !== "hoivien" && !memberId) {
    return (
      <MemberSelector 
        selectedMember={selectedMember} 
        onSelect={setSelectedMember} 
        onView={() => navigate(`/lich-an/${selectedMember}`)} 
        members={members} 
      />
    );
  }

  // Layout chính
  return (
    <div className="flex flex-col gap-3 w-full p-4">
      <ScheduleHeader 
        isEditing={isEditing} 
        setIsEditing={setIsEditing} 
        role={currentRole} 
        onBack={() => navigate('/lich-an')} 
      />

      {isLoading && (
        <div className="bg-white p-4 text-center text-slate-500 border border-slate-100 rounded-2xl shadow-sm">
          Đang tải thông tin thực đơn...
        </div>
      )}

      {!isLoading && pageError && (
        <div className="bg-red-50 p-4 text-center text-red-600 border border-red-100 rounded-2xl shadow-sm">
          {pageError}
        </div>
      )}

      <MacroOverview 
        memberId={memberId} 
        isEditing={isEditing} 
        totals={totals} 
        members={members} 
      />

      <MealList 
        meals={meals} 
        isEditing={isEditing} 
        onAddClick={(type) => { setCurrentMealType(type); setIsAddOpen(true); }} 
        onDeleteClick={(type, id) => setDeleteData({ isOpen: true, mealType: type, dishId: id })} 
      />

      <MealModals 
        isAddOpen={isAddOpen}
        setIsAddOpen={(open) => {
          setIsAddOpen(open);
          if (!open) {
            setAddModalError("");
          }
        }}
        newDish={newDish} setNewDish={setNewDish}
        addError={addModalError}
        handleAddDish={handleAddDish}
        deleteData={deleteData} setDeleteData={setDeleteData}
        confirmDelete={confirmDelete}
      />
    </div>
  );
};

export default MealSchedulePage;