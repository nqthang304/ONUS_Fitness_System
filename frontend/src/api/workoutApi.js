import axiosClient from './axiosClient';

const workoutApi = {
    // Lấy dữ liệu bài tập theo user_id (đã phân quyền ở backend)
    getWorkoutByUserId: (userId) => {
        return axiosClient.get(`/api/bai-tap/user/${userId}/`);
    },
    createWorkoutDay: (payload) => {
        return axiosClient.post('/api/bai-tap/create-day/', payload);
    },
    createWorkoutExercise: (payload) => {
        return axiosClient.post('/api/bai-tap/create-exercise/', payload);
    },
    deleteWorkoutDay: (baitapId) => {
        return axiosClient.delete(`/api/bai-tap/delete-day/${baitapId}/`);
    },
    deleteWorkoutExercise: (detailId) => {
        return axiosClient.delete(`/api/bai-tap/delete-exercise/${detailId}/`);
    },
};

export default workoutApi;
