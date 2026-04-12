import axiosClient from './axiosClient';

const profileApi = {
    // Hàm lấy thông tin hồ sơ theo chính mình hoặc theo id/username được truyền vào
    getProfile: (params = {}) => {
        return axiosClient.get('/api/profile/', { params });
    },
    changePassword: (oldPassword, newPassword, confirmPassword) => {
        return axiosClient.post('/api/change-password/', { 
            old_password: oldPassword, 
            new_password: newPassword, 
            confirm_password: confirmPassword 
        });
    },
    getHoiVienList: () => {
        return axiosClient.get('/api/trainer/my-members/');
    },
    getAllAccounts: () => {
        return axiosClient.get('/api/accounts/');
    },
    updateAccountStatus: (userId, isActive) => {
        return axiosClient.patch(`/api/accounts/${userId}/status/`, { is_active: isActive });
    }
};

export default profileApi;