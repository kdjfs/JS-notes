/**
 * compose 和 pipe（函数组合）
 *
 * 面试一句话原理：
 * compose 从右到左执行函数链，pipe 从左到右执行，每个函数的返回值作为下一个函数的参数。
 *
 * compose(f, g, h)(x) = f(g(h(x)))    ← 从右到左
 * pipe(f, g, h)(x)   = h(g(f(x)))    ← 从左到右
 *
 * 核心步骤：
 * 1. compose 用 reduceRight 从右往左累计执行
 * 2. pipe 用 reduce 从左往右累计执行
 * 3. 每次累计：上一次的输出是下一次的输入
 *
 * 典型应用：
 * - compose：Redux 中间件（洋葱模型）
 * - pipe：数据处理管道
 */

// ====================== compose（从右到左） ======================
/**
 * 面试一句话原理：
 * 用 reduceRight 从最后一个函数开始执行，前一个函数的返回值作为后一个函数的输入。
 *
 * @param  {...Function} fns 要组合的函数
 * @returns {Function} 组合后的函数 (x) => f1(f2(f3(...(x))))
 */
function compose(...fns) {
  // 没有传入函数，返回原样传递的恒等函数
  if (fns.length === 0) return (x) => x
  if (fns.length === 1) return fns[0]

  return function (initialValue) {
    // reduceRight：从最后一个函数开始执行
    // 初始值是 initialValue，每次调用 fn(累计值)
    return fns.reduceRight((acc, fn) => fn(acc), initialValue)
  }
}

// ====================== pipe（从左到右） ======================
/**
 * @param  {...Function} fns 要组合的函数
 * @returns {Function} 组合后的函数 (x) => f3(f2(f1(...(x))))
 */
function pipe(...fns) {
  if (fns.length === 0) return (x) => x
  if (fns.length === 1) return fns[0]

  return function (initialValue) {
    // reduce：从第一个函数开始执行
    // 初始值是 initialValue，每次调用 fn(累计值)
    return fns.reduce((acc, fn) => fn(acc), initialValue)
  }
}

module.exports = { compose, pipe }

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试 compose / pipe ==========')

  const add1    = x => { console.log('  +1:', x, '→', x + 1);    return x + 1 }
  const double  = x => { console.log('  ×2:', x, '→', x * 2);    return x * 2 }
  const square  = x => { console.log('  ^2:', x, '→', x * x);    return x * x }

  // compose(square, double, add1)(5) = square(double(add1(5)))
  // = square(double(6)) = square(12) = 144
  console.log('\n--- 测试1：compose 从右到左 ---')
  console.log('compose(square, double, add1)(5)')
  const composed = compose(square, double, add1)
  const result1 = composed(5)
  console.log('  结果:', result1, ' 预期: 144')

  // pipe(add1, double, square)(5) = square(double(add1(5)))
  // = square(double(6)) = square(12) = 144
  console.log('\n--- 测试2：pipe 从左到右 ---')
  console.log('pipe(add1, double, square)(5)')
  const piped = pipe(add1, double, square)
  const result2 = piped(5)
  console.log('  结果:', result2, ' 预期: 144')

  // 测试3：单个函数
  console.log('\n--- 测试3：单个函数 ---')
  console.log('compose(double)(3) =', compose(double)(3))  // 6
  console.log('pipe(double)(3) =', pipe(double)(3))        // 6

  // 测试4：空参数
  console.log('\n--- 测试4：空参数 ---')
  console.log('compose()(42) =', compose()(42))  // 42
  console.log('pipe()(42) =', pipe()(42))        // 42

  // 测试5：实用场景—金额格式化管道
  console.log('\n--- 测试5：金额格式化管道 ---')
  const toYuan = (cents) => cents / 100
  const format  = (num) => num.toFixed(2)
  const addSign = (str) => '¥' + str
  const formatPrice = pipe(toYuan, format, addSign)
  console.log('12345分 =', formatPrice(12345))  // ¥123.45

  console.log('\n========== compose/pipe 测试完成 ==========')
}
