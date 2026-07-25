/**
 * 手写 Promise.all
 * 规则：
 * 1、接收一个 Promise 数组【可混普通值】
 * 2、全部成功：按传入顺序返回成功结果数组
 * 3、任意一个失败：立刻抛出该失败原因，整体变为reject
 * @param {Array} promises 任务数组
 * @returns {Promise<Array>}
 */
function promiseAll(promises) {
  // 向外返回一个全新Promise
  return new Promise((resolve, reject) => {
    // 存放所有成功的结果，严格对应数组下标顺序
    const resultArr = []
    // 记录成功完成的个数
    let finishCount = 0

    // 边界：传入空数组，直接resolve空数组，原生Promise.all特性
    if (promises.length === 0) {
      resolve([])
      return
    }

    // 遍历每一项任务
    promises.forEach((item, index) => {
      // Promise.resolve包裹一层：统一格式，普通值直接变成成功态Promise，不用额外判断类型
      Promise.resolve(item)
        .then((res) => {
          // 按下标赋值，保证结果顺序和入参顺序一致（异步快慢不影响顺序）
          resultArr[index] = res
          // 成功数量+1
          finishCount++
          // 所有任务全部执行完毕，返回结果数组
          if (finishCount === promises.length) {
            resolve(resultArr)
          }
        })
        .catch((err) => {
          // 任意一个任务失败，直接整体reject，短路机制
          reject(err)
        })
    })
  })
}

// 导出模块
module.exports = promiseAll

// ===================== 测试用例 =====================
console.log('===== 测试手写 Promise.all =====')
// 测试1：全部成功场景
const p1 = Promise.resolve(10)
const p2 = Promise.resolve(20)
const p3 = 30 // 普通数值
promiseAll([p1, p2, p3]).then(res => {
  console.log('全部成功结果：', res) // [10,20,30]
})

// 测试2：其中一个失败
const pa = Promise.resolve(1)
const pb = Promise.reject('出错啦')
const pc = Promise.resolve(3)
promiseAll([pa, pb, pc]).catch(err => {
  console.log('捕获错误：', err) // 立刻打印 出错啦
})

// 测试3：空数组
promiseAll([]).then(res => console.log('空数组返回：', res))