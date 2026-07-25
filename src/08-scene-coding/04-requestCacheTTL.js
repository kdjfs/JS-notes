/**
 * 带过期时间的请求缓存
 *
 * 面试一句话原理：
 * 成功返回后把数据和过期时间缓存起来，后续请求先检查缓存是否有效，
 * 未过期直接返回缓存数据，过期则重新请求。
 *
 * 与请求去重的区别：
 * - 请求去重：只在请求进行中合并，完成后清理，防止并发重复
 * - 请求缓存：请求完成后保留结果一段时间，后续立即返回缓存
 *
 * TTL（Time To Live）：缓存的生存时间，过期后需要重新获取
 */

// ====================== mockRequest ======================
function mockRequest(delay, data) {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delay)
  })
}

// ====================== 带 TTL 的请求缓存 ======================
class RequestCache {
  /**
   * @param {number} defaultTTL 默认缓存过期时间（毫秒）
   */
  constructor(defaultTTL = 5000) {
    this.defaultTTL = defaultTTL
    this.cache = new Map()  // key → { data, expireTime }
  }

  /**
   * 发起请求（自动缓存）
   * @param {string}   key
   * @param {Function} requestFn
   * @param {number}   ttl 可选，覆盖默认 TTL
   */
  async request(key, requestFn, ttl) {
    const expireTime = this.cache.has(key)
      ? this.cache.get(key).expireTime
      : 0

    // 缓存未过期 → 直接返回
    if (Date.now() < expireTime) {
      console.log(`  [缓存命中] "${key}"`)
      return this.cache.get(key).data
    }

    // 缓存过期 / 没有缓存 → 重新请求
    console.log(`  [请求] "${key}"`)
    const data = await requestFn()

    // 缓存结果
    this.cache.set(key, {
      data,
      expireTime: Date.now() + (ttl || this.defaultTTL)
    })

    return data
  }

  /** 主动删除缓存 */
  delete(key) {
    this.cache.delete(key)
  }

  /** 清空所有缓存 */
  clear() {
    this.cache.clear()
  }
}

module.exports = { RequestCache, mockRequest }

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试请求缓存 ==========')

  const cache = new RequestCache(300)  // 300ms TTL

  let fetchCount = 0
  function fetchData(id) {
    return mockRequest(100, `数据_${id}_第${++fetchCount}次请求`)
  }

  async function test() {
    console.log('\n--- 测试TTL缓存 ---')
    // 第一次请求
    const r1 = await cache.request('key1', () => fetchData('A'))
    console.log('r1:', r1)

    // 立即再请求 → 缓存命中
    const r2 = await cache.request('key1', () => fetchData('A'))
    console.log('r2:', r2)

    // 等缓存过期后再请求
    console.log('等待缓存过期...')
    await new Promise(r => setTimeout(r, 400))
    const r3 = await cache.request('key1', () => fetchData('A'))
    console.log('r3:', r3)  // 重新请求了

    // 测试删除缓存
    console.log('\n--- 测试删除缓存 ---')
    cache.delete('key1')
    console.log('删除缓存后，再次请求会重新获取')

    console.log('\n========== 请求缓存测试完成 ==========')
  }

  test()
}
