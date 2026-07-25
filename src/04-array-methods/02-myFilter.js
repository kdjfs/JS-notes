/**
 * 手写 Array.prototype.filter
 *
 * 面试一句话原理：
 * 遍历原数组，只保留 callback 返回真值的元素，组成新数组，不修改原数组。
 *
 * 核心步骤：
 * 1. 校验 this 和 callback
 * 2. 遍历原数组，跳过稀疏空位
 * 3. 对每个有效元素调用 callback
 * 4. callback 返回真值 → 加入结果数组
 * 5. 返回结果数组
 *
 * 和 map 的区别：map 保留所有元素，filter 只保留 true 的元素
 * 和 find 的区别：find 只返回第一个匹配元素，filter 返回所有匹配
 */

/**
 * @param {Function} callback 判断函数 (value, index, array) => boolean
 * @param {*}        thisArg  callback 内部的 this
 * @returns {Array} 只包含通过测试的元素的新数组
 */
Array.prototype.myFilter = function (callback, thisArg) {
  if (this == null) {
    throw new TypeError('Cannot read properties of null/undefined')
  }
  if (typeof callback !== 'function') {
    throw new TypeError('callback is not a function')
  }

  const arr = Object(this)
  const length = arr.length >>> 0
  const result = []  // filter 返回的数组长度不定，用 push

  for (let i = 0; i < length; i++) {
    // 跳过稀疏空位——空位不调用 callback，也不加入结果
    if (i in arr) {
      // callback 返回真值才加入
      if (callback.call(thisArg, arr[i], i, arr)) {
        result.push(arr[i])
      }
    }
  }

  return result
}

module.exports = Array.prototype.myFilter

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试 myFilter ==========')

  // 测试1：基本过滤
  console.log('\n--- 测试1：基本过滤 ---')
  const arr1 = [1, 2, 3, 4, 5, 6]
  const result1 = arr1.myFilter(x => x % 2 === 0)
  console.log('偶数:', result1)             // [2, 4, 6]
  console.log('原数组:', arr1)              // [1,2,3,4,5,6]（未修改）

  // 测试2：过滤假值
  console.log('\n--- 测试2：过滤假值 ---')
  const arr2 = [0, '', false, null, undefined, NaN, 1, 'hello']
  const result2 = arr2.myFilter(Boolean)
  console.log('真值:', result2)  // [1, 'hello']

  // 测试3：callback 参数
  console.log('\n--- 测试3：callback 参数 ---')
  const arr3 = ['a', 'b', 'c']
  arr3.myFilter((value, index, array) => {
    console.log(`value: ${value}, index: ${index}`)
    return index > 0  // 保留下标>0的
  })

  // 测试4：thisArg 绑定
  console.log('\n--- 测试4：thisArg ---')
  const range = {
    min: 3,
    max: 5,
    inRange(n) { return n >= this.min && n <= this.max }
  }
  const arr4 = [1, 2, 3, 4, 5, 6, 7]
  console.log('3~5的范围:', arr4.myFilter(range.inRange, range))  // [3, 4, 5]

  // 测试5：稀疏数组
  console.log('\n--- 测试5：稀疏数组 ---')
  const sparseArr = [1, , 3, , 5]
  const sparseResult = sparseArr.myFilter(x => true)
  console.log('稀疏过滤后长度:', sparseResult.length)  // 3（空位被跳过）

  // 测试6：空数组
  console.log('\n--- 测试6：空数组 ---')
  const emptyResult = [].myFilter(x => true)
  console.log('空数组结果:', emptyResult)  // []

  // 测试7：非函数 callback 报错
  console.log('\n--- 测试7：非函数 callback ---')
  try {
    [1].myFilter('abc')
  } catch (e) {
    console.log('TypeError:', e instanceof TypeError)
  }

  console.log('\n========== myFilter 测试完成 ==========')
}
