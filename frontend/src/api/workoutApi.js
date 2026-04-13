import axiosClient from './axiosClient';

const workoutApi = {
    // Lấy dữ liệu bài tập theo user_id (đã phân quyền ở backend)
    getWorkoutByUserId: (userId) => {
        return axiosClient.get(`/api/bai-tap/user/${userId}/`);
    },
};

export default workoutApi;
