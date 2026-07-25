/**
 * 手写 Promise.race
 * 规则：
 * 1、所有任务赛跑，**第一个敲定状态（不管成功/失败）的Promise，直接决定整体Promise状态**
 * 2、先resolve → 整体resolve；先reject → 整体立刻reject
 * 3、兼容数组内普通原始值，Promise.resolve包裹统一处理
 * 4、传入空数组，返回的Promise永久pending，和原生行为一致
 * @param {Array} promises 任务数组
 * @returns {Promise}
 */
function promiseRace(promises) {
  return new Promise((resolve, reject) => {
    // 浅拷贝数组，隔绝外部原数组改动影响
    const taskList = Array.from(promises)

    taskList.forEach(task => {
      // 统一包裹，普通值直接变为成功态Promise
      Promise.resolve(task)
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
    // 空数组无任何调用，外层Promise永久pending，无需额外代码
  })
}

module.exports = promiseRace

// ===================== 配套测试代码 =====================
console.log('===== 测试 Promise.race =====')
// 测试1：最快成功胜出
const slowResolve = new Promise(res => setTimeout(() => res('慢成功'), 800))
const fastResolve = new Promise(res => setTimeout(() => res('快成功'), 200))
promiseRace([slowResolve, fastResolve]).then(data => {
  console.log('赛跑获胜(成功):', data) // 200ms 输出 快成功
})

// 测试2：最先失败直接抛出错误
const normalP = new Promise(res => setTimeout(() => res('正常'), 500))
const fastErr = new Promise((_, rej) => setTimeout(() => rej('最先报错'), 100))
promiseRace([normalP, fastErr]).catch(err => {
  console.log('赛跑获胜(失败):', err)
})

// 测试3：传入普通值，立即胜出
promiseRace([999, slowResolve]).then(console.log) // 立刻打印999