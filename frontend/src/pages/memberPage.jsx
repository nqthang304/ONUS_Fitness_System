import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MemberSearch from "@/features/memberPage/MemberSearch";
import MemberTable from "@/features/memberPage/MemberTable";

const MemberPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    // Dữ liệu giả lập
    const [members] = useState([
        { id: 1, name: "Nguyễn Văn A", phone: "0901234567" },
        { id: 2, name: "Trần B", phone: "0909876543" },
        { id: 3, name: "Trần Thị C", phone: "0912345678" },
    ]);

    // Logic lọc dữ liệu
    const filteredData = members.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.phone.includes(searchTerm)
    );

    // Xử lý khi nhấn nút bất kỳ
    const handleAction = (id, feature) => {
        navigate(`/${feature}/${id}`);
    };

    return (
        <div className="flex flex-col gap-3 w-full p-4">
            <header className="flex flex-col gap-1">
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