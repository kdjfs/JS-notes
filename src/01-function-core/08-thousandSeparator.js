/**
 * 数字千分位格式化
 *
 * 面试一句话原理：
 * 数字转字符串，分离整数和小数部分，整数部分从右往左每三位加一个逗号。
 *
 * 核心步骤：
 * 1. 处理符号，取绝对值
 * 2. 分离整数部分和小数部分
 * 3. 整数部分转字符串，从右向左每三位插入逗号
 * 4. 拼回符号、整数、小数
 *
 * 时间复杂度：O(n)
 * 空间复杂度：O(n)
 */

// ====================== 方式1：循环版（推荐背诵，逻辑最直观） ======================
/**
 * @param {number|string} num 数字或数字字符串
 * @returns {string} 千分位格式化后的字符串
 */
function thousandSeparator(num) {
  // 统一转为字符串
  const str = String(num)

  // 处理符号
  let sign = ''
  let unsignedStr = str
  if (str.startsWith('-')) {
    sign = '-'
    unsignedStr = str.slice(1)
  }

  // 分离整数和小数部分
  const parts = unsignedStr.split('.')
  const intPart = parts[0]
  const decPart = parts.length > 1 ? '.' + parts[1] : ''

  // ---- 整数部分从右向左每三位加逗号 ----
  let formatted = ''
  let count = 0

  for (let i = intPart.length - 1; i >= 0; i--) {
    formatted = intPart[i] + formatted
    count++
    // 每满三位（且不是最左侧）加逗号
    if (count % 3 === 0 && i !== 0) {
      formatted = ',' + formatted
    }
  }

  return sign + formatted + decPart
}

// ====================== 方式2：正则版（面试加分项） ======================
/**
 * 正则版原理：
 * 用正则匹配"前面还有数字"的位置，替换为逗号。
 * /\B(?=(\d{3})+(?!\d))/g
 * \B            → 非单词边界（不在开头）
 * (?=(\d{3})+)  → 后面跟着 3 的倍数个数字
 * (?!\d)        → 后面不要再有数字（是末尾或小数点的位置）
 */
function thousandSeparatorRegex(num) {
  const str = String(num)
  const parts = str.split('.')

  // 只对整数部分加千分位
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return parts.join('.')
}

module.exports = { thousandSeparator, thousandSeparatorRegex }

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试千分位格式化 ==========')

  const testCases = [
    1234567,           // 1,234,567
    12345,             // 12,345
    1000,              // 1,000
    999,               // 999
    0,                 // 0
    -1234567,          // -1,234,567
    1234567.89,        // 1,234,567.89
    '1234567890',      // 1,234,567,890
  ]

  console.log('\n--- 循环版 ---')
  testCases.forEach(n => {
    console.log(`${String(n).padEnd(14)} → ${thousandSeparator(n)}`)
  })

  console.log('\n--- 正则版 ---')
  testCases.forEach(n => {
    console.log(`${String(n).padEnd(14)} → ${thousandSeparatorRegex(n)}`)
  })

  console.log('\n========== 千分位测试完成 ==========')
}
