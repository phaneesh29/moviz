import axiosInstance from "../utils/axios.js";

export const getPeopleController = async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) return res.status(400).json({ message: "A valid numeric ID is required" });
    const results = await axiosInstance.get(`/person/${id}`);
    res.status(200).json({ results: results.data });
};