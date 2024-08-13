// config.js
const API_URL =
  process.env.NEXT_PUBLIC_CMT_API_BASEURL || "http://localhost:8000";
const API_REQUESTS_URL =
  process.env.NEXT_PUBLIC_CMT_API_REQUESTS_BASEURL || "http://localhost:81";

export default {
  API_URL,
  API_REQUESTS_URL,
};
