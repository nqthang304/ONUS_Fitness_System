import axiosClient from "./axiosClient";

const bodyIndexApi = {
    getBodyIndexByUserId: (userId) => {
        return axiosClient.get(`/api/chi-so-co-the/user/${userId}/`);
    },
    createBodyIndex: (payload) => {
        return axiosClient.post('/api/chi-so-co-the/create/', payload);
    },
    deleteBodyIndex: (bodyIndexId) => {
        return axiosClient.delete(`/api/chi-so-co-the/delete/${bodyIndexId}/`);
    },
};

export default bodyIndexApi;