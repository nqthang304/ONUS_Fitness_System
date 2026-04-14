import axiosClient from './axiosClient';

const mealApi = {
    getMealByUserId: (userId) => {
        return axiosClient.get(`/api/lich-an/user/${userId}/`);
    },
    createMeal: (payload) => {
        return axiosClient.post('/api/lich-an/create-meal/', payload);
    },
    createMealFood: (payload) => {
        return axiosClient.post('/api/lich-an/create-food/', payload);
    },
    deleteMeal: (mealId) => {
        return axiosClient.delete(`/api/lich-an/delete-meal/${mealId}/`);
    },
    deleteMealFood: (detailId) => {
        return axiosClient.delete(`/api/lich-an/delete-food/${detailId}/`);
    },
};

export default mealApi;