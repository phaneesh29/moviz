import axiosInstance from "../utils/axios.js";

export const searchController = async (req, res) => {
    try {
        const { query, page, isAdult } = req.body

        if (!query) return res.status(400).json({ message: "Query is required" });
        if (query.length < 2) return res.status(400).json({ message: "Query must be at least 2 characters" });

        const params = {
            query: query,
            page: page > 0 ? page : 1,
            include_adult: isAdult ? isAdult : false,
        }

        const results = await axiosInstance.get("/search/multi", { params })


        res.status(200).json({ results: results.data, });
    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).json({ message: error.response.data.status_message });
        } else {
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}