/**
 * 手写 MyPromise（面试背诵版）
 *
 * 面试一句话原理：
 * 用 then 收集回调到两个队列，resolve/reject 时用微任务异步执行队列中的所有回调，
 * 每次 then 返回一个新 Promise 实现链式调用。
 *
 * 核心步骤：
 * 1. executor 立即执行，传入 resolve 和 reject
 * 2. then 收集成功/失败回调到两个队列
 * 3. resolve/reject 改变状态，通过微任务异步执行队列
 * 4. then 返回新 Promise，回调结果决定新 Promise 的状态
 *
 * 关键知识点：
 * - 为什么 then 必须返回新 Promise？  因为链式调用，每个 then 的返回值影响下一个 then
 * - 为什么需要两个回调队列？          因为同一个 Promise 可以注册多个 then
 * - 什么是 Promise 解析过程？         递归展开 thenable 的过程
 * - 什么是循环引用？                    then 的回调返回了 then 返回的那个新 Promise 自身
 * - 为什么回调要异步执行？             保证 then 的回调在微任务中执行，时序统一
 */

// ====================== 状态常量 ======================
const PENDING   = 'pending'    // 初始状态
const FULFILLED = 'fulfilled'  // 已成功
const REJECTED  = 'rejected'   // 已失败

// ====================== MyPromise 类 ======================
class MyPromise {
  constructor(executor) {
    // ---- 初始状态 ----
    this.state   = PENDING      // 当前状态
    this.value   = undefined    // 成功值 / 失败原因
    // ---- 回调队列：同一个 promise 可以多次 .then()，所以用数组 ----
    this.onFulfilledCallbacks = [] // 成功回调队列
    this.onRejectedCallbacks  = [] // 失败回调队列

    // ---- resolve 函数 ----
    const resolve = (value) => {
      // 状态只能从 pending 改变一次，防止多次调用 resolve/reject
      if (this.state !== PENDING) return

      // resolve 的参数是 thenable/Promise 时，需要递归解析
      // 这就是"Promise 解析过程"
      if (value instanceof MyPromise) {
        // 如果 value 是 MyPromise，等它完成后再 resolve/reject 当前 Promise
        value.then(resolve, reject)
        return
      }

      this.state = FULFILLED
      this.value = value
      // 用微任务异步执行所有成功回调
      this._runCallbacks()
    }

    // ---- reject 函数 ----
    const reject = (reason) => {
      if (this.state !== PENDING) return
      this.state = REJECTED
      this.value = reason
      this._runCallbacks()
    }

    // ---- 立即执行 executor ----
    try {
      executor(resolve, reject)
    } catch (err) {
      // executor 内部报错 → 自动 reject
      reject(err)
    }
  }

  // ---- 异步执行队列中的所有回调 ----
  _runCallbacks() {
    const callbacks = this.state === FULFILLED
      ? this.onFulfilledCallbacks
      : this.onRejectedCallbacks

    if (callbacks.length === 0) return

    // 用 queueMicrotask 实现微任务调度
    queueMicrotask(() => {
      callbacks.forEach(cb => cb(this.value))
      // 清空队列，释放内存
      this.onFulfilledCallbacks.length = 0
      this.onRejectedCallbacks.length  = 0
    })
  }

  /**
   * then —— Promise 链式调用的核心
   *
   * 为什么 then 必须返回一个新的 Promise？
   * 因为链式调用：p.then(a).then(b)，第二个 then 需要感知第一个 then 回调的返回值。
   * 如果 then 返回 this，则所有 then 共享同一个 Promise，无法传递中间结果。
   *
   * @param {Function} onFulfilled 成功回调
   * @param {Function} onRejected  失败回调
   * @returns {MyPromise} 一个新的 MyPromise
   */
  then(onFulfilled, onRejected) {
    // 参数兜底：允许不传回调，实现"值穿透"
    // 如果不传 onFulfilled，默认把值传给下一个 then
    if (typeof onFulfilled !== 'function') {
      onFulfilled = value => value
    }
    // 如果不传 onRejected，默认把错误抛给下一个 then
    if (typeof onRejected !== 'function') {
      onRejected = reason => { throw reason }
    }

    // ---- 返回新 Promise，形成链 ----
    const promise2 = new MyPromise((resolve, reject) => {

      // 封装回调执行逻辑（成功/失败共用一套流程）
      const runCallback = (callback, value) => {
        try {
          const x = callback(value)  // 执行用户回调

          if (x === promise2) {
            // 循环引用：不能自己等自己
            throw new TypeError('Chaining cycle detected')
          }

          // Promise 解析过程：递归展开 x
          resolvePromise(promise2, x, resolve, reject)

        } catch (err) {
          reject(err)
        }
      }

      if (this.state === FULFILLED) {
        queueMicrotask(() => runCallback(onFulfilled, this.value))
      } else if (this.state === REJECTED) {
        queueMicrotask(() => runCallback(onRejected, this.value))
      } else {
        // pending 状态：把回调存起来，等状态变更后执行
        this.onFulfilledCallbacks.push(
          (value) => runCallback(onFulfilled, value)
        )
        this.onRejectedCallbacks.push(
          (reason) => runCallback(onRejected, reason)
        )
      }
    })

    return promise2
  }

  /**
   * catch —— 专门处理失败
   * 等价于 then(undefined, onRejected)
   */
  catch(onRejected) {
    return this.then(undefined, onRejected)
  }

  // ========== 静态方法 ==========

  static resolve(value) {
    if (value instanceof MyPromise) return value
    return new MyPromise(resolve => resolve(value))
  }

  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason))
  }
}

// ====================== Promise 解析过程 ======================
/**
 * 递归解析 x 的类型，决定 promise2 的状态
 *
 * 规则：
 * 1. x 是普通值        → resolve(x)
 * 2. x 是 MyPromise    → 等 x 完成，x 成功则 resolve，x 失败则 reject
 * 3. x 是 thenable     → 取 x.then，按 Promise 处理
 *
 * 这是 Promise/A+ 规范的核心，面试中问"Promise 解析过程"指的就是这个。
 */
function resolvePromise(promise2, x, resolve, reject) {
  // 普通值（基本类型/null）直接 resolve
  if (x === null || (typeof x !== 'object' && typeof x !== 'function')) {
    resolve(x)
    return
  }

  // thenable 对象（有 then 方法的对象/函数）
  let then
  try {
    then = x.then
  } catch (err) {
    reject(err)
    return
  }

  // 没有 then 方法 = 普通对象，直接 resolve
  if (typeof then !== 'function') {
    resolve(x)
    return
  }

  // ---- 处理 thenable ----
  let called = false  // 防止 resolve/reject 被多次调用

  try {
    then.call(
      x,
      // onFulfilled
      (y) => {
        if (called) return
        called = true
        // 递归解析：y 可能还是 Promise/thenable
        resolvePromise(promise2, y, resolve, reject)
      },
      // onRejected
      (r) => {
        if (called) return
        called = true
        reject(r)
      }
    )
  } catch (err) {
    if (!called) {
      reject(err)
    }
  }
}

// ====================== 导出 ======================
module.exports = MyPromise

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试 MyPromise ==========')

  // 测试1：基本 resolve + then
  console.log('\n--- 测试1：基本 resolve + then ---')
  new MyPromise((resolve) => {
    resolve('hello')
  }).then(value => {
    console.log('结果:', value)  // 预期: hello
  })

  // 测试2：链式调用 + 返回值传递
  console.log('\n--- 测试2：链式调用 ---')
  new MyPromise((resolve) => {
    resolve(1)
  })
    .then(v => {
      console.log('第一个then:', v)  // 1
      return v + 1
    })
    .then(v => {
      console.log('第二个then:', v)  // 2
      return v + 1
    })
    .then(v => {
      console.log('第三个then:', v)  // 3
    })

  // 测试3：异步 resolve
  console.log('\n--- 测试3：异步 resolve ---')
  console.log('开始')
  new MyPromise((resolve) => {
    setTimeout(() => resolve('异步数据'), 100)
  }).then(v => {
    console.log('异步结果:', v)  // 异步数据
  })
  console.log('结束')  // 先于"异步结果"打印

  // 测试4：reject + catch
  console.log('\n--- 测试4：reject + catch ---')
  new MyPromise((_, reject) => {
    reject('出错了')
  }).catch(err => {
    console.log('捕获错误:', err)  // 出错了
  })

  // 测试5：executor 抛错自动 reject
  console.log('\n--- 测试5：executor 抛错 ---')
  new MyPromise(() => {
    throw new Error('executor 内部错误')
  }).catch(err => {
    console.log('自动捕获:', err.message)  // executor 内部错误
  })

  // 测试6：then 返回 Promise
  console.log('\n--- 测试6：then 返回 Promise ---')
  new MyPromise(resolve => resolve(1))
    .then(v => {
      return new MyPromise(resolve => {
        setTimeout(() => resolve(v * 10), 50)
      })
    })
    .then(v => {
      console.log('then返回Promise的结果:', v)  // 10
    })

  // 测试7：then 回调报错
  console.log('\n--- 测试7：then 回调报错 ---')
  new MyPromise(resolve => resolve(1))
    .then(() => {
      throw new Error('then 内部抛错')
    })
    .catch(err => {
      console.log('catch捕获:', err.message)
    })

  // 测试8：同一个 Promise 多个 then
  console.log('\n--- 测试8：多个 then ---')
  const p = new MyPromise(resolve => resolve('共享数据'))
  p.then(v => console.log('then1:', v))
  p.then(v => console.log('then2:', v))

  // 测试9：循环引用检测
  console.log('\n--- 测试9：循环引用 ---')
  const p2 = new MyPromise(resolve => resolve())
  const p3 = p2.then(() => p3)
  p3.catch(err => console.log('循环引用检测:', err.message))

  // 测试10：值穿透
  console.log('\n--- 测试10：值穿透 ---')
  new MyPromise(resolve => resolve(100))
    .then()
    .then()
    .then(v => console.log('穿透结果:', v))  // 100

  // 等待异步测试完成
  setTimeout(() => {
    console.log('\n========== MyPromise 测试完成 ==========')
  }, 200)
}
