/**
 * 手写 Promise.prototype.finally
 *
 * 面试一句话原理：
 * finally 不管成功还是失败都会执行回调，并且默认把上一个 Promise 的结果"原样透传"给下一个 then。
 *
 * 核心步骤：
 * 1. 调用 this.then，同时传入成功和失败两种情况的处理
 * 2. 执行回调 cb()
 * 3. 如果 cb 返回 Promise，等待它完成
 * 4. 无论 cb 成功/失败，原样透传上一个 Promise 的结果（除非 cb 自己抛错）
 *
 * 关键规则：
 * - finally 的回调不接受任何参数（不知道结果是成功还是失败）
 * - 回调返回普通值会被忽略，继续透传原结果
 * - 回调返回 Promise 会等待，但等待完仍透传原结果
 * - 回调自己抛错，则新错误覆盖原来的结果
 * - finally 返回的是新 Promise，不影响原 Promise
 */

// ====================== 基于 MyPromise 扩展 ======================
const MyPromise = require('./01-MyPromise')

// 如果还没有 finally，则添加到原型上
if (!MyPromise.prototype.finally) {
  /**
   * @param {Function} onFinally 无论成功失败都会执行的回调
   * @returns {MyPromise}
   */
  MyPromise.prototype.finally = function (onFinally) {
    // 必须返回新 Promise，支持链式调用
    return this.then(
      // 成功路径：执行回调 → 透传原成功值
      (value) => {
        // 用 MyPromise.resolve 包裹回调结果：如果回调返回 Promise 就等待
        // 回调执行完后，把原成功值 value 传给下一个 then
        return MyPromise.resolve(
          typeof onFinally === 'function' ? onFinally() : undefined
        ).then(() => value)
      },
      // 失败路径：执行回调 → 继续抛出原失败原因
      (reason) => {
        return MyPromise.resolve(
          typeof onFinally === 'function' ? onFinally() : undefined
        ).then(() => { throw reason })
      }
    )
  }
}

module.exports = MyPromise.prototype.finally

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试 Promise.prototype.finally ==========')

  // 测试1：成功场景 finally 透传原值
  console.log('\n--- 测试1：成功场景透传 ---')
  MyPromise.resolve('成功数据')
    .finally(() => {
      console.log('finally 执行了（成功场景）')
    })
    .then(v => {
      console.log('then 收到:', v)  // 预期: 成功数据
    })

  // 测试2：失败场景 finally 透传原错误
  console.log('\n--- 测试2：失败场景透传原错误 ---')
  MyPromise.reject('失败原因')
    .finally(() => {
      console.log('finally 执行了（失败场景）')
    })
    .catch(err => {
      console.log('catch 收到:', err)  // 预期: 失败原因
    })

  // 测试3：finally 返回 Promise 会等待
  console.log('\n--- 测试3：finally 返回 Promise ---')
  MyPromise.resolve('数据')
    .finally(() => {
      return new MyPromise(resolve => {
        setTimeout(() => {
          console.log('finally 中的异步完成')
          resolve()
        }, 50)
      })
    })
    .then(v => {
      console.log('then 收到:', v)  // 预期: 数据（透传）
    })

  // 测试4：finally 中报错会覆盖原结果
  console.log('\n--- 测试4：finally 报错覆盖 ---')
  MyPromise.resolve('原成功值')
    .finally(() => {
      throw new Error('finally 内部错误')
    })
    .catch(err => {
      console.log('catch 收到 finally 错误:', err.message)
    })

  // 测试5：finally 不传回调（兜底）
  console.log('\n--- 测试5：不传回调 ---')
  MyPromise.resolve('hello')
    .finally()
    .then(v => {
      console.log('then 收到:', v)  // hello，什么都没发生
    })

  setTimeout(() => {
    console.log('\n========== finally 测试完成 ==========')
  }, 150)
}
