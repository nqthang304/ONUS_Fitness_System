import axiosClient from './axiosClient';

const authApi = {
    login: (username, password) => {
        const url = '/api/login/';
        return axiosClient.post(url, { username, password });
    }
};

export default authApi;