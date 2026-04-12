import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const status = error?.response?.status;
        const detail = error?.response?.data?.detail;
        const isMissingCredentials =
            status === 403 &&
            typeof detail === 'string' &&
            detail.toLowerCase().includes('authentication credentials were not provided');

        if (status === 401 || isMissingCredentials) {
            console.error("Phiên đăng nhập hết hạn hoặc không hợp lệ!");
            
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);


export default axiosClient;