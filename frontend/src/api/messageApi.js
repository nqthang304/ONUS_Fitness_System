import axiosClient from './axiosClient';

const messageApi = {
    getConversations: () => {
        return axiosClient.get('/api/messages/conversations/');
    },
    getMessages: (partnerId) => {
        return axiosClient.get('/api/messages/', {
            params: { partner_id: partnerId },
        });
    },
    sendMessage: (receiverId, text) => {
        return axiosClient.post('/api/messages/', {
            receiver_id: receiverId,
            text,
        });
    },
};

export default messageApi;
