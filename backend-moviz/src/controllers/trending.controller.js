import axiosInstance from "../utils/axios.js";

export const getTrendingMoviesController = async (req, res) => {
    const results = await axiosInstance.get(`/trending/movie/day`);
    res.status(200).json({ results: results.data });
};

export const getTrendingTVController = async (req, res) => {
    const results = await axiosInstance.get(`/trending/tv/day`);
    res.status(200).json({ results: results.data });
};