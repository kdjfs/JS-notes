/**
 * 版本号比较
 *
 * 面试一句话原理：
 * 按 "." 分割成数组，逐段比较数字，某段大就赢，统一长度（短的补 0）处理不等长版本号。
 *
 * 核心步骤：
 * 1. 按 '.' 分割两个版本号
 * 2. 从左到右逐段比较（Number 转数字）
 * 3. 某段不等 → 该段大的版本更新
 * 4. 遍历完仍有相等段 → 返回 0（版本相同）
 *
 * 返回值：1 = v1 更新，-1 = v2 更新，0 = 相等
 *
 * 易错点：
 * - 不能用 parseFloat 直接比较 "1.0.2" 和 "1.0.10"
 *   → parseFloat("1.0.10") = 1，parseFloat("1.0.2") = 1，认为相等（错误！）
 * - 不等长版本号处理："1.0" vs "1.0.0" → 补 0 后相等
 */

/**
 * @param {string} v1 版本号1
 * @param {string} v2 版本号2
 * @returns {number} 1 | -1 | 0
 */
function compareVersion(v1, v2) {
  const parts1 = v1.split('.')
  const parts2 = v2.split('.')

  const maxLen = Math.max(parts1.length, parts2.length)

  for (let i = 0; i < maxLen; i++) {
    // 越界补 0
    const num1 = i < parts1.length ? Number(parts1[i]) : 0
    const num2 = i < parts2.length ? Number(parts2[i]) : 0

    if (num1 > num2) return 1   // v1 更新
    if (num1 < num2) return -1  // v2 更新
    // 相等继续下一段
  }

  return 0  // 所有段都相等
}

module.exports = compareVersion

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试版本号比较 ==========')

  // 测试1：正常比较
  console.log('\n--- 测试1：正常 ---')
  console.log('1.0.0 vs 1.0.0:', compareVersion('1.0.0', '1.0.0'))  // 0
  console.log('2.0.0 vs 1.0.0:', compareVersion('2.0.0', '1.0.0'))  // 1
  console.log('1.0.0 vs 2.0.0:', compareVersion('1.0.0', '2.0.0'))  // -1

  // 测试2：不等长
  console.log('\n--- 测试2：不等长 ---')
  console.log('1.0 vs 1.0.0:', compareVersion('1.0', '1.0.0'))      // 0
  console.log('1.0.1 vs 1.0:', compareVersion('1.0.1', '1.0'))      // 1

  // 测试3：经典陷阱（不能用 parseFloat）
  console.log('\n--- 测试3：parseFloat 陷阱 ---')
  console.log('1.0.2 vs 1.0.10:', compareVersion('1.0.2', '1.0.10'))  // -1（段比较正确）
  // parseFloat 的比较：parseFloat('1.0.10')=1, parseFloat('1.0.2')=1，相等（错误！）

  // 测试4：大版本号
  console.log('\n--- 测试4：大数字 ---')
  console.log('10.20.30 vs 10.20.30:', compareVersion('10.20.30', '10.20.30'))  // 0

  // 测试5：单段版本
  console.log('\n--- 测试5：单段 ---')
  console.log('3 vs 2:', compareVersion('3', '2'))  // 1
  console.log('2 vs 3:', compareVersion('2', '3'))  // -1

  console.log('\n========== 版本号比较测试完成 ==========')
}
