import axiosInstance from "../utils/axios.js";

export const getMovieController = async (req, res) => {
    const { id } = req.params
    try {
        if (!id) return res.status(400).json({ message: "ID is required" });
        const results = await axiosInstance.get(`/movie/${id}`)
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
    const { id } = req.params
    try {
        if (!id) return res.status(400).json({ message: "ID is required" });
        const results = await axiosInstance.get(`/movie/${id}/credits`)
        res.status(200).json({ results: results.data, });

    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).json({ message: error.response.data.status_message });
        } else {
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}
export const getSimilarController = async (req, res) => {
    const { id } = req.params
    try {
        if (!id) return res.status(400).json({ message: "ID is required" });
        const results = await axiosInstance.get(`/movie/${id}/similar`)
        res.status(200).json({ results: results.data, });

    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).json({ message: error.response.data.status_message });
        } else {
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}