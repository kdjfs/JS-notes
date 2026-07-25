/**
 * 手写 Promise.allSettled
 * 规则：
 * 1. 等待所有 promise 全部执行完毕（成功/失败都会等）
 * 2. 外层 Promise 永远只会 resolve，不会 reject
 * 3. 返回数组每一项固定格式：fulfilled带value、rejected带reason
 * 4. 结果顺序和传入数组顺序严格对应
 * @param {Array} promises 任务数组，支持普通值 + Promise
 * @returns {Promise<Array>}
 */
function promiseAllSettled(promises) {
  return new Promise((resolve) => {
    // 拷贝数组，防止原数组被外部修改
    const taskList = Array.from(promises)
    // 存放最终结果，固定长度
    const result = new Array(taskList.length)
    // 记录已完成的任务数量
    let finishedNum = 0

    // 原生规范：空数组直接resolve空数组
    if (taskList.length === 0) {
      resolve([])
      return
    }

    taskList.forEach((task, index) => {
      // 包裹一层，兼容普通数值、非Promise数据
      Promise.resolve(task)
        .then((val) => {
          // 成功状态结构
          result[index] = {
            status: 'fulfilled',
            value: val
          }
        })
        .catch((err) => {
          // 失败状态结构
          result[index] = {
            status: 'rejected',
            reason: err
          }
        })
        .finally(() => {
          // 不管成功失败都会进入finally
          finishedNum++
          // 所有任务全部收尾，返回结果数组
          if (finishedNum === taskList.length) {
            resolve(result)
          }
        })
    })
  })
}

module.exports = promiseAllSettled

// ===================== 测试用例 =====================
console.log('===== 测试 promiseAllSettled =====')
const p1 = Promise.resolve(100)
const p2 = Promise.reject('接口报错')
const p3 = 666
const p4 = new Promise(res => setTimeout(() => res('延时数据'), 300))

promiseAllSettled([p1, p2, p3, p4]).then((resList) => {
  console.log('所有任务执行结果：', resList)
})



/* 核心背诵要点
不用 reject，全程只用外层 resolve 吐出数据
成功进 then、失败进 catch，各自拼装固定对象格式
成功失败都会走 finally 计数，计数等于数组长度统一返回
Promise.resolve(task) 兼容普通值 */


function promiseAllSettled(promises) {
  return new Promise(resolve => {
    const res = new Array(promises.length)
    let count = 0
    if(promises.length === 0) return resolve([])
    promises.forEach((item, idx) => {
      Promise.resolve(item)
        .then(v => res[idx] = {status:'fulfilled',value:v})
        .catch(e => res[idx] = {status:'rejected',reason:e})
        .finally(() => ++count === promises.length && resolve(res))
    })
  })
}