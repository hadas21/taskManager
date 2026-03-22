import express from "express";
import { enqueueTaskUpdate } from "../queue/taskQueue.js";
import { taskRepository } from "../repositories/taskRepository.js";

export const taskRoutes = express.Router();

taskRoutes.post("/update", async (req, res, next) => {
  try {
    const job = await enqueueTaskUpdate(req.body);
    res.status(202).json({
      message: "Task update accepted for async processing",
      jobId: job.id
    });
  } catch (error) {
    next(error);
  }
});

taskRoutes.get("/:taskId", (req, res) => {
  const task = taskRepository.getById(req.params.taskId);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  return res.json(task);
});
