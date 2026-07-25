/**
 * 请求超时控制
 *
 * 面试一句话原理：
 * Promise.race 让请求和超时计时器赛跑，谁先完成谁决定结果；
 * 更完整的做法用 AbortController 配合 fetch 真正取消底层请求。
 *
 * 两种方案：
 * 1. Promise.race：只能停止等待，底层请求还在进行（不可取消的 Promise）
 * 2. AbortController + fetch：能真正通知服务器取消请求
 */

// ====================== mockRequest：模拟接口请求 ======================
// 延迟 delay 毫秒后返回数据
function mockRequest(delay, data) {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delay)
  })
}

// ====================== 方式1：Promise.race ======================
/**
 * 原理：请求 Promise 和延时 Promise 赛跑
 * 如果延时先完成 → reject 超时错误；请求先完成 → 正常返回
 *
 * 局限：请求 Promise 无法被外部取消，超时后底层请求仍在进行
 */
function requestWithTimeout(requestPromise, timeout) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`请求超时 (${timeout}ms)`)), timeout)
  })

  return Promise.race([requestPromise, timeoutPromise])
}

// ====================== 方式2：AbortController（标准 Web API） ======================
/**
 * 配合支持 signal 的 fetch 使用，能真正取消底层网络请求。
 * Node.js 18+ 支持 AbortController。
 */
function fetchWithTimeout(url, timeout) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  return fetch(url, { signal: controller.signal })
    .finally(() => clearTimeout(timer))  // 请求完成（成功或失败都清理定时器）
}

module.exports = { requestWithTimeout, fetchWithTimeout, mockRequest }

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试请求超时控制 ==========')

  // 测试1：请求在超时前完成
  console.log('\n--- 测试1：请求先完成 ---')
  const fastReq = mockRequest(100, '快速数据')
  requestWithTimeout(fastReq, 500)
    .then(data => console.log('成功:', data))
    .catch(err => console.log('失败:', err.message))

  // 测试2：请求超时
  console.log('\n--- 测试2：超时 ---')
  const slowReq = mockRequest(1000, '慢数据')
  requestWithTimeout(slowReq, 200)
    .then(data => console.log('成功:', data))
    .catch(err => console.log('失败:', err.message))

  // 测试3：Promise.race 的局限说明
  console.log('\n--- 测试3：说明 Promise.race 的局限 ---')
  console.log('Promise.race 超时后只是不等待结果了，底层请求仍在执行')
  console.log('要真正取消请求，需配合 AbortController + fetch 支持 signal')

  setTimeout(() => {
    console.log('\n========== 请求超时测试完成 ==========')
  }, 300)
}
