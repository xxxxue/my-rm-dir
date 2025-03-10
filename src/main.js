#!/usr/bin/env node

import path, { dirname } from "node:path";
import { exit } from "node:process";
import { fileURLToPath } from "node:url";
import { performance } from "perf_hooks";
import { roundTo } from "round-to";
import { select } from "@inquirer/prompts";
import pressAnyKey from "press-any-key";
import { green, yellow } from "./color-log.js";
import { getRationalWorkerCount, WorkerPool } from "./worker-pool.js";
import { deleteAsync } from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  let path_list = process.argv.slice(2);

  if (path_list.length === 0) {
    console.log("❌", "path is undefined");
    return;
  }

  yellow("count:", path_list.length.toString());

  for (let path of path_list) {
    green("📂", path);
  }

  const answer = await select({
    message: "Are you sure you want to delete ?",
    choices: [
      {
        name: "cancel",
        value: false,
      },
      {
        name: "yes",
        value: true,
      },
    ],
  });

  if (!answer) {
    console.log("✅", "cancel delete");
    return;
  }

  let start = performance.now();

  if (path_list.length > 1) {
    await worker_del(path_list);
  } else if (path_list.length == 1) {
    await deleteAsync(path_list[0]);
  }
  let end = performance.now();

  let elapsed = roundTo((end - start) / 1000, 2);

  yellow("✅", `time spent: ${elapsed} s`);
}
/**
 * @param {string[]} path_list
 */
async function worker_del(path_list) {
  let await_list = [];
  let workerCount = getRationalWorkerCount(path_list.length);
  console.log("worker count:" + workerCount);
  let worker = new WorkerPool(path.join(__dirname, "worker-rimraf.js"), workerCount);
  for (let path_item of path_list) {
    await_list.push(worker.run(path_item));
  }
  await Promise.all(await_list);
  worker.destroyAllWorker();
}

await main();
await pressAnyKey();
exit(0);
