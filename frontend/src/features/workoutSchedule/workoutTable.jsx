import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Check, X } from "lucide-react";
import { SECTIONS } from "./mockData";

export const WorkoutTable = ({ exercises, onAddExercise, onDeleteExercise, onDraftChange }) => {
  // Trạng thái theo dõi đang mở form thêm ở Mục lục nào
  const [addingSection, setAddingSection] = useState(null);
  const [newExercise, setNewExercise] = useState({
    ten_bai: "", thoi_gian: "", so_lan: "", so_hiep: "", nghi: "", cuong_do: ""
  });

  useEffect(() => {
    onDraftChange?.(addingSection !== null);
  }, [addingSection, onDraftChange]);

  const handleSave = (sectionId) => {
    if (!newExercise.ten_bai.trim()) return;
    onAddExercise({ ...newExercise, muc_luc: sectionId });
    setAddingSection(null);
    setNewExercise({ ten_bai: "", thoi_gian: "", so_lan: "", so_hiep: "", nghi: "", cuong_do: "" });
  };

  return (
    <div className="bg-white rounded-b-2xl rounded-tr-2xl border border-slate-100 shadow-sm font-figtree">
      {/* HEADER BẢNG */}
      <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-orange-50/50 text-xs font-bold text-slate-600 border-b border-orange-100">
        <div className="col-span-4 uppercase">Tên bài tập</div>
        <div className="col-span-2 text-center uppercase">Thời gian</div>
        <div className="col-span-1 text-center uppercase">Số lần</div>
        <div className="col-span-1 text-center uppercase">Số hiệp</div>
        <div className="col-span-1 text-center uppercase">Nghỉ</div>
        <div className="col-span-2 text-center uppercase">Cường độ</div>
        <div className="col-span-1"></div>
      </div>

      {/* RENDER TỪNG MỤC LỤC */}
      {SECTIONS.map((section) => {
        const sectionExercises = exercises.filter(ex => ex.muc_luc === section.id);

        return (
          <div key={section.id} className="border-b border-slate-50 last:border-0 pb-2">
            {/* Tiêu đề mục lục */}
            <div className="flex justify-between items-center px-6 py-4 bg-slate-100">
              <h4 className="font-bold text-sm text-slate-800 uppercase ">{section.label}</h4>
              <Button variant="ghost" size="sm" className="text-blue-600 font-semibold h-8"
                onClick={() => setAddingSection(section.id)}
              >
                <Plus className="w-4 h-4 mr-1" /> Thêm bài tập
              </Button>
            </div>

            {/* Danh sách bài tập */}
            <div className="px-6">
              {sectionExercises.map((ex) => (
                <div key={ex.id} className="grid grid-cols-12 gap-4 py-4 items-center border-b border-slate-50 last:border-0 group">
                  <div className="col-span-4 font-semibold text-slate-800 text-sm">{ex.ten_bai}</div>
                  <div className="col-span-2 text-center text-slate-600 text-sm">{ex.thoi_gian}</div>
                  <div className="col-span-1 text-center text-slate-600 text-sm">{ex.so_lan}</div>
                  <div className="col-span-1 text-center text-slate-600 text-sm">{ex.so_hiep}</div>
                  <div className="col-span-1 text-center text-slate-600 text-sm">{ex.nghi}</div>
                  <div className="col-span-2 text-center">
                    {ex.cuong_do && ex.cuong_do !== "-" ? (
                      <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold">
                        {ex.cuong_do}
                      </Badge>
                    ) : (
                      <span className="text-slate-600 text-sm">-</span>
                    )}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button variant="ghost" size="icon" className="text-slate-300 hover:text-red-600 hover:bg-red-50 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onDeleteExercise(ex.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* DÒNG INLINE INPUT (Hiển thị khi bấm thêm) */}
              {addingSection === section.id && (
                <div className="grid grid-cols-12 gap-2 py-3 items-center border-b border-slate-50">
                  <div className="col-span-4">
                    <Input placeholder="Tên bài tập mới" autoFocus className="h-9 text-sm" value={newExercise.ten_bai} onChange={e => setNewExercise({...newExercise, ten_bai: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <Input placeholder="Thời gian" className="h-9 text-sm text-center" value={newExercise.thoi_gian} onChange={e => setNewExercise({...newExercise, thoi_gian: e.target.value})} />
                  </div>
                  <div className="col-span-1">
                    <Input placeholder="Lần" className="h-9 text-sm text-center" value={newExercise.so_lan} onChange={e => setNewExercise({...newExercise, so_lan: e.target.value})} />
                  </div>
                  <div className="col-span-1">
                    <Input placeholder="Hiệp" className="h-9 text-sm text-center" value={newExercise.so_hiep} onChange={e => setNewExercise({...newExercise, so_hiep: e.target.value})} />
                  </div>
                  <div className="col-span-1">
                    <Input placeholder="Thời gian" className="h-9 text-sm text-center" value={newExercise.nghi} onChange={e => setNewExercise({...newExercise, nghi: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <Input placeholder="RPE..." className="h-9 text-sm text-center" value={newExercise.cuong_do} onChange={e => setNewExercise({...newExercise, cuong_do: e.target.value})} />
                  </div>
                  <div className="col-span-1 flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-50" onClick={() => handleSave(section.id)}>
                      <Check className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => setAddingSection(null)}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};