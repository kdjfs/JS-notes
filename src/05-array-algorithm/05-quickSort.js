/**
 * 快速排序
 *
 * 面试一句话原理：
 * 选基准值 pivot，小于基准放左边，大于放右边，等于放中间，递归排好左右两边再拼接。
 *
 * 核心步骤：
 * 1. 选数组中间元素作 pivot（或第一个/最后一个）
 * 2. 遍历数组，比 pivot 小的放 left，大的放 right，等于放 equal
 * 3. 递归对 left 和 right 排序
 * 4. 返回 [...quickSort(left), ...equal, ...quickSort(right)]
 *
 * 时间复杂度：
 * - 平均 O(n log n)
 * - 最坏 O(n²)（每次 pivot 都是最大/最小值，数组已排序时）
 *
 * 空间复杂度：O(n)（非原地版本创建了新数组）
 *
 * 为什么面试推荐非原地版本？
 * 原地双指针版更难写对（分区逻辑容易写错），非原地版更容易在面试白板上一次写对。
 */

/**
 * @param {Array} arr 待排序数组
 * @returns {Array} 排序后新数组（不修改原数组）
 */
function quickSort(arr) {
  // 递归终止：数组长度为 0 或 1，已经有序
  if (arr.length <= 1) return arr

  // 选基准值：取中间位置（避免已排序数组取第一个/最后一个造成最坏情况）
  const pivotIndex = Math.floor(arr.length / 2)
  const pivot = arr[pivotIndex]

  const left  = []  // 小于 pivot
  const equal = []  // 等于 pivot（处理重复值）
  const right = []  // 大于 pivot

  for (const item of arr) {
    if (item < pivot) {
      left.push(item)
    } else if (item > pivot) {
      right.push(item)
    } else {
      equal.push(item)
    }
  }

  // 递归排序左右，拼接
  return [...quickSort(left), ...equal, ...quickSort(right)]
}

module.exports = quickSort

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试快速排序 ==========')

  // 测试1：乱序
  console.log('\n--- 测试1：乱序 ---')
  const arr1 = [3, 1, 4, 1, 5, 9, 2, 6]
  console.log('输入:', arr1)
  console.log('输出:', quickSort(arr1))        // [1,1,2,3,4,5,6,9]
  console.log('原数组:', arr1)                 // 未修改

  // 测试2：已排序
  console.log('\n--- 测试2：已排序 ---')
  console.log('输出:', quickSort([1, 2, 3, 4, 5]))  // [1,2,3,4,5]

  // 测试3：逆序
  console.log('\n--- 测试3：逆序 ---')
  console.log('输出:', quickSort([5, 4, 3, 2, 1]))  // [1,2,3,4,5]

  // 测试4：全是重复
  console.log('\n--- 测试4：全部重复 ---')
  console.log('输出:', quickSort([7, 7, 7, 7]))  // [7,7,7,7]

  // 测试5：空数组 / 单元素
  console.log('\n--- 测试5：边界 ---')
  console.log('空数组:', quickSort([]))          // []
  console.log('单元素:', quickSort([42]))        // [42]

  // 测试6：负数
  console.log('\n--- 测试6：负数 ---')
  console.log('输出:', quickSort([-3, 10, -1, 0, 5]))  // [-3, -1, 0, 5, 10]

  console.log('\n========== 快速排序测试完成 ==========')
}
