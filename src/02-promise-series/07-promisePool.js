/**
 * Promise 并发池（限制最大同时请求数量，经典面试手写题）
 * 核心思路：开启limit个worker工作线程，while循环不断抢占任务执行，全部任务消费完毕自动结束
 * 特点：结果数组顺序和任务数组顺序严格保持一致、自动适配任务总数小于limit的情况
 * @param {Array<Function>} taskFunctions 由【返回Promise的函数】组成的数组
 * @param {number} limit 最大并发上限（同时运行的Promise数量）
 * @returns {Promise<Array>} 所有任务执行完成，返回按入参顺序排列的结果数组
 */
async function promisePool(taskFunctions, limit) {
  // 校验任务列表必须是数组
  if (!Array.isArray(taskFunctions)) {
    throw new TypeError('taskFunctions 必须是数组类型')
  }
  // 校验并发数：正整数
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new TypeError('limit 必须是大于0的整数')
  }

  // 存放每个任务的执行结果，使用数组下标绑定任务顺序，保证输出不乱序
  const results = new Array(taskFunctions.length)
  // 全局游标：标记下一个需要被领取执行的任务下标（多个worker共享、依次累加抢占）
  let nextIndex = 0

  /**
   * 单个工作器函数
   * 无限循环去抢夺任务执行，无任务时函数退出销毁
   */
  async function worker() {
    while (true) {
      // 原子式取出当前要执行的下标，立刻自增，防止多个worker拿到同一个任务
      const currentIndex = nextIndex
      nextIndex++

      // 游标超过最大下标 = 所有任务全部被领取，当前worker结束运行
      if (currentIndex >= taskFunctions.length) {
        return
      }

      const taskFn = taskFunctions[currentIndex]
      // 数组每一项必须是函数（执行才会产生Promise）
      if (typeof taskFn !== 'function') {
        throw new TypeError(`数组下标${currentIndex}的任务不是函数`)
      }

      // 执行任务，等待Promise完成，把结果存入对应下标位置
      results[currentIndex] = await taskFn()
    }
  }

  // 实际创建的worker数量：并发上限 和 任务总数 取更小值
  // 例如一共只有3个任务，limit=10，只需要开3个worker即可，不用多余空闲线程
  const realWorkerNum = Math.min(limit, taskFunctions.length)

  // 批量创建对应数量的worker实例，每个worker都是异步函数
  const workerList = Array.from({ length: realWorkerNum }, () => worker())

  // 等待所有worker全部执行完毕（所有任务跑完）
  await Promise.all(workerList)

  // 返回有序结果数组
  return results
}

// 模块导出
module.exports = promisePool

// ===================== 测试用例 =====================
console.log('========== 测试 Promise 并发池 ==========')

// 模拟异步任务，接收耗时，返回结果
function createTask(delay, value) {
  return () => new Promise(resolve => {
    setTimeout(() => {
      console.log(`任务${value}执行完成`);
      resolve(value)
    }, delay)
  })
}

// 构造8个异步任务
const taskList = [
  createTask(600, 1),
  createTask(300, 2),
  createTask(800, 3),
  createTask(200, 4),
  createTask(500, 5),
  createTask(100, 6),
  createTask(400, 7),
  createTask(700, 8),
]

// 限制最大并发为3
promisePool(taskList, 3).then(res => {
  console.log('全部任务执行完毕，有序结果：', res)
})



/* 逐段核心逻辑拆解
共享游标 nextIndex
多个 worker 同时执行，每次先取值、再nextIndex++，实现多工作器安全抢夺任务，不会重复执行同一个任务。
while (true) 循环
worker 不会执行一个任务就销毁，空闲时持续拉取新任务，直到所有任务被领完才 return 退出。
results[currentIndex] 按下标存结果
哪怕任务异步完成有快有慢，最终数组顺序和你传入任务的顺序完全一致。
Math.min(limit, taskFunctions.length)
做性能优化，任务数量比并发数小的时候，不会创建多余空跑的 worker。 */
//极简背诵骨架
async function promisePool(tasks, limit) {
  const res = new Array(tasks.length)
  let idx = 0
  async function worker() {
    while (true) {
      const i = idx++
      if (i >= tasks.length) return
      res[i] = await tasks[i]()
    }
  }
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, worker)
  await Promise.all(workers)
  return res
}