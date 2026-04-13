import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MemberSearch from "@/features/memberPage/MemberSearch";
import MemberTable from "@/features/memberPage/MemberTable";
import profileApi
 from "@/api/profileApi";
const MemberPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [members, setMembers] = useState([]);

    const normalizeMember = (member) => ({
        id: String(member?.account_info?.id || member?.id || ""),
        name: member?.HoTen || "",
        phone: member?.account_info?.username || "",
    });

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await profileApi.getHoiVienList();
                console.log("Danh sách hội viên từ API:", response.data);
                const normalized = Array.isArray(response.data)
                    ? response.data.map(normalizeMember)
                    : [];
                setMembers(normalized);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách hội viên:", error);
            }
        };
        fetchMembers();
    }, []);
    // Logic lọc dữ liệu
    const filteredData = members.filter(m =>
        String(m.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(m.phone || "").includes(searchTerm)
    );

    // Xử lý khi nhấn nút bất kỳ
    const handleAction = (id, feature) => {
        if (feature === 'ho-so-hoi-vien' && id) {
            navigate('/ho-so-hoi-vien', { state: { memberId: String(id) } });
            return;
        }

        if (feature === 'lich-an' && id) {
            navigate('/lich-an', { state: { memberId: String(id) } });
            return;
        }

        if (feature === 'bai-tap' && id) {
            navigate('/bai-tap', { state: { memberId: String(id) } });
            return;
        }

        if (feature === 'bai-tap') {
            navigate('/bai-tap');
            return;
        }

        if (!id) {
            navigate(`/${feature}`);
            return;
        }
        navigate(`/${feature}/${id}`);
    };

    return (
        <div className="flex flex-col gap-3 w-full p-4">
            <header className="flex flex-col gap-1 pb-4">
                <h2 className="text-2xl font-bold text-slate-900">Danh sách hội viên</h2>
                <p className="text-slate-600">Quản lý hội viên do bạn phụ trách</p>
            </header>

            {/* Ô Tìm kiếm riêng biệt */}
            <MemberSearch value={searchTerm} onChange={setSearchTerm} />

            {/* Danh sách riêng biệt */}
            <MemberTable data={filteredData} onAction={handleAction} />
        </div>
    );
};

export default MemberPage;