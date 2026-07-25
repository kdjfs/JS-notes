/**
 * 数组去重
 *
 * 面试一句话原理：
 * Set 天然去重（值唯一），O(n) 一行代码搞定；手写版用循环 + includes/indexOf 遍历检查。
 *
 * 时间复杂度：
 * - Set 版：O(n)
 * - 循环版：O(n²)（indexOf/includes 内部也要遍历）
 *
 * NaN 处理注意：
 * - Set 和 Map 认为 NaN === NaN（虽然 JS 中 NaN !== NaN）
 * - indexOf/includes 遵循 SameValueZero，NaN 也能被识别为重复
 *
 * 对象数组去重注意事项：
 * - {a:1} !== {a:1}（引用不同），Set 不能直接去重对象数组
 * - 需要根据对象的某个字段（如 id）去重
 */

// ====================== 方式1：Set（推荐背诵版） ======================
function uniqueBySet(arr) {
  return [...new Set(arr)]
}

// ====================== 方式2：循环 + includes ======================
// 面试官禁止 Set/M 时使用
function uniqueByLoop(arr) {
  const result = []
  for (const item of arr) {
    // includes 使用 SameValueZero 算法，NaN 能被正确识别
    if (!result.includes(item)) {
      result.push(item)
    }
  }
  return result
}

// ====================== 方式3：对象数组按字段去重 ======================
/**
 * 根据对象的指定字段去重（保留第一次出现的）
 * @param {Array}  arr   对象数组
 * @param {string} field 用来判断重复的字段名
 * @returns {Array} 去重后的新数组
 */
function uniqueByField(arr, field) {
  const seen = new Set()
  return arr.filter(item => {
    const key = item[field]
    if (seen.has(key)) {
      return false  // 已经出现过，过滤掉
    }
    seen.add(key)
    return true  // 第一次出现，保留
  })
}

module.exports = { uniqueBySet, uniqueByLoop, uniqueByField }

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试数组去重 ==========')

  // 测试1：基本类型去重
  console.log('\n--- 测试1：基本类型 ---')
  const arr1 = [1, 2, 2, 3, 3, 3, 1]
  console.log('Set版:', uniqueBySet(arr1))    // [1, 2, 3]
  console.log('循环版:', uniqueByLoop(arr1))   // [1, 2, 3]

  // 测试2：NaN 去重
  console.log('\n--- 测试2：NaN 去重 ---')
  const nanArr = [NaN, NaN, 1, NaN]
  console.log('Set版:', uniqueBySet(nanArr))    // [NaN, 1] — NaN 被去重
  console.log('循环版:', uniqueByLoop(nanArr))  // [NaN, 1] — includes 也能识别 NaN

  // 测试3：对象数组按字段去重
  console.log('\n--- 测试3：按字段去重 ---')
  const users = [
    { id: 1, name: '张三' },
    { id: 2, name: '李四' },
    { id: 1, name: '张三-重复' },
    { id: 3, name: '王五' }
  ]
  console.log('按id去重:', uniqueByField(users, 'id'))
  // 预期保留前两个 + id=3，去掉了第二个 id=1

  // 测试4：undefined / null 去重
  console.log('\n--- 测试4：特殊值去重 ---')
  const specialArr = [undefined, null, undefined, null, 0, false, '']
  console.log('Set版:', uniqueBySet(specialArr))   // [undefined, null, 0, false, '']
  console.log('循环版:', uniqueByLoop(specialArr))

  console.log('\n========== 数组去重测试完成 ==========')
}
