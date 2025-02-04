#!/usr/bin/env node

import { performance } from "perf_hooks";
import pressAnyKey from "press-any-key";
import rimraf from "rimraf";
import { roundTo } from "round-to";
import { yellow, green } from "./utils/colorLog.js";
import { select } from "@inquirer/prompts";
import { exit } from "process";
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

  let await_list = [];
  for (let path of path_list) {
    await_list.push(del(path));
  }

  await Promise.all(await_list);

  let end = performance.now();
  let elapsed = roundTo((end - start) / 1000, 2);
  yellow("✅", `time spent: ${elapsed} s`);
}
async function del(path: string) {
  await new Promise((resolve, reject) => {
    rimraf(path, (err) => {
      if (err) {
        console.log("❌", path, "  ", err);
      }
      resolve(true);
    });
  });
}

await main();
await pressAnyKey();
exit(0);