/**
 * memoize（函数记忆化 / 缓存结果）
 *
 * 面试一句话原理：
 * 用闭包保存 Map 缓存，key 由参数决定，首次调用时执行原函数并缓存结果，
 * 后续相同参数直接返回缓存值。
 *
 * 核心步骤：
 * 1. 创建缓存 Map
 * 2. 生成缓存的 key（默认 JSON.stringify 参数）
 * 3. 如果 key 在缓存中 → 直接返回
 * 4. 不在缓存中 → 执行原函数，存入缓存，返回结果
 *
 * 局限性：
 * - JSON.stringify 不能序列化函数、Symbol、undefined、循环引用
 * - 适合纯函数（相同输入一定返回相同输出）
 * - 缓存不会过期，永久占用内存
 */

/**
 * @param {Function} fn       需要缓存的函数
 * @param {Function} resolver  自定义 key 生成函数，默认 JSON.stringify
 * @returns {Function} 带缓存的函数
 */
function memoize(fn, resolver) {
  // 缓存容器放在闭包中，外部无法访问
  const cache = new Map()

  return function (...args) {
    // key：默认用 JSON 序列化参数
    // 支持自定义 resolver（例如想只根据第一个参数缓存）
    const key = resolver ? resolver(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      console.log('  [缓存命中]')
      return cache.get(key)
    }

    // 首次计算，存入缓存
    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  }
}

module.exports = memoize

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试 memoize ==========')

  // 测试1：基本缓存
  console.log('\n--- 测试1：基本缓存 ---')
  let callCount = 0
  const expensiveAdd = (a, b) => {
    callCount++
    console.log('  实际执行 expensiveAdd')
    return a + b
  }

  const memoAdd = memoize(expensiveAdd)
  console.log('第一次 memoAdd(1, 2):', memoAdd(1, 2))  // 实际执行
  console.log('第二次 memoAdd(1, 2):', memoAdd(1, 2))  // 缓存命中
  console.log('第三次 memoAdd(2, 3):', memoAdd(2, 3))  // 实际执行
  console.log('总执行次数:', callCount, callCount === 2 ? '✅ (2次)' : '❌')

  // 测试2：自定义 resolver
  console.log('\n--- 测试2：自定义 resolver ---')
  let apiCount = 0
  const fetchUser = (id, token) => {
    apiCount++
    return { id, name: `user_${id}` }
  }

  // 只根据第一个参数 id 缓存，忽略 token
  const memoFetch = memoize(fetchUser, (id) => id)
  console.log('第一次 fetch(1, "tokenA"):', memoFetch(1, 'tokenA'))
  console.log('第二次 fetch(1, "tokenB"):', memoFetch(1, 'tokenB'))  // 缓存命中！
  console.log('API 调用次数:', apiCount, apiCount === 1 ? '✅ (1次)' : '❌')

  // 测试3：JSON.stringify 的局限
  console.log('\n--- 测试3：JSON.stringify 局限 ---')
  console.log('JSON.stringify([1,2,3]) =', JSON.stringify([1, 2, 3]))
  console.log('JSON.stringify({a:1})  =', JSON.stringify({ a: 1 }))
  console.log('注意：参数顺序不同会生成不同的 key')
  console.log('  [1,2] →', JSON.stringify([1, 2]))
  console.log('  [2,1] →', JSON.stringify([2, 1]))
  console.log('  （两次不同 key，不会共享缓存）')

  console.log('\n========== memoize 测试完成 ==========')
}
