import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

// Load environment variables FIRST before anything else
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ──────────────────────────────────────
app.use(cors());                        // allow frontend requests
app.use(express.json());                // parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // parse form data

// ── Health check route ──────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "SnapShare API is running 🚀" });
});

app.use("/api/auth", authRoutes); // Auth routes

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({ message: err.message });
});

// ── Start server ────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});