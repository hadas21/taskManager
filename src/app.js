import express from "express";
import rateLimit from "express-rate-limit";
import { taskRoutes } from "./routes/taskRoutes.js";
import { ConflictError, ValidationError } from "./services/errors.js";

export const app = express();

const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, try again in a minute." }
});

app.use(express.json());
app.use(apiRateLimiter);
app.use("/tasks", taskRoutes);

app.use((err, _req, res, _next) => {
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }

  if (err instanceof ConflictError) {
    return res.status(409).json({ error: err.message });
  }

  return res.status(500).json({ error: err.message ?? "Unknown error" });
});
