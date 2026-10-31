// backend/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const studentRoutes = require("./routes/studentRoutes");
const mcpRoutes = require("./routes/mcpRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

/* ------------------------------------------------------------------ */
/* Database                                                            */
/* ------------------------------------------------------------------ */
connectDB();

/* ------------------------------------------------------------------ */
/* CORS                                                                */
/* ------------------------------------------------------------------ */
const rawOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow Postman / curl (no origin) and whitelisted origins
    if (!origin) return callback(null, true);
    if (rawOrigins.includes(origin) || rawOrigins.includes("*")) {
      return callback(null, true);
    }
    console.warn(`[CORS] Blocked origin: ${origin}`);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* ------------------------------------------------------------------ */
/* Body parsing                                                        */
/* ------------------------------------------------------------------ */
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Student Information Management API",
    docs: "/api/health",
  });
});

app.use("/api", studentRoutes);
app.use("/mcp", mcpRoutes);

/* ------------------------------------------------------------------ */
/* Error handling (must be last)                                       */
/* ------------------------------------------------------------------ */
app.use(notFound);
app.use(errorHandler);

/* ------------------------------------------------------------------ */
/* Start server                                                        */
/* ------------------------------------------------------------------ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[SERVER] Listening on port ${PORT}`);
  console.log(`[SERVER] Allowed origins: ${rawOrigins.join(", ")}`);
});