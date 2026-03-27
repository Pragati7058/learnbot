require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const app = express();

// ✅ Trust proxy (Render / production)
app.set("trust proxy", 1);

// ✅ Connect DB
connectDB();

// ✅ CORS CONFIG (safe + production ready)
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (Postman, mobile apps)
        if (!origin) return callback(null, true);

        // Allow localhost
        if (origin === "http://localhost:5173") {
            return callback(null, true);
        }

        // Allow ALL Vercel deployments
        if (origin && origin.includes("vercel.app")) {
            return callback(null, true);
        }

        // Block others safely (no crash)
        return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};

// ✅ Apply CORS
app.use(cors(corsOptions));

// ✅ Middleware
app.use(express.json());
app.use(morgan("dev"));

// ✅ Debug logs only in development
if (process.env.NODE_ENV !== "production") {
    app.use((req, res, next) => {
        console.log("Incoming:", req.method, req.url);
        next();
    });
}

// ✅ Rate limiting (API protection)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 200,
    message: "Too many requests, please try again later"
});

app.use("/api/", limiter);

// ✅ Root route (fix 404 on "/")
app.get("/", (req, res) => {
    res.send("🚀 LearnBot API is running");
});

// ✅ Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/history", require("./routes/history"));

// ✅ Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

// ✅ 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// ✅ Error handler
app.use((err, req, res, next) => {
    console.error("ERROR:", err.message);

    res.status(500).json({
        message: err.message || "Internal Server Error"
    });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 LearnBot server running on port ${PORT}`);
});