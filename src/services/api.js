import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // IMPORTANT for refresh token cookies
});

export default api;
