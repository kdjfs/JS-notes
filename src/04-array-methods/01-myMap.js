/**
 * 手写 Array.prototype.map
 *
 * 面试一句话原理：
 * 遍历原数组每个元素，用回调函数处理后的返回值组成新数组，不修改原数组。
 *
 * 核心步骤：
 * 1. 校验 this 是数组，callback 是函数
 * 2. 创建结果数组（长度和原数组一致）
 * 3. 遍历原数组，跳过稀疏空位
 * 4. 对每个有效元素调用 callback，结果存入对应下标
 * 5. 返回新数组
 *
 * callback 接收三个参数：currentValue, index, array
 * thisArg：指定 callback 内部的 this
 * 核心实现禁止调用原生 map
 */

/**
 * @param {Function} callback 处理函数 (value, index, array) => newValue
 * @param {*}        thisArg  callback 内部的 this 指向
 * @returns {Array} 新数组
 */
Array.prototype.myMap = function (callback, thisArg) {
  // 校验：this 必须是数组或类数组
  if (this == null) {
    throw new TypeError('Cannot read properties of null/undefined')
  }
  // 校验：callback 必须是函数
  if (typeof callback !== 'function') {
    throw new TypeError('callback is not a function')
  }

  const arr = Object(this)          // 转为对象（处理类数组）
  const length = arr.length >>> 0    // 确保 length 是非负整数
  const result = new Array(length)   // 新数组，长度和原数组一致

  for (let i = 0; i < length; i++) {
    // 兼容稀疏数组：只有索引真实存在才处理
    // 为什么用 in 而不用 arr[i] !== undefined？
    // 因为 arr[i] 为 undefined 时，可能是值本来就是 undefined，也可能是空位。
    // in 运算符可以区分"属性存在但值为 undefined"和"属性不存在"。
    if (i in arr) {
      // callback 绑定 thisArg，传入 value, index, 原数组本身
      result[i] = callback.call(thisArg, arr[i], i, arr)
    }
    // 空位不处理，result[i] 保持空位（empty）
  }

  return result
}

module.exports = Array.prototype.myMap

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试 myMap ==========')

  // 测试1：基本使用
  console.log('\n--- 测试1：基本使用 ---')
  const arr1 = [1, 2, 3]
  const result1 = arr1.myMap(x => x * 2)
  console.log('原数组:', arr1)       // [1, 2, 3]（未修改）
  console.log('myMap 结果:', result1) // [2, 4, 6]
  console.log('原生 map 结果:', arr1.map(x => x * 2))  // 对比

  // 测试2：callback 传入 index 和 array
  console.log('\n--- 测试2：callback 参数 ---')
  const arr2 = ['a', 'b']
  arr2.myMap((value, index, array) => {
    console.log(`value: ${value}, index: ${index}, array: [${array}]`)
    return value + index
  })

  // 测试3：thisArg 绑定
  console.log('\n--- 测试3：thisArg ---')
  const multiplier = {
    factor: 10,
    multiply(n) { return n * this.factor }
  }
  const arr3 = [1, 2, 3]
  const result3 = arr3.myMap(multiplier.multiply, multiplier)
  console.log('thisArg 绑定结果:', result3)  // [10, 20, 30]

  // 测试4：稀疏数组
  console.log('\n--- 测试4：稀疏数组 ---')
  const sparseArr = [1, , 3]  // 下标1是空位
  const sparseResult = sparseArr.myMap(x => x)
  console.log('稀疏数组原:', sparseArr)
  console.log('myMap 后:', sparseResult)
  console.log('下标1存在吗?', 1 in sparseResult)  // false（空位保留）

  // 测试5：非函数 callback 抛出 TypeError
  console.log('\n--- 测试5：非函数 callback ---')
  try {
    [1].myMap('not a function')
  } catch (e) {
    console.log('抛出 TypeError:', e instanceof TypeError)
  }

  console.log('\n========== myMap 测试完成 ==========')
}
