import axiosClient from './axiosClient';

const authApi = {
    // Hàm đăng nhập
    login: (username, password) => {
        const url = '/api/login/';
        return axiosClient.post(url, { username, password });
    },
};

export default authApi;