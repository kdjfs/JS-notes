/**
 * 数组交集 / 并集 / 差集（基于 Set）
 *
 * 面试一句话原理：
 * 用 Set 的唯一性快速去重和判断元素存在，交集用 filter+has，并集用 Set 合并，
 * 差集用 filter 留下不在另一个 Set 中的元素。
 *
 * 时间复杂度：
 * - 交集：O(n + m)，建 Set O(n) + filter O(m)
 * - 并集：O(n + m)
 * - 差集：O(n + m)
 */

/**
 * 交集：两个数组都有的元素
 * a ∩ b = { x | x ∈ a 且 x ∈ b }
 */
function intersection(a, b) {
  const setB = new Set(b)
  // 对 a 先去重再过滤，确保结果无重复
  return [...new Set(a)].filter(item => setB.has(item))
}

/**
 * 并集：两个数组所有元素（去重）
 * a ∪ b = { x | x ∈ a 或 x ∈ b }
 */
function union(a, b) {
  // 直接把两个数组合并再做 Set 去重
  return [...new Set([...a, ...b])]
}

/**
 * 差集：在 a 中但不在 b 中的元素
 * a - b = { x | x ∈ a 且 x ∉ b }
 */
function difference(a, b) {
  const setB = new Set(b)
  return [...new Set(a)].filter(item => !setB.has(item))
}

module.exports = { intersection, union, difference }

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试数组集合运算 ==========')

  const arr1 = [1, 2, 3, 4, 5]
  const arr2 = [3, 4, 5, 6, 7]

  console.log('\n数组1:', arr1)
  console.log('数组2:', arr2)

  // 测试1：交集
  console.log('\n--- 测试1：交集 ---')
  console.log('交集:', intersection(arr1, arr2))  // [3, 4, 5]

  // 测试2：并集
  console.log('\n--- 测试2：并集 ---')
  console.log('并集:', union(arr1, arr2))  // [1, 2, 3, 4, 5, 6, 7]

  // 测试3：差集
  console.log('\n--- 测试3：差集 ---')
  console.log('arr1 - arr2:', difference(arr1, arr2))  // [1, 2]
  console.log('arr2 - arr1:', difference(arr2, arr1))  // [6, 7]

  // 测试4：含有重复值的数组
  console.log('\n--- 测试4：重复值 ---')
  console.log('交集:', intersection([1, 1, 2], [1, 1, 3]))  // [1]
  console.log('并集:', union([1, 1, 2], [2, 3, 3]))         // [1, 2, 3]

  // 测试5：空数组
  console.log('\n--- 测试5：空数组 ---')
  console.log('交集:', intersection([], [1, 2]))   // []
  console.log('并集:', union([], [1, 2]))          // [1, 2]
  console.log('差集:', difference([1, 2], []))     // [1, 2]

  console.log('\n========== 集合运算测试完成 ==========')
}
