/**
 * 数组实用函数：groupBy / chunkArray / shuffle
 *
 * 1. groupBy：根据字段名或回调函数对数组分组
 * 2. chunkArray：按指定 size 分块切割数组
 * 3. shuffle：Fisher-Yates 洗牌算法（O(n)，真正随机）
 */

// ====================== groupBy ======================
/**
 * 面试一句话原理：
 * 用对象或 Map 分组，key 来自字段名或回调函数，value 是对应元素的数组。
 *
 * @param {Array}         arr  待分组数组
 * @param {string|Function} keyOrFn  字段名字符串 或 返回分组键的回调函数
 * @returns {Object} 分组对象 { key1: [...], key2: [...] }
 */
function groupBy(arr, keyOrFn) {
  const result = {}
  const getKey = typeof keyOrFn === 'function'
    ? keyOrFn
    : (item) => item[keyOrFn]  // 字段名 → 取值函数

  for (const item of arr) {
    const key = getKey(item)
    // 如果该 key 还没出现过，先初始化空数组
    if (!result[key]) {
      result[key] = []
    }
    result[key].push(item)
  }

  return result
}

// ====================== chunkArray ======================
/**
 * 面试一句话原理：
 * 用 for 循环每次取 size 个元素，slice(i, i+size)，直到遍历完整个数组。
 *
 * @param {Array}  arr  原数组
 * @param {number} size 每块大小
 * @returns {Array<Array>} 二维数组
 */
function chunkArray(arr, size) {
  if (!Number.isInteger(size) || size <= 0) {
    throw new TypeError('size 必须是正整数')
  }

  const result = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

// ====================== shuffle ======================
/**
 * 面试一句话原理：
 * Fisher-Yates：从最后一个元素开始，随机选取它或它前面的一个元素与之交换，向前推进。
 * 每个排列概率都是 1/n!，真正均匀随机。
 *
 * 为什么不用 sort(() => Math.random() - 0.5)？
 * 1. 非均匀：不同浏览器的排序算法不同，某些元素被换到某些位置的概率更高
 * 2. 慢：sort 是 O(n log n)，Fisher-Yates 是 O(n)
 * 3. 不规范：sort 的比较函数应该是确定性的，random 破坏了这一约定
 *
 * @param {Array} arr 原数组（不修改）
 * @returns {Array} 打乱后的新数组
 */
function shuffle(arr) {
  // 拷贝一份，避免修改原数组
  const result = [...arr]

  // 从最后一个元素往前遍历
  for (let i = result.length - 1; i > 0; i--) {
    // 随机选取 [0, i] 范围内的一个下标
    const j = Math.floor(Math.random() * (i + 1))
    // 交换 arr[i] 和 arr[j]
    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}

module.exports = { groupBy, chunkArray, shuffle }

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试数组实用函数 ==========')

  // ---- groupBy ----
  console.log('\n--- 测试1：groupBy 按字段 ---')
  const users = [
    { name: '张三', role: 'admin' },
    { name: '李四', role: 'user' },
    { name: '王五', role: 'admin' }
  ]
  console.log(groupBy(users, 'role'))

  console.log('\n--- 测试2：groupBy 按函数 ---')
  const nums = [1, 2, 3, 4, 5, 6]
  console.log(groupBy(nums, n => n % 2 === 0 ? '偶数' : '奇数'))

  // ---- chunkArray ----
  console.log('\n--- 测试3：chunkArray ---')
  const arr = [1, 2, 3, 4, 5, 6, 7]
  console.log('size=2:', chunkArray(arr, 2))  // [[1,2],[3,4],[5,6],[7]]
  console.log('size=3:', chunkArray(arr, 3))  // [[1,2,3],[4,5,6],[7]]
  console.log('size=10:', chunkArray(arr, 10)) // [[1,2,3,4,5,6,7]]

  console.log('\n--- 测试4：chunkArray 边界 ---')
  console.log('空数组:', chunkArray([], 3))  // []
  try {
    chunkArray([1, 2], 0)
  } catch (e) {
    console.log('size=0 报错:', e instanceof TypeError)
  }

  // ---- shuffle ----
  console.log('\n--- 测试5：shuffle ---')
  const original = [1, 2, 3, 4, 5]
  const shuffled = shuffle(original)
  console.log('原数组:', original)
  console.log('打乱后:', shuffled)
  console.log('原数组未修改:', JSON.stringify(original) === '[1,2,3,4,5]' ? '✅' : '❌')

  console.log('\n========== 数组实用函数测试完成 ==========')
}
