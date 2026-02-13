import axiosInstance from "../utils/axios.js";

export const getTrendingMoviesController = async (req, res) => {
    try {
        const results = await axiosInstance.get(`/trending/movie/day`)
        res.status(200).json({ results: results.data, });

    } catch (error) {
        console.log(error);
        if (error.response) {
            return res.status(error.response.status).json({ message: error.response.data.status_message });
        } else {
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}

export const getTrendingTVController = async (req, res) => {
    try {
        const results = await axiosInstance.get(`/trending/tv/day`)
        res.status(200).json({ results: results.data, });

    } catch (error) {
        console.log(error);
        if (error.response) {
            return res.status(error.response.status).json({ message: error.response.data.status_message });
        } else {
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}