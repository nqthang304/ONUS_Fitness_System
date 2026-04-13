import axiosClient from './axiosClient';

const scheduleApi = {
    // Lấy lịch tập - tự động phân quyền theo role (hoivien/hlv)
    getLichTap: () => {
        return axiosClient.get('/api/lich-tap/');
    },
    // Tạo lịch tập mới (chỉ HLV)
    createLichTap: (payload) => {
        return axiosClient.post('/api/lich-tap/create/', payload);
    },
    // Xóa lịch tập theo id (chỉ HLV của lịch đó)
    deleteLichTap: (scheduleId) => {
        return axiosClient.delete(`/api/lich-tap/delete/${scheduleId}/`);
    },
};

export default scheduleApi;
