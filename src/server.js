import { app } from "./app.js";
import "./workers/taskWorker.js";

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`Urgent logistics API running on port ${PORT}`);
});
