import rimraf from "rimraf";

/**
 * 删除 文件/文件夹
 * @param {string} path
 * @returns {Promise<boolean>}
 */
export async function deleteAsync(path) {
    return new Promise((resolve, reject) => {
      rimraf(path, (err) => {
        if (err) {
          console.log("❌", path, "  ", err);
        } else {
          console.log("Finished: " + path);
        }
        resolve(true);
      });
    });
  }