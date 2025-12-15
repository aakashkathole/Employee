import apiClient from '../api/apiClient';

export const loginUser = async (email, password) => {
    try {
        const response = await apiClient.post('/userLogin', { email, password });
        console.log("API RESPONSE:", response.data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Something went wrong' };
    }
};