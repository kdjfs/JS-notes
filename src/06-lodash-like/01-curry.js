/**
 * 手写柯里化 curry
 *
 * 面试一句话原理：
 * 用闭包保存已收集的参数，每次调用检查参数数量是否够 fn.length，够了就执行原函数，不够就返回新函数继续收集。
 *
 * 核心步骤：
 * 1. 闭包记录已收集的参数数组
 * 2. 每次调用时，合并新参数和旧参数
 * 3. 如果参数总数量 >= fn.length（原函数声明的参数个数），执行原函数
 * 4. 如果参数不够，返回一个新函数继续收集剩余参数
 *
 * 关键知识点：
 * - fn.length：函数定义时声明的参数个数（不包括 ...rest 和默认参数）
 * - 闭包中保存了什么：已收集到的全部参数数组
 * - 为什么每次调用都要拼接参数：因为柯里化支持分批传入参数
 */

/**
 * @param {Function} fn 需要柯里化的函数
 * @returns {Function} 柯里化后的函数
 */
function curry(fn) {
  if (typeof fn !== 'function') {
    throw new TypeError('curry requires a function')
  }

  // 闭包：返回一个递归收集参数的函数
  return function curried(...args) {
    // 参数够了 → 直接执行原函数
    if (args.length >= fn.length) {
      return fn.apply(this, args)
    }
    // 参数不够 → 返回新函数继续收集
    return function (...moreArgs) {
      // 将之前收集的 args 和新的 moreArgs 拼接，递归调用 curried
      return curried.apply(this, args.concat(moreArgs))
    }
  }
}

/**
 * 极简背诵骨架：
 *
 * function curry(fn) {
 *   return function curried(...args) {
 *     if (args.length >= fn.length) return fn(...args)
 *     return (...more) => curried(...args, ...more)
 *   }
 * }
 */

module.exports = curry

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试 curry ==========')

  function add(a, b, c) {
    return a + b + c
  }

  const curriedAdd = curry(add)

  // 测试1：一次传完
  console.log('\n--- 测试1：一次传完 ---')
  console.log('curriedAdd(1, 2, 3) =', curriedAdd(1, 2, 3))  // 6

  // 测试2：一个一个传
  console.log('\n--- 测试2：逐个传入 ---')
  console.log('curriedAdd(1)(2)(3) =', curriedAdd(1)(2)(3))  // 6

  // 测试3：分批传入
  console.log('\n--- 测试3：分批传入 ---')
  console.log('curriedAdd(1, 2)(3) =', curriedAdd(1, 2)(3))  // 6
  console.log('curriedAdd(1)(2, 3) =', curriedAdd(1)(2, 3))  // 6

  // 测试4：fn.length 的作用
  console.log('\n--- 测试4：fn.length ---')
  function greet(a, b, c) { return `${a} ${b} ${c}` }
  console.log('greet.length =', greet.length)  // 3（不包括 rest 参数）

  // 测试5：fn.length 含默认参数时为 0 的情况
  // function foo(a, b = 1) {} → foo.length = 1（默认值之后的不算）
  console.log('\n--- 测试5：参数过多也执行 ---')
  console.log('curriedAdd(1,2,3,4) =', curriedAdd(1, 2, 3, 4))  // 6（多余参数被忽略）

  // 测试6：实用场景——固定前缀
  console.log('\n--- 测试6：实用场景 ---')
  function log(level, time, message) {
    return `[${level}] ${time}: ${message}`
  }
  const errorLog = curry(log)('ERROR')
  const timeLog = errorLog(new Date().toLocaleTimeString())
  console.log(timeLog('服务器连接失败'))
  // [ERROR] xx:xx:xx: 服务器连接失败

  console.log('\n========== curry 测试完成 ==========')
}
