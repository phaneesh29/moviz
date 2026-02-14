import express from "express"
import "dotenv/config"
import cookieParser from "cookie-parser"
import cors from "cors"
import helmet from "helmet"
import { ORIGIN_DOMAIN } from "../constant.js"
import errorHandler from "../utils/errorHandler.js"
import searchRoute from "../routes/search.route.js"
import movieRoute from "../routes/movie.route.js"
import peopleRoute from "../routes/people.route.js"
import trendingRoute from "../routes/trending.route.js"
import tvRoute from "../routes/tv.route.js"

const app = express();

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(cors({
    origin: ORIGIN_DOMAIN,
    credentials: true
}));

app.use("/api/search", searchRoute)
app.use("/api/movie", movieRoute)
app.use("/api/people", peopleRoute)
app.use("/api/trending", trendingRoute)
app.use("/api/tv", tvRoute)

app.get("/api/health", (req, res) => {
    return res.status(200).json({ message: "Serverless API is healthy" });
});

app.use(errorHandler);

export default app;