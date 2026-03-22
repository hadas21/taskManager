import { ConflictError, ValidationError } from "./errors.js";

const allowedPriorities = new Set(["low", "medium", "high", "critical"]);
const allowedStatuses = new Set(["OPEN", "IN_PROGRESS", "BLOCKED", "DONE"]);

export function validateTaskPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new ValidationError("Payload must be a valid object");
  }

  const { taskId, status, priority, expectedVersion } = payload;

  if (!taskId || typeof taskId !== "string") {
    throw new ValidationError("taskId is required and must be a string");
  }

  if (!status || typeof status !== "string") {
    throw new ValidationError("status is required and must be a string");
  }

  if (!allowedStatuses.has(status)) {
    throw new ValidationError("status must be one of: OPEN, IN_PROGRESS, BLOCKED, DONE");
  }

  if (!allowedPriorities.has(priority)) {
    throw new ValidationError("priority must be one of: low, medium, high, critical");
  }

  if (expectedVersion !== undefined && (!Number.isInteger(expectedVersion) || expectedVersion < 0)) {
    throw new ValidationError("expectedVersion must be a non-negative integer");
  }
}

export function processTaskUpdate(payload, repository, now = new Date().toISOString()) {
  validateTaskPayload(payload);

  const existing = repository.getById(payload.taskId);

  if (existing && payload.expectedVersion !== undefined && existing.version !== payload.expectedVersion) {
    throw new ConflictError("Version conflict: task was updated by another worker");
  }

  const updatedTask = {
    id: payload.taskId,
    status: payload.status,
    priority: payload.priority,
    location: payload.location ?? existing?.location ?? "UNKNOWN",
    lastUpdatedAt: now,
    version: (existing?.version ?? 0) + 1
  };

  return repository.upsert(updatedTask);
}
