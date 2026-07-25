/**
 * 手写 Promise.any
 * 规则：
 * 1、全部失败才会整体reject（抛出 AggregateError 所有错误集合）
 * 2、只要有一个成功，立刻resolve该成功值
 * 3、最先成功的任务胜出，失败任务不会影响整体状态
 * @param {Array} promises
 * @returns {Promise}
 */
function promiseAny(promises) {
  return new Promise((resolve, reject) => {
    const taskList = Array.from(promises)
    const errList = []
    let failCount = 0

    if (taskList.length === 0) {
      return reject(new AggregateError([], 'All promises were rejected'))
    }

    taskList.forEach((task, idx) => {
      Promise.resolve(task)
        .then(val => resolve(val))
        .catch(err => {
          errList[idx] = err
          failCount++
          if (failCount === taskList.length) {
            reject(new AggregateError(errList, 'All promises were rejected'))
          }
        })
    })
  })
}

module.exports = promiseAny

// 测试
const e1 = Promise.reject('err1')
const e2 = Promise.reject('err2')
const s1 = new Promise(res => setTimeout(() => res('成功数据'), 300))
promiseAny([e1, e2, s1]).then(console.log)
// 全部失败场景
promiseAny([e1, e2]).catch(e => console.log(e.errors))