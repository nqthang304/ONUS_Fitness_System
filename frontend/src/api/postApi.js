import axiosClient from './axiosClient';

const postApi = {
    getPosts: () => {
        return axiosClient.get('/api/posts/');
    },
    createPost: (payload) => {
        return axiosClient.post('/api/posts/', payload);
    },
    updatePost: (postId, payload) => {
        return axiosClient.patch(`/api/posts/${postId}/`, payload);
    },
    addInteraction: (postId) => {
        return axiosClient.post(`/api/posts/${postId}/interactions/`);
    },
    removeInteraction: (postId) => {
        return axiosClient.delete(`/api/posts/${postId}/interactions/`);
    },
    getComments: (postId) => {
        return axiosClient.get(`/api/posts/${postId}/comments/`);
    },
    createComment: (postId, payload) => {
        return axiosClient.post(`/api/posts/${postId}/comments/`, payload);
    },
    deletePost: (postId) => {
        return axiosClient.delete(`/api/posts/${postId}/`);
    },
};

export default postApi;