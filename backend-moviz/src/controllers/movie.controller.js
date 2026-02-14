import axiosInstance from "../utils/axios.js";

export const getMovieController = async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) return res.status(400).json({ message: "A valid numeric ID is required" });
    const results = await axiosInstance.get(`/movie/${id}`);
    res.status(200).json({ results: results.data });
};

export const getCreditController = async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) return res.status(400).json({ message: "A valid numeric ID is required" });
    const results = await axiosInstance.get(`/movie/${id}/credits`);
    res.status(200).json({ results: results.data });
};

export const getRecommendationsController = async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) return res.status(400).json({ message: "A valid numeric ID is required" });
    const results = await axiosInstance.get(`/movie/${id}/recommendations`);
    res.status(200).json({ results: results.data });
};

export const getLatestController = async (req, res) => {
    const results = await axiosInstance.get(`/movie/latest`);
    res.status(200).json({ results: results.data });
};

export const getVideosController = async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) return res.status(400).json({ message: "A valid numeric ID is required" });
    const results = await axiosInstance.get(`/movie/${id}/videos`);
    res.status(200).json({ results: results.data });
};