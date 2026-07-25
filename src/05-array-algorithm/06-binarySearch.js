/**
 * 二分查找
 *
 * 面试一句话原理：
 * 每次取中间元素和目标比较，目标更小就去左半找，更大就去右半找，每次排除一半。
 *
 * 核心步骤：
 * 1. 两个指针 left=0、right=arr.length-1
 * 2. 循环条件 left <= right（等号很重要：只剩一个元素时也要检查）
 * 3. mid = Math.floor((left + right) / 2)
 * 4. arr[mid] === target → 找到返回索引
 * 5. arr[mid] < target  → left = mid + 1（去右边）
 * 6. arr[mid] > target  → right = mid - 1（去左边）
 * 7. 循环结束没找到 → 返回 -1
 *
 * 时间复杂度：O(log n)
 * 空间复杂度：O(1)
 *
 * 为什么循环条件是 left <= right 而不是 left < right？
 * 当 left === right 时，区间里还剩一个元素需要判断。
 * 用 left < right 会漏掉最后一个元素。
 *
 * 防溢出写法（面试加分项）：
 * mid = left + Math.floor((right - left) / 2)
 * 避免 left + right 超过 JS 安全整数范围（虽然数组长度通常不会那么大）
 */

/**
 * @param {Array}  arr    升序排序数组
 * @param {*}      target 目标值
 * @returns {number} 目标索引，找不到返回 -1
 */
function binarySearch(arr, target) {
  let left = 0
  let right = arr.length - 1

  // 等号：区间只有一个元素时仍需检查
  while (left <= right) {
    // 取中间下标（防溢出版本）
    const mid = left + Math.floor((right - left) / 2)

    if (arr[mid] === target) {
      return mid  // 找到了
    }

    if (arr[mid] < target) {
      left = mid + 1   // target 在右边，左边界右移
    } else {
      right = mid - 1  // target 在左边，右边界左移
    }
  }

  return -1  // 没找到
}

/**
 * 扩展：查找第一个等于 target 的索引（数组有重复值时）
 * 当找到 target 时不直接返回，继续向左搜索。
 */
function binarySearchFirst(arr, target) {
  let left = 0
  let right = arr.length - 1
  let result = -1

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2)

    if (arr[mid] === target) {
      result = mid         // 记录当前位置
      right = mid - 1      // 继续向左搜索
    } else if (arr[mid] < target) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  return result
}

module.exports = { binarySearch, binarySearchFirst }

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试二分查找 ==========')

  const arr = [1, 3, 5, 7, 9, 11, 13]

  // 测试1：存在
  console.log('\n--- 测试1：存在 ---')
  console.log('查找 7:', binarySearch(arr, 7))   // 3
  console.log('查找 1:', binarySearch(arr, 1))   // 0
  console.log('查找 13:', binarySearch(arr, 13)) // 6

  // 测试2：不存在
  console.log('\n--- 测试2：不存在 ---')
  console.log('查找 4:', binarySearch(arr, 4))   // -1
  console.log('查找 0:', binarySearch(arr, 0))   // -1
  console.log('查找 20:', binarySearch(arr, 20)) // -1

  // 测试3：空数组
  console.log('\n--- 测试3：空数组 ---')
  console.log('空数组:', binarySearch([], 1))    // -1

  // 测试4：查找第一个等于 target 的索引
  console.log('\n--- 测试4：查找第一个等于 target ---')
  const arr2 = [1, 2, 2, 2, 3, 4, 4, 5]
  console.log('查找第一个 2:', binarySearchFirst(arr2, 2))  // 1
  console.log('查找第一个 4:', binarySearchFirst(arr2, 4))  // 5

  console.log('\n========== 二分查找测试完成 ==========')
}
