import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://vidoza-backend.vercel.app/api',
});


export default axiosInstance;