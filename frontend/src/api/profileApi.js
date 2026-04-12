import axiosClient from './axiosClient';

const profileApi = {
    // Hàm lấy thông tin hồ sơ theo chính mình hoặc theo id/username được truyền vào
    getProfile: (params = {}) => {
        return axiosClient.get('/api/profile/', { params });
    },
};

export default profileApi;