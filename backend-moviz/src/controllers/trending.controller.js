import axiosInstance from "../utils/axios.js";

export const getTrendingMoviesController = async (req, res) => {
    const timeWindow = req.query.time_window === 'week' ? 'week' : 'day';
    const results = await axiosInstance.get(`/trending/movie/${timeWindow}`);
    res.status(200).json({ results: results.data });
};

export const getTrendingTVController = async (req, res) => {
    const timeWindow = req.query.time_window === 'week' ? 'week' : 'day';
    const results = await axiosInstance.get(`/trending/tv/${timeWindow}`);
    res.status(200).json({ results: results.data });
};