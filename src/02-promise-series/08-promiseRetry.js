/**
 * 延时函数，返回Promise，配合await实现休眠等待
 * @param {number} delay 等待毫秒数
 * @returns {Promise}
 */
function sleep(delay) {
  return new Promise(resolve => {
    setTimeout(resolve, delay)
  })
}

/**
 * 接口请求失败自动重试工具函数
 * 规则：总共执行 = 1次正常请求 + maxRetries次重试
 * 失败后间隔delay毫秒重试，达到最大次数抛出最终异常
 * @param {Function} requestFunction 业务请求函数，接收attempt执行次数，返回Promise
 * @param {number} maxRetries 最大重试次数，默认3次
 * @param {number} delay 每次重试等待间隔，默认0ms
 * @returns {Promise<any>} 请求成功的结果
 */
async function retry(
  requestFunction,
  maxRetries = 3,
  delay = 0
) {
  // 保存最后一次报错信息
  let lastError = null
  // attempt：当前是第几次执行（从0开始）
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // 传入当前执行次数，业务可用来打印日志
      return await requestFunction(attempt)
    } catch (error) {
      lastError = error
      // 到达最大重试次数，向外抛出错误，终止执行
      if (attempt === maxRetries) {
        throw error
      }
      console.log(`第 ${attempt + 1} 次请求执行失败，${delay}ms后进行重试`)
      // 配置了等待时间，则休眠后进入下一轮循环
      if (delay > 0) await sleep(delay)
    }
  }
  // 语法兜底，代码正常不会走到此处
  throw lastError
}

module.exports = { sleep, retry }

// ========== 测试代码 ==========
console.log('===== 测试请求重试函数 =====')
// 模拟会随机失败的请求
function mockReq(attempt) {
  return new Promise((resolve, reject) => {
    const random = Math.random()
    setTimeout(() => {
      // 70%概率报错，30%成功
      if (random > 0.7) resolve(`请求成功，执行次数：${attempt}`)
      else reject(new Error(`第${attempt}次请求异常`))
    }, 200)
  })
}

// 最多重试2次，每次失败间隔500ms重试
retry(mockReq, 2, 500)
  .then(res => console.log('最终结果：', res))
  .catch(err => console.error('全部重试失败：', err.message))