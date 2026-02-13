import axios from "axios";
import { API_KEY } from "../constant.js";

const axiosInstance = axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    adapter: 'fetch',
    headers: {
        'Accept': 'application/json',
    },
    timeout: 15000,
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

// Retry on transient network errors (ECONNRESET, ETIMEDOUT, etc.)
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;
        const retryableErrors = ['ECONNRESET', 'ETIMEDOUT', 'ECONNABORTED', 'ERR_NETWORK'];
        if (
            config &&
            !config._retryCount &&
            (!error.response) &&
            retryableErrors.includes(error.code)
        ) {
            config._retryCount = 1;
            await new Promise((r) => setTimeout(r, 500));
            return axiosInstance(config);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;