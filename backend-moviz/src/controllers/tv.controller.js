import axiosInstance from "../utils/axios.js";

const isValidNum = (v) => v && !isNaN(v);

export const getTvDetailsController = async (req, res) => {
    const { id } = req.params;
    if (!isValidNum(id)) return res.status(400).json({ message: "A valid numeric ID is required" });
    const results = await axiosInstance.get(`/tv/${id}`);
    res.status(200).json({ results: results.data });
};

export const getLatestController = async (req, res) => {
    const results = await axiosInstance.get(`/tv/latest`);
    res.status(200).json({ results: results.data });
};

export const getRecommendationsController = async (req, res) => {
    const { id } = req.params;
    if (!isValidNum(id)) return res.status(400).json({ message: "A valid numeric ID is required" });
    const results = await axiosInstance.get(`/tv/${id}/recommendations`);
    res.status(200).json({ results: results.data });
};

export const getSeasonDetailsController = async (req, res) => {
    const { series_id, season_num } = req.params;
    if (!isValidNum(series_id) || !isValidNum(season_num))
        return res.status(400).json({ message: "Valid Series ID and Season Number are required" });
    const results = await axiosInstance.get(`/tv/${series_id}/season/${season_num}`);
    res.status(200).json({ results: results.data });
};

export const getEpisodeDetailsController = async (req, res) => {
    const { series_id, season_num, episode_num } = req.params;
    if (!isValidNum(series_id) || !isValidNum(season_num) || !isValidNum(episode_num))
        return res.status(400).json({ message: "Valid Series ID, Season Number and Episode Number are required" });
    const results = await axiosInstance.get(`/tv/${series_id}/season/${season_num}/episode/${episode_num}`);
    res.status(200).json({ results: results.data });
};

export const getCreditController = async (req, res) => {
    const { series_id, season_num, episode_num } = req.params;
    if (!isValidNum(series_id) || !isValidNum(season_num) || !isValidNum(episode_num))
        return res.status(400).json({ message: "Valid Series ID, Season Number and Episode Number are required" });
    const results = await axiosInstance.get(`/tv/${series_id}/season/${season_num}/episode/${episode_num}/credits`);
    res.status(200).json({ results: results.data });
};

export const getVideosController = async (req, res) => {
    const { id } = req.params;
    if (!isValidNum(id)) return res.status(400).json({ message: "A valid numeric ID is required" });
    const results = await axiosInstance.get(`/tv/${id}/videos`);
    res.status(200).json({ results: results.data });
};