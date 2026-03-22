import test from "node:test";
import assert from "node:assert/strict";
import { processTaskUpdate } from "../src/services/taskProcessor.js";

function createMemoryRepo() {
  const map = new Map();
  return {
    getById: (id) => map.get(id) ?? null,
    upsert: (task) => {
      map.set(task.id, task);
      return task;
    }
  };
}

test("processTaskUpdate stores a valid task and increments version", () => {
  const repo = createMemoryRepo();

  const created = processTaskUpdate(
    { taskId: "T-100", status: "IN_PROGRESS", priority: "critical", location: "Gate-A" },
    repo,
    "2026-03-22T00:00:00.000Z"
  );

  assert.equal(created.version, 1);
  assert.equal(created.id, "T-100");
  assert.equal(repo.getById("T-100").status, "IN_PROGRESS");
});

test("processTaskUpdate throws on optimistic-lock version conflict", () => {
  const repo = createMemoryRepo();

  processTaskUpdate(
    { taskId: "T-200", status: "OPEN", priority: "high" },
    repo,
    "2026-03-22T00:00:00.000Z"
  );

  assert.throws(
    () =>
      processTaskUpdate(
        { taskId: "T-200", status: "DONE", priority: "high", expectedVersion: 0 },
        repo,
        "2026-03-22T00:05:00.000Z"
      ),
    /Version conflict/
  );
});


test("processTaskUpdate throws on invalid status values", () => {
  const repo = createMemoryRepo();

  assert.throws(
    () => processTaskUpdate({ taskId: "T-300", status: "WAITING", priority: "low" }, repo),
    /status must be one of/
  );
});
