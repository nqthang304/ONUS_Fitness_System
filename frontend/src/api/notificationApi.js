import axiosClient from './axiosClient';

const notificationApi = {
    getNotifications: () => {
        return axiosClient.get('/api/notifications/');
    },
    markAsRead: (detailId) => {
        return axiosClient.patch(`/api/notifications/${detailId}/read/`);
    },
    markAllAsRead: () => {
        return axiosClient.post('/api/notifications/read-all/');
    },
};

export default notificationApi;
