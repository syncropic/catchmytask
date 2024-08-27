// pages/api/runtime-config.js
export default function handler(req, res) {
  res.status(200).json({
    API_URL: process.env.NEXT_PUBLIC_API_URL || "https://api.catchmytask.com",
    API_REQUESTS_URL:
      process.env.NEXT_PUBLIC_API_REQUESTS_URL || "https://api.catchmytask.com",
  });
}
