import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/auth.providers";
import { Card } from "@/components/ui/card";

import { ResultMemberSelector } from "@/features/results/ResultMemberSelector";
import { ResultHeader } from "@/features/results//ResultHeader";
import { ResultLatest } from "@/features/results//ResultLatest";
import { ResultHistory } from "@/features/results//ResultHistory";
import { ResultModals } from "@/features/results//ResultModals";

// Dữ liệu mẫu (Giả lập CSDL)
const MOCK_MEMBERS = [
  { id: "3", name: "Hội viên C", age: 22, gender: "Nữ" },
  { id: "4", name: "Nguyễn Văn A", age: 24, gender: "Nam" },
];

const INITIAL_RESULTS = [
  { Id: 1, Id_HoiVien: "4", CanNang: 70, ChieuCao: 175, VongBung: 80, VongMong: 95, BMI: 22.9, PhanTramMo: 18, PhamTramCo: 40, TyLeTraoDoiChat: 1650, NgayTao: "2026-03-20" },
  { Id: 2, Id_HoiVien: "4", CanNang: 71, ChieuCao: 175, VongBung: 81, VongMong: 95, BMI: 23.2, PhanTramMo: 18.7, PhamTramCo: 39.6, TyLeTraoDoiChat: 1660, NgayTao: "2026-02-16" },
  { Id: 3, Id_HoiVien: "4", CanNang: 72, ChieuCao: 175, VongBung: 82, VongMong: 96, BMI: 23.5, PhanTramMo: 19, PhamTramCo: 39, TyLeTraoDoiChat: 1670, NgayTao: "2026-01-15" },

  { Id: 4, Id_HoiVien: "3", CanNang: 54, ChieuCao: 165, VongBung: 70, VongMong: 93, BMI: 19.8, PhanTramMo: 22, PhamTramCo: 41.3, TyLeTraoDoiChat: 1334, NgayTao: "2026-03-24" },
  { Id: 5, Id_HoiVien: "3", CanNang: 55, ChieuCao: 165, VongBung: 71, VongMong: 94, BMI: 20.2, PhanTramMo: 22.8, PhamTramCo: 40.6, TyLeTraoDoiChat: 1342, NgayTao: "2026-02-24" },
  { Id: 6, Id_HoiVien: "3", CanNang: 56, ChieuCao: 165, VongBung: 73, VongMong: 95, BMI: 20.6, PhanTramMo: 23.5, PhamTramCo: 39.9, TyLeTraoDoiChat: 1350, NgayTao: "2026-01-24" },

  { Id: 7, Id_HoiVien: "3", CanNang: 53.5, ChieuCao: 165, VongBung: 69, VongMong: 92, BMI: 19.6, PhanTramMo: 21.7, PhamTramCo: 41.7, TyLeTraoDoiChat: 1326, NgayTao: "2025-12-24" },
];

const ResultPage = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  // Bảo mật: Ép hội viên về đúng URL của mình nếu cố tình nhập ID người khác
  useEffect(() => {
    if (role === "HOIVIEN" && memberId && memberId !== String(user.id)) {
      navigate("/ket-qua", { replace: true });
    }
  }, [role, memberId, user?.id, navigate]);

  // Xác định ID cần hiển thị (Hội viên thì tự lấy ID của mình, HLV thì lấy từ URL)
  const activeMemberId = role === "HOIVIEN" ? String(user?.id) : memberId;

  const [selectedMember, setSelectedMember] = useState(activeMemberId || "");
  const [results, setResults] = useState(INITIAL_RESULTS);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Lọc kết quả của người đang được chọn và sắp xếp mới nhất lên đầu
  const memberResults = results
    .filter(r => r.Id_HoiVien === activeMemberId)
    .sort((a, b) => new Date(b.NgayTao) - new Date(a.NgayTao));

  const latestResult = memberResults[0];
  const historyResults = memberResults.slice(1);
  const currentMemberData = MOCK_MEMBERS.find(m => m.id === activeMemberId);

  // Xử lý lưu kết quả mới
  const handleAddResult = (newCalculatedData) => {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const newRecord = {
      Id: Date.now(),
      Id_HoiVien: activeMemberId,
      ...newCalculatedData,
      NgayTao: formattedDate,
    };

    setResults([newRecord, ...results]);
    setIsAddOpen(false);
  };

  // Layout chọn hội viên cho HLV
  if (role !== "HOIVIEN" && !memberId) {
    return (
      <ResultMemberSelector 
        selectedMember={selectedMember} 
        onSelect={setSelectedMember} 
        onView={() => navigate(`/ket-qua/${selectedMember}`)} 
        members={MOCK_MEMBERS} 
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full p-4 font-figtree">
      <ResultHeader 
        role={role} 
        latestDate={latestResult?.NgayTao}
        onAddClick={() => setIsAddOpen(true)}
        onBack={role !== "HOIVIEN" ? () => navigate('/ket-qua') : undefined}
      />

      {currentMemberData && (
        <Card className="p-4 rounded-2xl border-slate-100 shadow-sm bg-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Hội viên</p>
              <p className="text-sm font-bold text-slate-900">{currentMemberData.name}</p>
            </div>
            </div>
        </Card>
      )}

      <ResultLatest latestResult={latestResult} />
      
      <ResultHistory historyResults={historyResults} />

      {currentMemberData && (
        <ResultModals 
          isAddOpen={isAddOpen} 
          setIsAddOpen={setIsAddOpen}
          memberData={currentMemberData}
          handleAddResult={handleAddResult}
        />
      )}
    </div>
  );
};

export default ResultPage;