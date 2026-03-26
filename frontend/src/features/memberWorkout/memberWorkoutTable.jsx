import { Badge } from "@/components/ui/badge";

export const MemberWorkoutTable = ({ exercises }) => {
  // Danh sách các mục lục hiển thị tĩnh
  const SECTIONS = [
    { id: "KHOI_DONG", label: "KHỞI ĐỘNG" },
    { id: "BAI_TAP_CHINH", label: "BÀI TẬP CHÍNH" },
    { id: "CARDIO", label: "CARDIO" },
    { id: "GIAN_CO", label: "GIÃN CƠ" },
  ];

  return (
    <div className="w-full bg-white rounded-b-2xl rounded-tr-2xl border border-slate-100 shadow-sm font-figtree overflow-hidden">
      
      {/* HEADER CỦA BẢNG */}
      <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-orange-50/50 text-xs font-bold text-slate-600 border-b border-orange-100">
        <div className="col-span-4">Tên bài tập</div>
        <div className="col-span-2 text-center">Thời gian</div>
        <div className="col-span-1 text-center">Số lần</div>
        <div className="col-span-1 text-center">Số hiệp</div>
        <div className="col-span-2 text-center">Nghỉ</div>
        <div className="col-span-2 text-center">Cường độ</div>
      </div>

      {/* RENDER NỘI DUNG THEO TỪNG MỤC LỤC */}
      {SECTIONS.map((section) => {
        const sectionExercises = exercises.filter(ex => ex.MucLuc === section.id);
        
        // Nếu mục này không có bài tập nào thì ẩn luôn cho gọn
        if (sectionExercises.length === 0) return null;

        return (
          <div key={section.id} className="border-b border-slate-50 last:border-0">
            {/* Thanh Tiêu đề mục (KHỞI ĐỘNG, BÀI TẬP CHÍNH...) */}
            <div className="px-6 py-4 bg-slate-50/30">
              <h4 className="font-bold text-sm text-slate-800 uppercase">{section.label}</h4>
            </div>

            {/* Danh sách bài tập bên trong mục */}
            <div className="px-6">
              {sectionExercises.map((ex) => (
                <div key={ex.Id} className="grid grid-cols-12 gap-4 py-5 items-center border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
                  <div className="col-span-4 font-semibold text-slate-800 text-sm pr-4">{ex.TenBai}</div>
                  <div className="col-span-2 text-center text-slate-600 text-sm">{ex.ThoiGian}</div>
                  <div className="col-span-1 text-center text-slate-600 text-sm">{ex.SoLan}</div>
                  <div className="col-span-1 text-center text-slate-600 text-sm">{ex.SoHiep}</div>
                  <div className="col-span-2 text-center text-slate-600 text-sm">{ex.Nghi}</div>
                  <div className="col-span-2 text-center">
                    {ex.CuongDo && ex.CuongDo !== "-" ? (
                      <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold border-none">
                        {ex.CuongDo}
                      </Badge>
                    ) : (
                      <span className="text-slate-400 text-sm">-</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};