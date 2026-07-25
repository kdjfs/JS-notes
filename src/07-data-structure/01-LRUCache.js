/**
 * LRU Cache（最近最少使用缓存）
 *
 * 面试一句话原理：
 * 利用 Map 的插入顺序维护访问先后，get 和 put 时 delete+set 把元素移到最新位置，
 * 超出容量时删除 Map 的第一个元素（最久未使用）。
 *
 * 核心步骤：
 * 1. 使用 Map 存储 key → value
 * 2. get：删除旧 key 再重新 set（移到最新），返回 value
 * 3. put：删除旧 key 再 set（更新/添加+移最新），超出 capacity 删第一条
 *
 * 时间复杂度：get O(1)，put O(1)
 *
 * 为什么 Map 可以？
 * Map 会记住插入顺序，keys() 返回的第一个就是最早插入的。
 * delete(key) + set(key, value) 不会改变 Map 内部顺序——必须删了再设。
 * 生产级方案用双向链表 + Map，但 Map 版适合面试手写。
 */

class LRUCache {
  /**
   * @param {number} capacity 缓存容量
   */
  constructor(capacity) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new TypeError('capacity 必须是正整数')
    }
    this.capacity = capacity
    this.cache = new Map()  // key → value
  }

  /**
   * 获取缓存值。如果 key 存在，将其移到最近使用位置。
   * @param {*} key
   * @returns {*} 缓存值或 -1
   */
  get(key) {
    if (!this.cache.has(key)) {
      return -1
    }
    // 核心：先取出来，再放回去 → 变成"最新使用"
    const value = this.cache.get(key)
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  /**
   * 存入缓存。如果容量满了，淘汰最久未使用的。
   * @param {*} key
   * @param {*} value
   */
  put(key, value) {
    // key 已存在 → 先删掉旧的（为了更新顺序）
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    // 容量满了 → 删除最久未使用的（Map 的第一个条目）
    if (this.cache.size >= this.capacity) {
      // cache.keys().next().value 是 Map 的第一个 key（最早插入的）
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    // 插入新值（自动排到最新位置）
    this.cache.set(key, value)
  }
}

/**
 * 极简背诵骨架：
 *
 * class LRUCache {
 *   constructor(n) { this.n = n; this.m = new Map() }
 *   get(k) {
 *     if (!this.m.has(k)) return -1
 *     const v = this.m.get(k); this.m.delete(k); this.m.set(k, v); return v
 *   }
 *   put(k, v) {
 *     if (this.m.has(k)) this.m.delete(k)
 *     if (this.m.size >= this.n) this.m.delete(this.m.keys().next().value)
 *     this.m.set(k, v)
 *   }
 * }
 *
 * 生产级方案：双向链表 + Map（key → 链表节点），自己维护顺序。
 */

module.exports = LRUCache

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试 LRU Cache ==========')

  const cache = new LRUCache(2)

  console.log('\n--- 初始状态 ---')
  cache.put(1, 1)
  console.log('put(1,1) → cache:', cache.cache)

  cache.put(2, 2)
  console.log('put(2,2) → cache:', cache.cache)

  console.log('\n--- 测试 get 移动 ---')
  console.log('get(1) =', cache.get(1))  // 1，同时 1 → 最新
  console.log('get(1) 后 cache 顺序:', [...cache.cache.keys()])  // [2, 1]

  console.log('\n--- 测试淘汰 ---')
  cache.put(3, 3)  // 容量=2，淘汰最久未使用的 key=2
  console.log('put(3,3) 后 cache:', [...cache.cache.entries()])
  console.log('get(2) =', cache.get(2))  // -1（已被淘汰）

  console.log('\n--- 测试更新已存在 ---')
  cache.put(1, 100)  // 更新 key=1 的值
  console.log('put(1,100) 后 cache:', [...cache.cache.entries()])

  console.log('\n--- 验证最终状态 ---')
  console.log('get(1) =', cache.get(1))  // 100
  console.log('get(3) =', cache.get(3))  // 3
  console.log('get(2) =', cache.get(2))  // -1

  console.log('\n========== LRU Cache 测试完成 ==========')
}
