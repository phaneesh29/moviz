import axiosInstance from "../utils/axios.js";

export const discoverMoviesController = async (req, res) => {
    const { genre, page = 1, sort_by = "popularity.desc", year } = req.query;
    const params = {
        page: Math.max(1, Number(page)),
        sort_by,
        include_adult: false,
    };
    if (genre) params.with_genres = genre;
    if (year) params.primary_release_year = year;
    const results = await axiosInstance.get("/discover/movie", { params });
    res.status(200).json({ results: results.data });
};

export const discoverTVController = async (req, res) => {
    const { genre, page = 1, sort_by = "popularity.desc", year } = req.query;
    const params = {
        page: Math.max(1, Number(page)),
        sort_by,
        include_adult: false,
    };
    if (genre) params.with_genres = genre;
    if (year) params.first_air_date_year = year;
    const results = await axiosInstance.get("/discover/tv", { params });
    res.status(200).json({ results: results.data });
};

export const getGenresController = async (req, res) => {
    const [movieGenres, tvGenres] = await Promise.all([
        axiosInstance.get("/genre/movie/list"),
        axiosInstance.get("/genre/tv/list"),
    ]);
    res.status(200).json({
        results: {
            movie: movieGenres.data.genres,
            tv: tvGenres.data.genres,
        }
    });
};
