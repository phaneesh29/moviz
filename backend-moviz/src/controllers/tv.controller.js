import axiosInstance from "../utils/axios.js";

export const getTvDetailsController = async (req, res) => {
    const { id } = req.params
    try {
        if (!id) return res.status(400).json({ message: "ID is required" });
        const results = await axiosInstance.get(`/tv/${id}`)
        res.status(200).json({ results: results.data, });

    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).json({ message: error.response.data.status_message });
        } else {
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}

export const getLatestController = async (req, res) => {
    try {
        const results = await axiosInstance.get(`/tv/latest`)
        res.status(200).json({ results: results.data, });

    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).json({ message: error.response.data.status_message });
        } else {
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}

export const getRecommendationsController = async (req, res) => {
    const { id } = req.params
    try {
        if (!id) return res.status(400).json({ message: "ID is required" });
        const results = await axiosInstance.get(`/tv/${id}/recommendations`)
        res.status(200).json({ results: results.data, });

    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).json({ message: error.response.data.status_message });
        } else {
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}

export const getSeasonDetailsController = async (req, res) => {
    const { series_id, season_num } = req.params
    try {
        if (!series_id || !season_num) return res.status(400).json({ message: "Series ID and Season Number are required" });
        const results = await axiosInstance.get(`/tv/${series_id}/season/${season_num}`)
        res.status(200).json({ results: results.data, });

    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).json({ message: error.response.data.status_message });
        } else {
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}

export const getEpisodeDetailsController = async (req, res) => {
    const { series_id, season_num, episode_num } = req.params
    try {
        if (!series_id || !season_num || !episode_num) return res.status(400).json({ message: "Series ID, Season Number and Episode Number are required" });
        const results = await axiosInstance.get(`/tv/${series_id}/season/${season_num}/episode/${episode_num}`)
        res.status(200).json({ results: results.data, });

    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).json({ message: error.response.data.status_message });
        } else {
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}

export const getCreditController = async (req, res) => {
    const { series_id, season_num, episode_num } = req.params
    try {
        if (!series_id || !season_num || !episode_num) return res.status(400).json({ message: "Series ID, Season Number and Episode Number are required" });
        const results = await axiosInstance.get(`/tv/${series_id}/season/${season_num}/episode/${episode_num}/credits`)
        res.status(200).json({ results: results.data, });

    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).json({ message: error.response.data.status_message });
        } else {
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}