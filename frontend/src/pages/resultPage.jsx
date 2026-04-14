import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/providers/auth.providers";
import { Card } from "@/components/ui/card";
import profileApi from "@/api/profileApi";
import bodyIndexApi from "@/api/bodyIndexApi";

import { ResultMemberSelector } from "@/features/results/ResultMemberSelector";
import { ResultHeader } from "@/features/results//ResultHeader";
import { ResultLatest } from "@/features/results//ResultLatest";
import { ResultHistory } from "@/features/results//ResultHistory";
import { ResultModals } from "@/features/results//ResultModals";
import { DeleteConfirmModal } from "@/features/results/deleteConfirmModal";

const normalizeMember = (member) => ({
  id: String(member?.account_info?.id || member?.Id_TaiKhoan || member?.id || ""),
  accountId: String(member?.account_info?.id || member?.Id_TaiKhoan || ""),
  hoi_vien_id: String(member?.id || ""),
  name: member?.HoTen || member?.ho_ten || member?.account_info?.username || member?.username || "",
  ngaySinh: member?.NgaySinh || "",
  gioiTinh: member?.GioiTinh || "",
});

const normalizeSelfProfile = (profile) => ({
  id: String(profile?.account_info?.id || profile?.id || ""),
  accountId: String(profile?.account_info?.id || profile?.id || ""),
  hoi_vien_id: String(profile?.id || ""),
  name: profile?.HoTen || profile?.ho_ten || profile?.account_info?.username || profile?.username || "",
  ngaySinh: profile?.NgaySinh || "",
  gioiTinh: profile?.GioiTinh || "",
});

const normalizeBodyIndexRecord = (record, index) => ({
  ...record,
  id: Number(record?.id) || undefined,
  Id: String(record?.Id || record?.id || `${record?.NgayTao || ""}-${index}`),
  PhamTramCo: record?.PhamTramCo ?? record?.PhanTramCo,
});

const calculateAge = (dateString) => {
  if (!dateString) return null;
  const dob = new Date(dateString);
  if (Number.isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }

  return age;
};


const ResultPage = () => {
  const { memberId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { role, currentUserId } = useAuth();
  const currentRole = String(role || "").toLowerCase();
  const stateMemberId = String(location.state?.memberId || "");
  const urlMemberId = String(memberId || "");
  const initialMemberId = stateMemberId || urlMemberId;

  const [selectedMember, setSelectedMember] = useState(initialMemberId);
  const [isViewingMemberResult, setIsViewingMemberResult] = useState(currentRole === "hoivien" || Boolean(initialMemberId));
  const [members, setMembers] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [addModalError, setAddModalError] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [pendingDeleteRecord, setPendingDeleteRecord] = useState(null);
  const [selfProfile, setSelfProfile] = useState(null);

  useEffect(() => {
    if (currentRole === "hoivien") {
      setIsViewingMemberResult(true);
      setSelectedMember(String(currentUserId || ""));
    }
  }, [currentRole, currentUserId]);

  useEffect(() => {
    const fetchSelfProfile = async () => {
      if (currentRole !== "hoivien") {
        setSelfProfile(null);
        return;
      }

      try {
        const response = await profileApi.getProfile();
        setSelfProfile(normalizeSelfProfile(response?.data || {}));
      } catch (error) {
        console.error("Lỗi khi lấy hồ sơ hội viên:", error);
        setSelfProfile(null);
      }
    };

    fetchSelfProfile();
  }, [currentRole]);

  useEffect(() => {
    if (currentRole === "hoivien") return;
    if (!stateMemberId) return;

    setSelectedMember(stateMemberId);
    setIsViewingMemberResult(true);
  }, [currentRole, stateMemberId]);

  useEffect(() => {
    if (currentRole === "hoivien") return;
    if (!urlMemberId) return;

    setSelectedMember(urlMemberId);
    setIsViewingMemberResult(true);
  }, [currentRole, urlMemberId]);

  const targetUserId = useMemo(() => {
    if (currentRole === "hoivien") {
      return String(currentUserId || "");
    }

    const selectedByAccountId = members.find((member) => String(member.id) === String(selectedMember));
    if (selectedByAccountId) {
      return String(selectedByAccountId.id);
    }

    // Fallback cho trường hợp FE truyền nhầm hoi_vien_id thay vì account user_id.
    const selectedByHoiVienId = members.find((member) => String(member.hoi_vien_id) === String(selectedMember));
    if (selectedByHoiVienId) {
      return String(selectedByHoiVienId.id);
    }

    return String(selectedMember || "");
  }, [currentRole, currentUserId, members, selectedMember]);

  useEffect(() => {
    const fetchMembers = async () => {
      if (currentRole === "hoivien") {
        setMembers([]);
        return;
      }

      try {
        const response = await profileApi.getHoiVienList();
        const rawMembers = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.results)
            ? response.data.results
            : [];
        setMembers(rawMembers.map(normalizeMember).filter((member) => member.id));
      } catch (error) {
        console.error("Lỗi khi lấy danh sách hội viên:", error);
        setMembers([]);
      }
    };

    fetchMembers();
  }, [currentRole]);

  useEffect(() => {
    if (currentRole === "hoivien") return;

    if (!selectedMember) {
      setIsViewingMemberResult(false);
    }
  }, [currentRole, selectedMember]);

  useEffect(() => {
    const loadBodyIndex = async () => {
      if (currentRole !== "hoivien" && !isViewingMemberResult) {
        setResults([]);
        setPageError("");
        return;
      }

      if (!targetUserId) {
        setResults([]);
        setPageError("");
        return;
      }

      setIsLoading(true);
      setPageError("");

      try {
        const response = await bodyIndexApi.getBodyIndexByUserId(targetUserId);
        const payload = response?.data || {};
        const rawResults = Array.isArray(payload?.results) ? payload.results : [];

        const sortedResults = [...rawResults].sort((a, b) => {
          const dateA = new Date(a.NgayTao || 0).getTime();
          const dateB = new Date(b.NgayTao || 0).getTime();
          return dateB - dateA;
        });

        setResults(sortedResults.map(normalizeBodyIndexRecord));
      } catch (error) {
        console.error("Lỗi khi lấy chỉ số cơ thể:", error);
        setPageError(error?.response?.data?.detail || "Không thể tải dữ liệu chỉ số cơ thể.");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBodyIndex();
  }, [targetUserId, currentRole, isViewingMemberResult]);

  const memberResults = useMemo(() => {
    return [...results].sort((a, b) => new Date(b.NgayTao || 0) - new Date(a.NgayTao || 0));
  }, [results]);

  const selectedMemberProfile = useMemo(() => {
    if (currentRole === "hoivien") return null;

    return (
      members.find((member) => String(member.id) === String(selectedMember)) ||
      members.find((member) => String(member.hoi_vien_id) === String(selectedMember)) ||
      null
    );
  }, [currentRole, members, selectedMember]);

  const latestResult = memberResults[0];
  const historyResults = memberResults.slice(1);

  const currentMemberData = useMemo(() => {
    const selected = currentRole === "hoivien" ? selfProfile : selectedMemberProfile;
    if (!selected) return null;

    return {
      id: selected.id,
      accountId: selected.accountId,
      hoiVienId: selected.hoi_vien_id,
      name: selected.name,
      age: calculateAge(selected.ngaySinh),
      gender: selected.gioiTinh,
    };
  }, [currentRole, selfProfile, selectedMemberProfile]);

  const targetHoiVienId = useMemo(() => {
    if (currentRole === "hoivien") {
      return String(selfProfile?.hoi_vien_id || selfProfile?.id || "");
    }

    if (selectedMemberProfile?.hoi_vien_id) {
      return String(selectedMemberProfile.hoi_vien_id);
    }

    // Fallback: nếu selectedMember là số nhưng chưa map được, thử coi như hoi_vien_id.
    return /^\d+$/.test(String(selectedMember || "")) ? String(selectedMember) : "";
  }, [currentRole, currentUserId, selfProfile, selectedMemberProfile, selectedMember]);

  // Xử lý lưu kết quả mới
  const handleAddResult = async (formData) => {
    if (!targetHoiVienId) {
      setAddModalError("Không xác định được hội viên để lưu chỉ số cơ thể.");
      return false;
    }

    try {
      setAddModalError("");
      const response = await bodyIndexApi.createBodyIndex({
        hoi_vien_id: Number(targetHoiVienId),
        can_nang: Number(formData.CanNang),
        chieu_cao: Number(formData.ChieuCao),
        vong_bung: Number(formData.VongBung),
        vong_mong: Number(formData.VongMong),
      });

      const payload = response?.data || {};
      const created = normalizeBodyIndexRecord(payload?.data || {}, 0);
      setResults((prev) => {
        const next = [created, ...prev];
        next.sort((a, b) => new Date(b.NgayTao || 0) - new Date(a.NgayTao || 0));
        return next;
      });
      setIsAddOpen(false);
      setAddModalError("");
      return true;
    } catch (error) {
      console.error("Lỗi khi tạo chỉ số cơ thể:", error);
      const backendData = error?.response?.data;
      const firstFieldError = backendData && typeof backendData === "object"
        ? Object.values(backendData).find((value) => Array.isArray(value) && value.length > 0)?.[0]
        : "";
      const directMessage = typeof backendData === "string" ? backendData : "";
      setAddModalError(backendData?.detail || firstFieldError || directMessage || error?.message || "Không thể lưu chỉ số cơ thể.");
      return false;
    }
  };

  const handleDeleteResult = async (record) => {
    const recordId = Number(record?.id || record?.Id);
    if (!Number.isInteger(recordId) || recordId <= 0) {
      setPageError("Không xác định được bản ghi để xóa.");
      return;
    }

    try {
      await bodyIndexApi.deleteBodyIndex(recordId);
      setResults((prev) => prev.filter((item) => Number(item?.id || item?.Id) !== recordId));
      setPageError("");
    } catch (error) {
      console.error("Lỗi khi xóa chỉ số cơ thể:", error);
      const backendData = error?.response?.data;
      const directMessage = typeof backendData === "string" ? backendData : "";
      setPageError(backendData?.detail || directMessage || "Không thể xóa bản ghi chỉ số cơ thể.");
    }
  };

  const handleRequestDeleteResult = (record) => {
    setPendingDeleteRecord(record || null);
  };

  const handleConfirmDeleteResult = async () => {
    if (!pendingDeleteRecord) return;
    await handleDeleteResult(pendingDeleteRecord);
    setPendingDeleteRecord(null);
  };

  const canDeleteResult = currentRole === "hlv";

  if (currentRole !== "hoivien" && !isViewingMemberResult) {
    return (
      <ResultMemberSelector 
        selectedMember={selectedMember} 
        onSelect={setSelectedMember} 
        onView={() => {
          if (!selectedMember) return;
          setIsViewingMemberResult(true);
        }} 
        members={members} 
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full p-4 font-figtree">
      <ResultHeader 
        role={currentRole} 
        latestDate={latestResult?.NgayTao}
        onAddClick={() => setIsAddOpen(true)}
        onBack={currentRole !== "hoivien" ? () => {
          setIsViewingMemberResult(false);
          setPageError("");
        } : undefined}
      />

      {isLoading && (
        <div className="bg-white p-4 text-center text-slate-500 border border-slate-100 rounded-2xl shadow-sm">
          Đang tải dữ liệu chỉ số cơ thể...
        </div>
      )}

      {!isLoading && pageError && (
        <div className="bg-red-50 p-4 text-center text-red-600 border border-red-100 rounded-2xl shadow-sm">
          {pageError}
        </div>
      )}

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

      <ResultLatest latestResult={latestResult} onDeleteClick={canDeleteResult ? handleRequestDeleteResult : undefined} />
      
      <ResultHistory historyResults={historyResults} onDeleteClick={canDeleteResult ? handleRequestDeleteResult : undefined} />

      {currentMemberData && (
        <ResultModals 
          isAddOpen={isAddOpen} 
          setIsAddOpen={(open) => {
            setIsAddOpen(open);
            if (!open) {
              setAddModalError("");
            }
          }}
          memberData={currentMemberData}
          addError={addModalError}
          handleAddResult={handleAddResult}
        />
      )}

      <DeleteConfirmModal
        open={Boolean(pendingDeleteRecord)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteRecord(null);
          }
        }}
        onConfirm={handleConfirmDeleteResult}
      />
    </div>
  );
};

export default ResultPage;