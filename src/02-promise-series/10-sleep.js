/**
 * sleep 延时函数
 *
 * 面试一句话原理：
 * 用 setTimeout 包裹 Promise 的 resolve，await 暂停当前 async 函数的后续代码，但不阻塞 JS 主线程。
 *
 * 核心步骤：
 * 1. 返回一个 Promise
 * 2. Promise 内部用 setTimeout 延迟 resolve
 * 3. 配合 async/await 暂停后续代码执行
 *
 * 常见面试追问：
 * - sleep 会阻塞主线程吗？ → 不会，它只是返回一个延迟完成的 Promise
 * - await 暂停了什么？      → 暂停的是当前 async 函数后续代码，不是整个线程
 * - 和同步 sleep 的区别？   → 同步 sleep（while+Date.now）会卡死整个页面/事件循环
 */

/**
 * @param {number} delay 等待毫秒数
 * @returns {Promise<void>}
 */
function sleep(delay) {
  return new Promise(resolve => {
    setTimeout(resolve, delay)
  })
}

module.exports = sleep

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试 sleep 函数 ==========')

  async function test() {
    console.log('开始:', new Date().toLocaleTimeString())

    await sleep(100)
    console.log('100ms 后:', new Date().toLocaleTimeString())

    await sleep(200)
    console.log('再 200ms 后:', new Date().toLocaleTimeString())
  }

  test().then(() => {
    console.log('\n========== sleep 测试完成 ==========')
  })

  // 常见错误示例：不要在循环中这样用（但面试一般不问这个）
  // ❌ [1,2,3].forEach(async (i) => { await sleep(100); console.log(i) })
  // 上面的 forEach 不会等，所有 sleep 同时开始
  // ✅ for (const i of [1,2,3]) { await sleep(100); console.log(i) }
  // 上面的 for...of 会按顺序等
}
