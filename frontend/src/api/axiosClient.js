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
        const requestUrl = `${config.baseURL || ''}${config.url || ''}`;

        console.debug("[axios] request", {
            url: requestUrl,
            hasToken: Boolean(token),
        });
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        console.debug("[axios] authorization header", {
            url: requestUrl,
            authorization: config.headers?.Authorization || config.headers?.authorization || null,
        });
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
        if (error?.response?.status === 401) {
            console.error("Phiên đăng nhập hết hạn hoặc không hợp lệ!");
            
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);


export default axiosClient;