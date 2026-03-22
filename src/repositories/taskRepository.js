const tasks = new Map();

export const taskRepository = {
  getById(taskId) {
    return tasks.get(taskId) ?? null;
  },

  upsert(task) {
    tasks.set(task.id, task);
    return task;
  },

  clear() {
    tasks.clear();
  }
};
