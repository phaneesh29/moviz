import axiosInstance from "../utils/axios.js";

export const searchController = async (req, res) => {
    const query = req.query.query || req.body?.query;
    const page = Number(req.query.page || req.body?.page) || 1;
    const isAdult = (req.query.adult || req.body?.isAdult) === "true" || (req.query.adult || req.body?.isAdult) === true;

    if (!query) return res.status(400).json({ message: "Query is required" });
    if (query.length < 2) return res.status(400).json({ message: "Query must be at least 2 characters" });

    const params = {
        query,
        page: page > 0 ? page : 1,
        include_adult: isAdult,
    };

    const results = await axiosInstance.get("/search/multi", { params });
    res.status(200).json({ results: results.data });
};