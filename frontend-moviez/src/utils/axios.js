import axios from "axios";

const axiosInstance = axios.create({
    baseURL: 'https://moviz-backend-theta.vercel.app/api',
});


export default axiosInstance;