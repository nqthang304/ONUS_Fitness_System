import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { DB_TAI_KHOAN, DB_HOI_VIEN, DB_HLV, getMergedAccounts } from "@/features/adminAccount/mockData";
import { AccountTable } from "@/features/adminAccount/accountTable";
import { AccountModal } from "@/features/adminAccount/accountModal";
import { ConfirmActionModal } from "@/features/adminAccount/actionModals";

const AdminAccountPage = () => {
  // States dữ liệu
  const [accounts, setAccounts] = useState(getMergedAccounts(DB_TAI_KHOAN, DB_HOI_VIEN, DB_HLV));
  const [searchQuery, setSearchQuery] = useState("");

  // States Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  
  // State target cho thao tác
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Lọc danh sách HLV để truyền vào Dropdown Select
  const hlvList = useMemo(() => {
    return accounts.filter(acc => acc.role === "HLV").map(h => ({ id: h.id, name: h.name }));
  }, [accounts]);

  // Lọc tìm kiếm
  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => 
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      acc.phone.includes(searchQuery)
    );
  }, [accounts, searchQuery]);

  // Handlers mở modal
  const handleOpenAdd = () => { setSelectedAccount(null); setIsFormOpen(true); };
  const handleOpenEdit = (acc) => { setSelectedAccount(acc); setIsFormOpen(true); };
  const handleOpenStatus = (acc) => { setSelectedAccount(acc); setIsStatusOpen(true); };
  const handleOpenDelete = (acc) => { setSelectedAccount(acc); setIsDeleteOpen(true); };

  // Handlers thực thi logic (Tương tác BE sau này)
  const handleSaveAccount = (formData) => {
    // Nếu có selectedAccount -> Cập nhật. Nếu không -> Thêm mới.
    console.log("Saving data to API:", formData);
    setIsFormOpen(false);
  };

  const handleConfirmStatus = () => {
    if (!selectedAccount) return;

    console.log("Toggle status for API:", selectedAccount.id);
    setAccounts(prev =>
      prev.map(acc =>
        acc.id === selectedAccount.id
          ? { ...acc, status: acc.status === "Hoạt động" ? "Bị khóa" : "Hoạt động" }
          : acc
      )
    );
    setIsStatusOpen(false);
    setSelectedAccount(null);
  };

  const handleConfirmDelete = () => {
    if (!selectedAccount) return;

    console.log("Delete API:", selectedAccount.id);
    setAccounts(prev => prev.filter(acc => acc.id !== selectedAccount.id));
    setIsDeleteOpen(false);
    setSelectedAccount(null);
  };

  return (
    <div className="flex flex-col gap-3 w-full p-4 font-figtree">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý tài khoản</h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý danh sách hội viên và nhân viên</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6 h-11" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-2" /> Thêm tài khoản
        </Button>
      </header>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <Input 
          placeholder="Tìm kiếm theo tên hoặc số điện thoại..." 
          className="pl-12 h-12 bg-white rounded-2xl border-slate-100 shadow-sm text-[15px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Bảng Dữ liệu */}
      <AccountTable 
        data={filteredAccounts} 
        onEdit={handleOpenEdit} 
        onToggleStatus={handleOpenStatus} 
        onDelete={handleOpenDelete} 
      />

      {/* Modal Form Thêm/Sửa */}
      <AccountModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSave={handleSaveAccount} 
        initialData={selectedAccount}
        hlvList={hlvList}
      />

      {/* Modals Xác nhận */}
      <ConfirmActionModal 
        isOpen={isStatusOpen} 
        onClose={() => setIsStatusOpen(false)} 
        onConfirm={handleConfirmStatus} 
        title={`Xác nhận thay đổi trạng thái hoạt động của ${selectedAccount?.name}?`}
        confirmText={'Xác nhận'}
        isDestructive={false}
      />

      <ConfirmActionModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={handleConfirmDelete} 
        title={`Xác nhận xoá tài khoản ${selectedAccount?.name}?`}
        confirmText="Xác nhận"
        isDestructive={true} 
      />
    </div>
  );
};

export default AdminAccountPage;