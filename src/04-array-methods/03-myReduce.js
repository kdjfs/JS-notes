/**
 * 手写 Array.prototype.reduce
 *
 * 面试一句话原理：
 * 用 accumulator 累计遍历结果，每次调用 callback 把当前值和 accumulator 合并，
 * 最后返回最终的 accumulator。
 *
 * 核心步骤：
 * 1. 校验 this 和 callback
 * 2. 判断是否传入 initialValue：
 *    - 传了 → accumulator = initialValue，从 i=0 开始遍历
 *    - 没传 → 拿第一个有效元素当 accumulator，从 i=1 开始遍历
 * 3. 遍历调用 callback(accumulator, currentValue, index, array)
 * 4. 返回最终 accumulator
 *
 * 关键易错点：
 * - 如何判断"是否传了 initialValue"？
 *   ❌ if (initialValue) — 无法区分"没传"和"传了 undefined/0/false"
 *   ❌ if (initialValue === undefined) — 无法区分"没传"和"传了 undefined"
 *   ✅ 用 arguments.length >= 2 — 准确判断调用时是否真传了第二个参数
 *
 * - 空数组 + 没有 initialValue → TypeError（面试必问的边界）
 */

/**
 * @param {Function} callback     (accumulator, currentValue, index, array) => newAccumulator
 * @param {*}        initialValue 初始累计值（可选）
 * @returns {*} 最终累计结果
 */
Array.prototype.myReduce = function (callback, initialValue) {
  if (this == null) {
    throw new TypeError('Cannot read properties of null/undefined')
  }
  if (typeof callback !== 'function') {
    throw new TypeError('callback is not a function')
  }

  const arr = Object(this)
  const length = arr.length >>> 0

  let accumulator
  let startIndex = 0

  // ---- 判断是否传入了 initialValue ----
  // 为什么用 arguments.length 而不是 initialValue === undefined？
  // 因为用户可能明确传入 undefined：arr.reduce(fn, undefined) 也算传了第二个参数
  if (arguments.length >= 2) {
    // 传了初始值：直接使用
    accumulator = initialValue
    // startIndex 仍为 0，从第一个元素开始
  } else {
    // 没传初始值：拿第一个有效元素当累计值
    // 需要找到第一个有效元素（跳过稀疏空位）
    let found = false
    for (let i = 0; i < length; i++) {
      if (i in arr) {
        accumulator = arr[i]
        startIndex = i + 1  // 从这个元素的下一个开始遍历
        found = true
        break
      }
    }
    // 空数组且没有 initialValue → 报错
    if (!found) {
      throw new TypeError('Reduce of empty array with no initial value')
    }
  }

  // ---- 遍历累计 ----
  for (let i = startIndex; i < length; i++) {
    // 跳过稀疏空位
    if (i in arr) {
      accumulator = callback.call(undefined, accumulator, arr[i], i, arr)
    }
  }

  return accumulator
}

module.exports = Array.prototype.myReduce

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试 myReduce ==========')

  // 测试1：求和（有初始值）
  console.log('\n--- 测试1：求和（有初始值） ---')
  const sum = [1, 2, 3, 4].myReduce((acc, val) => acc + val, 0)
  console.log('求和结果:', sum)  // 10

  // 测试2：求和（无初始值）
  console.log('\n--- 测试2：求和（无初始值） ---')
  const sum2 = [1, 2, 3, 4].myReduce((acc, val) => acc + val)
  console.log('无初始值求和:', sum2)  // 10

  // 测试3：数组扁平化
  console.log('\n--- 测试3：数组扁平化 ---')
  const flattened = [[1, 2], [3, 4], [5]].myReduce((acc, val) => acc.concat(val), [])
  console.log('扁平结果:', flattened)  // [1, 2, 3, 4, 5]

  // 测试4：统计元素出现次数
  console.log('\n--- 测试4：统计次数 ---')
  const fruits = ['apple', 'banana', 'apple', 'orange', 'banana', 'apple']
  const count = fruits.myReduce((acc, fruit) => {
    acc[fruit] = (acc[fruit] || 0) + 1
    return acc
  }, {})
  console.log('水果统计:', count)  // { apple: 3, banana: 2, orange: 1 }

  // 测试5：空数组 + initialValue
  console.log('\n--- 测试5：空数组 + initialValue ---')
  const emptyRes = [].myReduce((acc, v) => acc + v, 100)
  console.log('空数组+初始值:', emptyRes)  // 100

  // 测试6：空数组 + 无 initialValue → 报错
  console.log('\n--- 测试6：空数组 + 无初始值 → 报错 ---')
  try {
    [].myReduce((acc, v) => acc + v)
  } catch (e) {
    console.log('TypeError:', e instanceof TypeError ? '✅ 正确报错' : '❌')
  }

  // 测试7：传入 undefined 作为 initialValue（应该算传了）
  console.log('\n--- 测试7：initialValue = undefined ---')
  const res7 = [1, 2].myReduce((acc, v) => {
    console.log('callback 已执行, acc:', acc)
    return v
  }, undefined)
  console.log('结果:', res7)  // 2

  // 测试8：稀疏数组
  console.log('\n--- 测试8：稀疏数组 ---')
  const sparse = [1, , 3]
  const sparseRes = sparse.myReduce((acc, v) => acc + v, 0)
  console.log('稀疏求和:', sparseRes)  // 4（空位跳过）

  // 测试9：非函数 callback
  console.log('\n--- 测试9：非函数 callback ---')
  try {
    [1].myReduce('abc')
  } catch (e) {
    console.log('TypeError:', e instanceof TypeError)
  }

  console.log('\n========== myReduce 测试完成 ==========')
}
