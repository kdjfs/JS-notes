/**
 * 手写 Promise.resolve 和 Promise.reject（静态方法）
 *
 * 面试一句话原理：
 * Promise.resolve 把任意值包装成 Promise，Promise.reject 把任意值包装成 rejected Promise。
 *
 * 核心规则：
 *
 * Promise.resolve(value)：
 * 1. value 已经是 MyPromise 实例 → 直接返回
 * 2. value 是 thenable 对象       → 跟随 thenable 的状态
 * 3. value 是普通值               → 返回 fulfilled 的 Promise
 *
 * Promise.reject(reason)：
 * 1. 不管 reason 是什么（Promise/thenable/普通值），都直接作为 reject 的原因
 * 2. 不做任何特殊处理，不展开
 */

const MyPromise = require('./01-MyPromise')

// ====================== MyPromise.resolve ======================
/**
 * 为什么 resolve 要对 Promise 和 thenable 做特殊处理？
 * 因为 Promise.resolve 的语义是"把值变成 Promise 并跟随它"。
 * 如果值本身代表一个异步操作，就要等它完成。
 *
 * @param {*} value 任意值
 * @returns {MyPromise}
 */
MyPromise.resolve = function (value) {
  // 规则1：已经是 MyPromise 实例，直接返回（同一个引用）
  if (value instanceof MyPromise) {
    return value
  }

  // 规则2：thenable 对象，创建新 Promise 跟随它
  if (value !== null && (typeof value === 'object' || typeof value === 'function')) {
    let then
    try {
      then = value.then
    } catch (err) {
      return MyPromise.reject(err)
    }

    if (typeof then === 'function') {
      // 跟随 thenable
      return new MyPromise((resolve, reject) => {
        then.call(value, resolve, reject)
      })
    }
  }

  // 规则3：普通值 → fulfilled
  return new MyPromise(resolve => resolve(value))
}

// ====================== MyPromise.reject ======================
/**
 * 为什么 reject 不对输入做任何展开？
 * 因为 reject 的语义是"这就是失败原因"，即使是 Promise 对象它也当作失败原因原样输出。
 * 这点和 resolve 完全不同——resolve 会展开 thenable，reject 不会。
 *
 * @param {*} reason 失败原因
 * @returns {MyPromise}
 */
MyPromise.reject = function (reason) {
  return new MyPromise((_, reject) => reject(reason))
}

module.exports = { resolve: MyPromise.resolve, reject: MyPromise.reject }

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试 Promise.resolve / reject ==========')

  // ---- resolve 测试 ----
  console.log('\n--- 测试 resolve 普通值 ---')
  MyPromise.resolve(42).then(v => console.log('普通值:', v))  // 42

  console.log('\n--- 测试 resolve Promise 实例 ---')
  const p = new MyPromise(resolve => resolve('实例数据'))
  const result = MyPromise.resolve(p)
  console.log('是同一个引用?', result === p ? '✅' : '❌')
  result.then(v => console.log('实例数据:', v))

  console.log('\n--- 测试 resolve thenable ---')
  const thenable = {
    then: (resolve, reject) => {
      setTimeout(() => resolve('thenable 数据'), 50)
    }
  }
  MyPromise.resolve(thenable).then(v => console.log('thenable:', v))

  console.log('\n--- 测试 resolve thenable 报错 ---')
  const badThenable = {
    then: (resolve, reject) => {
      reject(new Error('thenable 失败'))
    }
  }
  MyPromise.resolve(badThenable).catch(err => {
    console.log('thenable 错误:', err.message)
  })

  // ---- reject 测试 ----
  console.log('\n--- 测试 reject 普通值 ---')
  MyPromise.reject('拒绝原因').catch(err => console.log('reject普通值:', err))

  console.log('\n--- 测试 reject Promise（不会展开） ---')
  MyPromise.reject(MyPromise.resolve('内部数据'))
    .catch(err => {
      console.log('catch 收到的是 Promise 对象本身?', err instanceof MyPromise ? '✅ 不是"内部数据"' : '❌')
    })

  setTimeout(() => {
    console.log('\n========== resolve/reject 测试完成 ==========')
  }, 100)
}
