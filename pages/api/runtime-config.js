// pages/api/runtime-config.js
export default function handler(req, res) {
  res.status(200).json({
    API_URL: String(
      process.env.NEXT_PUBLIC_API_URL || "https://api.catchmytask.com"
    ),
    API_REQUESTS_URL: String(
      process.env.NEXT_PUBLIC_API_REQUESTS_URL || "https://api.catchmytask.com"
    ),
    DOMAIN_URL: String(
      process.env.NEXT_PUBLIC_DOMAIN_URL ||
        "https://stormy.reports.snowstormtech.com"
    ),
  });
}
