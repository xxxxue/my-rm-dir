import { parentPort } from "worker_threads";
import { deleteAsync } from "./utils.js";

parentPort?.on("message", async (data) => {
  await deleteAsync(data);
  parentPort?.postMessage(true);
});
