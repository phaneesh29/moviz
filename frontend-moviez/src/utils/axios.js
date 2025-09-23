import axios from "axios";

const axiosInstance = axios.create({
    baseURL: 'https://vidoza-backend.vercel.app/api',
});


export default axiosInstance;