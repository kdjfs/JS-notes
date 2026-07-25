/**
 * 大数相加（字符串加法）
 *
 * 面试一句话原理：
 * 从右到左逐位相加，carry 保存进位，结果用字符串拼接（或数组 reverse），处理完所有位再反转。
 *
 * 核心步骤：
 * 1. 两个指针从字符串末尾开始
 * 2. 每次取出对应位数字（没有则补 0），相加得到 sum
 * 3. carry = Math.floor(sum / 10)，当前位 = sum % 10
 * 4. 指针左移，直到两个字符串都处理完且无进位
 * 5. 结果反转（因为是从低位往高位拼接的）
 *
 * 时间复杂度：O(max(n, m))
 * 空间复杂度：O(max(n, m))
 *
 * 为什么不能用 BigInt？
 * 面试考的就是你手写进位的能力，而且 BigInt 在 JS 面试中通常不让用。
 * 为什么不能把字符串直接转成 Number？
 * Number 只有 53 位有效精度，超过 16 位的数字会丢失精度。
 */

/**
 * @param {string} a 非负整数字符串
 * @param {string} b 非负整数字符串
 * @returns {string} 和的字符串
 */
function bigNumberAdd(a, b) {
  // 指针：分别指向 a 和 b 的末尾
  let i = a.length - 1
  let j = b.length - 1

  let carry = 0        // 进位
  const result = []    // 存储每位的数字（低位在前）

  // 只要还有数字没处理，或者还有进位，就继续循环
  while (i >= 0 || j >= 0 || carry > 0) {
    // 取当前位数字，指针越界则补 0
    const digitA = i >= 0 ? Number(a[i]) : 0
    const digitB = j >= 0 ? Number(b[j]) : 0

    const sum = digitA + digitB + carry
    const currentDigit = sum % 10      // 当前位值
    carry = Math.floor(sum / 10)       // 进位值

    result.push(currentDigit)

    i--
    j--
  }

  // 反转数组并拼接
  return result.reverse().join('')
}

/**
 * 极简背诵骨架：
 *
 * function bigNumberAdd(a, b) {
 *   let i = a.length - 1, j = b.length - 1, carry = 0, res = []
 *   while (i >= 0 || j >= 0 || carry) {
 *     const sum = (Number(a[i--]) || 0) + (Number(b[j--]) || 0) + carry
 *     res.unshift(sum % 10)
 *     carry = Math.floor(sum / 10)
 *   }
 *   return res.join('')
 * }
 *
 * 注意：用 unshift 版本会 O(n²)，推荐用 push + reverse O(n)
 */

module.exports = bigNumberAdd

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试大数相加 ==========')

  // 测试1：正常
  console.log('\n--- 测试1：正常 ---')
  console.log('123 + 456 =', bigNumberAdd('123', '456'))  // 579

  // 测试2：进位
  console.log('\n--- 测试2：进位 ---')
  console.log('999 + 1 =', bigNumberAdd('999', '1'))  // 1000

  // 测试3：大数（超过 Number 安全范围）
  console.log('\n--- 测试3：超大数 ---')
  const bigA = '99999999999999999999'
  const bigB = '1'
  const expected = '100000000000000000000'
  const result = bigNumberAdd(bigA, bigB)
  console.log(bigA, '+', bigB, '=', result)
  console.log('预期:', expected)
  console.log('正确?', result === expected ? '✅' : '❌')

  // 测试4：不同长度
  console.log('\n--- 测试4：不同长度 ---')
  console.log('100 + 1 =', bigNumberAdd('100', '1'))  // 101

  // 测试5：连续进位
  console.log('\n--- 测试5：连续进位 ---')
  console.log('199999 + 1 =', bigNumberAdd('199999', '1'))  // 200000

  // 测试6：0
  console.log('\n--- 测试6：0 ---')
  console.log('0 + 0 =', bigNumberAdd('0', '0'))  // 0
  console.log('0 + 5 =', bigNumberAdd('0', '5'))  // 5

  console.log('\n========== 大数相加测试完成 ==========')
}
