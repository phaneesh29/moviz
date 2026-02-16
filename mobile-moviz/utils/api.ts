import axios from "axios";

const api = axios.create({
  baseURL: "https://vidoza-backend.vercel.app/api",
  timeout: 15000,
});

export default api;
