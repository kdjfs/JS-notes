/**
 * 方式1：reduce递归实现数组扁平化
 * @param {Array} arr 多维嵌套数组
 * @returns {Array} 一维数组
 */
function flatten(arr) {
  return arr.reduce((result, item) => {
    // 当前项为数组则递归展开，普通值直接拼接
    return result.concat(Array.isArray(item) ? flatten(item) : item)
  }, [])
}

/**
 * 方式2：for循环递归实现数组扁平化
 * @param {Array} arr 多维嵌套数组
 * @returns {Array} 一维数组
 */
function flattenByLoop(arr) {
  const result = []
  for (const item of arr) {
    if (Array.isArray(item)) {
      // 递归铺平子数组，展开后批量推入
      result.push(...flattenByLoop(item))
    } else {
      result.push(item)
    }
  }
  return result
}
//方式3
// nestArr.flat(3)


// 测试用例
const nestArr = [1, [2, [3, [4, 5], 6], 7], 8]
console.log(flatten(nestArr))
console.log(flattenByLoop(nestArr))
console.log('浏览器自带的flat APi方法',nestArr.flat(3))