/**
 * 重复请求去重（进行中请求合并）
 *
 * 面试一句话原理：
 * 用 Map 缓存进行中的 Promise，相同 key 的请求如果有正在进行的就复用那个 Promise，
 * 请求完成（成功/失败）后删除缓存，不缓存成功结果。
 *
 * 场景：同一个页面短时间内多次请求相同接口，不希望发送多个完全相同的请求。
 *
 * 注意区分：
 * - 请求去重：同一个请求发起多次，只真正执行一次，其他人等结果
 * - 请求缓存：成功后缓存结果一段时间，后续直接返回缓存数据（见 04-requestCacheTTL.js）
 */

// ====================== mockRequest ======================
function mockRequest(delay, data, shouldFail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error(`请求失败: ${data}`))
      else resolve(data)
    }, delay)
  })
}

let realCallCount = 0  // 记录真实调用次数

// ====================== 请求去重函数 ======================
class RequestDeduplicator {
  constructor() {
    // key → Promise（正在进行的请求）
    this.inflightRequests = new Map()
  }

  /**
   * 发起请求（自动去重）
   * @param {string}   key      请求标识（url + 参数生成的唯一 key）
   * @param {Function} requestFn 真正发起请求的函数
   * @returns {Promise} 无论复用还是新建，都返回同一个 Promise
   */
  request(key, requestFn) {
    // 如果已经有相同 key 的请求在进行中 → 复用
    if (this.inflightRequests.has(key)) {
      console.log(`  [去重] "${key}" 复用进行中的请求`)
      return this.inflightRequests.get(key)
    }

    // 发起新请求，存储这个 Promise
    const promise = requestFn()
    this.inflightRequests.set(key, promise)

    // 请求完成（无论成功/失败）都要清理缓存
    // 为什么失败也清理？因为失败后下次请求允许重新发起
    const cleanup = () => {
      this.inflightRequests.delete(key)
    }
    promise.then(cleanup, cleanup)

    return promise
  }
}

module.exports = { RequestDeduplicator, mockRequest }

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试请求去重 ==========')

  const dedup = new RequestDeduplicator()

  let callCount = 0
  function fetchUser(id) {
    return mockRequest(200, `用户数据_${id}`).then(data => {
      callCount++
      return data
    })
  }

  console.log('\n--- 测试：3个相同请求并发 ---')
  // 模拟 3 个组件同时请求用户 1 的数据
  Promise.all([
    dedup.request('user:1', () => fetchUser(1)),
    dedup.request('user:1', () => fetchUser(1)),
    dedup.request('user:1', () => fetchUser(1)),
  ]).then(results => {
    console.log('所有结果:', results)
    console.log('真实请求次数:', callCount)  // 应该只有 1 次
    console.log(callCount === 1 ? '✅ 只请求了1次' : '❌ 请求了多次')
  })

  // 测试2：间隔请求不会去重（上次已完成）
  setTimeout(() => {
    console.log('\n--- 测试：请求完成后再请求 ---')
    dedup.request('user:2', () => fetchUser(2)).then(d => {
      console.log('第一次:', d)
    })
    setTimeout(() => {
      dedup.request('user:2', () => fetchUser(2)).then(d => {
        console.log('第二次:', d)
        console.log('（第一次已完成，第二次会重新请求）')
      })
    }, 300)
  }, 300)

  setTimeout(() => {
    console.log('\n========== 请求去重测试完成 ==========')
  }, 800)
}
