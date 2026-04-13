import axiosClient from './axiosClient';

const authApi = {
    // Hàm đăng nhập
    login: (username, password) => {
        const url = '/api/login/';
        return axiosClient.post(url, { username, password });
    },
    // Hàm lấy thông tin hồ sơ theo chính mình hoặc theo id/username được truyền vào
    getProfile: (params = {}) => {
        return axiosClient.get('/api/profile/', { params });
    },
};

export default authApi;