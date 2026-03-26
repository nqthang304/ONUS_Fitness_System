import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export const MealList = ({ meals, isEditing, onAddClick, onDeleteClick }) => {
  const mealTypes = { breakfast: "Bữa sáng", lunch: "Bữa trưa", dinner: "Bữa tối", snack: "Bữa phụ" };

  return (
    <div className="font-figtree space-y-1">
      {Object.entries(mealTypes).map(([type, title]) => (
        <Card key={type} className="rounded-2xl border-slate-100 shadow-sm mb-6 overflow-hidden">
          <div className="flex justify-between items-center px-6 pt-5 pb-2border-b border-slate-50 bg-white">
            <h3 className="font-bold text-slate-900">{title}</h3>
            {isEditing && (
              <Button variant="ghost" size="sm" className="text-blue-600 font-semibold hover:bg-blue-50 h-8 px-2"
                onClick={() => onAddClick(type)}
              >
                <Plus className="w-4 h-4 mr-1" /> Thêm món
              </Button>
            )}
          </div>

          <div className="px-6 pb-6 pt-2 bg-slate-50/30">
            {meals[type].length > 0 ? (
              <div className="space-y-4">
                {meals[type].map(dish => (
                  <div key={dish.id} className="flex justify-between items-center group">
                    <div>
                      <h4 className="font-semibold text-slate-800">{dish.name}</h4>
                      <p className="text-sm text-slate-500 mt-1">{dish.amount}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="font-bold text-slate-900">{dish.calo} <span className="text-xs text-slate-500">kcal</span></span>
                        <p className="text-xs text-slate-500 mt-1 tracking-wide">
                          P:{dish.p}g <span className="text-slate-300 mx-1">|</span> C:{dish.c}g <span className="text-slate-300 mx-1">|</span> F:{dish.f}g
                        </p>
                      </div>
                      {isEditing && (
                         <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50"
                           onClick={() => onDeleteClick(type, dish.id)}
                         >
                           <Trash2 className="w-5 h-5" />
                         </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-400 py-4 text-sm font-medium">Chưa có món ăn nào trong bữa này</p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};