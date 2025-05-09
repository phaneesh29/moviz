import express from "express"
import "dotenv/config"
import cookieParser from "cookie-parser"
import cors from "cors"
import { ORIGIN_DOMAIN } from "../constant.js"
import searchRoute from "../routes/search.route.js"
import movieRoute from "../routes/movie.route.js"

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(cors({
    origin: ORIGIN_DOMAIN,
    credentials: true
}));

app.use("/api/search", searchRoute)
app.use("/api/movie", movieRoute)

app.get("/api/health", (req, res) => {
    return res.status(200).json({ message: "Serverless API is healthy" });
});

export default app;