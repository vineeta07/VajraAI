require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");
const analyzeRoutes = require("./routes/analyze");
const dashboardRoutes = require("./routes/dashboard");
const anomalyRoutes = require("./routes/anomlies");
const heatmapRoutes = require("./routes/heatmap");

const { authenticate, authorize } = require("./middlewares/authMiddleware");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`);
})

// CLIENT_ORIGIN: comma-separated list of allowed web origins in production.
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3039,http://127.0.0.1:3039')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/anomalies", anomalyRoutes);
app.use("/api/heatmap", heatmapRoutes);
app.use("/api/vendors", require("./routes/vendors"));
app.use("/api/status", require("./routes/status"));

app.get("/", (req, res) => {
    res.json({ message: "VajraAI backend running..." });
});


// Anything a route didn't catch (usually a failed database query) becomes a
// JSON error instead of an HTML page, so the client can show the reason.
app.use((err, req, res, next) => {
    console.error(`${req.method} ${req.originalUrl} failed:`, err.message);
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({ error: "Server error", detail: err.message });
});
