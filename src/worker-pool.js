import { cpus } from "node:os";
import { Worker } from "node:worker_threads";

/**
 * 获取合理的 worker 数量
 * @param {number} taskCount
 */
export function getRationalWorkerCount(taskCount) {
  let cpuCoreCount = cpus().length - 1;
  if (taskCount >= cpuCoreCount) {
    // 任务较多,
    // 使用 cpu 核心数来当做数量,
    // 剩余的任务进行排队
    return cpuCoreCount;
  } else {
    // 任务较少,
    // 使用 任务数 当做 数量,
    // 避免启动多余的 worker
    return taskCount;
  }
}

/**
 * ref: https://blog.skk.moe/post/say-hello-to-nodejs-worker-thread/
 */
export class WorkerPool {
  /**
   * @param {string} workerPath js 文件的路径
   * @param {number} workerCount worker 的数量 (默认 cpu 核心数 - 1)
   * @example
   * import path, { dirname } from "node:path";
   * import { fileURLToPath } from "node:url";
   *
   * const __filename = fileURLToPath(import.meta.url);
   * const __dirname = dirname(__filename);
   *
   * let list = [ "data1", "data2", "data3" ]
   *
   * let workerCount = getRationalWorkerCount(list.length)
   *
   * // 注意路径,
   * // "./worker.js" 会定位到根目录,
   * // 所以这里需要传入绝对路径,才可以定位到 src/index.js 同级的 "src/worker.js"
   * let worker = new WorkerPool(path.join(__dirname, "worker.js"), workerCount);
   *
   * let await_list = [];
   * for (let item of ) {
   *   await_list.push(worker.run(item));
   * }
   * await Promise.all(await_list);
   * worker.destroyAllWorker();
   */
  constructor(workerPath, workerCount = getRationalWorkerCount(3)) {
    // 修正错误的 worker 数量
    if (workerCount < 1) {
      workerCount = 1;
    }

    /**
     * js 脚本路径
     * @private
     */
    this.workerPath = workerPath;
    /**
     * worker 数量
     * @private
     */
    this.workerCount = workerCount;

    /**
     * 任务队列
     * @private
     */
    this._queue = [];
    /**
     * worker 索引
     * @private
     */
    this._workersById = {};
    /**
     * worker 激活状态索引
     * @private
     */
    this._activeWorkersById = {};

    // 创建 worker
    for (let i = 0; i < this.workerCount; i++) {
      const worker = new Worker(workerPath);

      this._workersById[i] = worker;
      // 将这些 worker 设置为未激活状态
      this._activeWorkersById[i] = false;
    }
  }

  /**
   * 获取一个空闲 worker 的 id
   * @private
   * @returns
   */
  _getInactiveWorkerId() {
    for (let i = 0; i < this.workerCount; i++) {
      if (!this._activeWorkersById[i]) {
        return i;
      }
    }
    return -1;
  }

  /**
   * 调用指定的 worker 运行一个任务
   * @private
   * @param {*} workerId
   * @param {*} taskObj
   */
  _runWorker(workerId, taskObj) {
    const worker = this._workersById[workerId];

    /** 当任务执行完毕后执行 */
    const doAfterTaskIsFinished = () => {
      // 去除所有的 Listener，不然一次次添加不同的 Listener 会 OOM 的
      worker.removeAllListeners("message");
      worker.removeAllListeners("error");
      // 将这个 worker 设为未激活状态
      this._activeWorkersById[workerId] = false;

      if (this._queue.length) {
        // 任务队列非空，使用该 worker 执行任务队列中第一个任务
        this._runWorker(workerId, this._queue.shift());
      }
    };

    // 将这个 worker 设置为激活状态
    this._activeWorkersById[workerId] = true;
    // 设置两个回调，用于 worker 的监听器
    const messageCallback = (result) => {
      taskObj.callback(null, result);
      doAfterTaskIsFinished();
    };
    const errorCallback = (error) => {
      taskObj.callback(error);
      doAfterTaskIsFinished();
    };

    // 为 worker 添加 'message' 和 'error' 两个 Listener
    worker.once("message", messageCallback);
    worker.once("error", errorCallback);
    // 将数据传给 worker 供其获取和执行
    worker.postMessage(taskObj.data);
  }

  /**
   * 运行一个任务, (没有空闲 worker,则存到队列中)
   * @public
   * @param {any} data 传递给 message 事件的数据
   * @example
   * // file: worker.js
   * // nodejs worker 接收数据
   * import { parentPort } from "worker_threads";
   * parentPort.on("message", (data) => {
   *   console.log(data);
   *   // 完成任务,给主线程发消息
   *   parentPort?.postMessage(true);
   * });
   * @returns
   */
  run(data) {
    return new Promise((resolve, reject) => {
      // 获取一个空闲的 worker
      const availableWorkerId = this._getInactiveWorkerId();

      const taskObj = {
        data: data,
        callback: (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      };

      if (availableWorkerId === -1) {
        // 当前没有空闲的 worker，把任务丢进队列里，这样一旦有 worker 空闲时就会开始执行。
        this._queue.push(taskObj);
        return null;
      }

      // 有一个空闲的 worker ，用它执行任务
      this._runWorker(availableWorkerId, taskObj);
    });
  }

  /**
   * 清理所有 worker
   * @public
   * @param {boolean} force
   */
  destroyAllWorker(force = false) {
    for (let i = 0; i < this.workerCount; i++) {
      if (this._activeWorkersById[i] && !force) {
        // 通常情况下，不应该在还有 worker 在执行的时候就销毁它，
        // 这一定是什么地方出了问题，所以还是抛个 Error 比较好
        // 不过保留一个 force 参数，总有人用得到的
        throw new Error(`The worker ${i} is still runing!`);
      }

      // 销毁这个 Worker
      this._workersById[i].terminate();
    }
  }
}
