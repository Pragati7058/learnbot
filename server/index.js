require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const app = express();

// ✅ Fix proxy issue (Render)
app.set("trust proxy", 1);

// ✅ Connect database
connectDB();

// ✅ Allowed origins
const allowedOrigins = [
    "http://localhost:5173",
    process.env.CLIENT_URL
];

// ✅ CORS options (FINAL FIX)
const corsOptions = {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};

// ✅ Apply CORS
app.use(cors(corsOptions));

// ✅ Handle preflight correctly
app.options("*", cors(corsOptions));

// ✅ Middleware
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

// ✅ Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: "Too many requests, slow down",
});
app.use("/api/", limiter);

// ✅ Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/history", require("./routes/history"));

// ✅ Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ✅ 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// ✅ Error handler
app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    res.status(500).json({ message: "Internal server error" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 LearnBot server running on port ${PORT}`);
});