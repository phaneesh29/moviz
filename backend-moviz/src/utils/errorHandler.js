/**
 * Central error-handling middleware.
 * Catches errors thrown by asyncHandler-wrapped controllers.
 */
const errorHandler = (err, req, res, _next) => {
    // Forward TMDB / upstream API errors
    if (err.response) {
        return res.status(err.response.status).json({
            message: err.response.data?.status_message || "Upstream API error",
        });
    }

    // Generic server error
    const status = err.statusCode || 500;
    res.status(status).json({ message: err.message || "Internal server error" });
};

export default errorHandler;
