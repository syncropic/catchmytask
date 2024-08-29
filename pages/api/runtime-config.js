// pages/api/runtime-config.js
export default function handler(req, res) {
  res.status(200).json({
    API_URL: String(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"),
    API_REQUESTS_URL: String(
      process.env.NEXT_PUBLIC_API_REQUESTS_URL || "http://localhost:8000"
    ),
    DOMAIN_URL: String(
      process.env.NEXT_PUBLIC_DOMAIN_URL ||
        "https://stormy.reports.snowstormtech.com"
    ),
    APP_NAME: String(process.env.NEXT_PUBLIC_APP_NAME || "catchmytask"),
  });
}
