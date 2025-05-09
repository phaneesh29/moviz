import axios from "axios";
import { API_KEY } from "../constant.js";

const axiosInstance = axios.create({
    baseURL: 'https://api.themoviedb.org/3',
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = API_KEY
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;