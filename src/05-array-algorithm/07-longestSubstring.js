/**
 * 最长无重复字符子串（滑动窗口）
 *
 * 面试一句话原理：
 * 右指针 right 一直右移扩展窗口，遇到重复字符时左指针 left 跳到重复位置的下一位，
 * Map 记录每个字符最后出现的位置，每步更新最长长度。
 *
 * 核心步骤：
 * 1. right 指针遍历字符串（窗口右边界）
 * 2. 用 Map 记录每个字符最后一次出现的位置
 * 3. 当 right 指向的字符在 Map 中且位置 >= left 时 → 有重复
 * 4. left 跳到重复字符上一次出现位置的下一位
 * 5. 每步计算窗口大小 (right - left + 1)，更新最大值
 *
 * 时间复杂度：O(n)，两个指针各遍历一次
 * 空间复杂度：O(k)，k 为字符集大小
 *
 * 关键理解：
 * - left 和 right 分别表示什么？ → 滑动窗口的左右边界（闭区间）
 * - 为什么 left 不能向左倒退？     → 因为之前的位置已经检查过了，左退意味着窗口中又进了旧字符
 * - 为什么用 Math.max(left, map.get(s[right]) + 1)？
 *   → 重复字符可能在 left 左边（已不在窗口中），不能把 left 拉回来
 * - 为什么是 O(n)？               → right 遍历 n 次，left 最多移动 n 次，每个字符最多访问 2 次
 */

/**
 * @param {string} s
 * @returns {number} 最长无重复字符子串的长度
 */
function lengthOfLongestSubstring(s) {
  if (!s) return 0

  const charMap = new Map()  // 字符 → 最后出现的位置
  let left = 0               // 窗口左边界
  let maxLen = 0             // 记录全局最长长度

  for (let right = 0; right < s.length; right++) {
    const char = s[right]

    // 如果当前字符在 Map 中存在，且在窗口内（位置 >= left）
    // 说明出现了重复，需要收缩左边界
    if (charMap.has(char) && charMap.get(char) >= left) {
      // left 跳到重复字符上一次出现位置的下一位
      left = charMap.get(char) + 1
    }

    // 更新当前字符的最新位置
    charMap.set(char, right)

    // 计算当前窗口长度，更新最大值
    maxLen = Math.max(maxLen, right - left + 1)
  }

  return maxLen
}

module.exports = lengthOfLongestSubstring

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试最长无重复子串 ==========')

  // 测试1：普通
  console.log('\n--- 测试1：普通 ---')
  console.log('"abcabcbb" →', lengthOfLongestSubstring('abcabcbb'))  // 3 ("abc")

  // 测试2：全相同
  console.log('\n--- 测试2：全相同 ---')
  console.log('"bbbbb" →', lengthOfLongestSubstring('bbbbb'))  // 1 ("b")

  // 测试3：子串在中间
  console.log('\n--- 测试3：中间段 ---')
  console.log('"pwwkew" →', lengthOfLongestSubstring('pwwkew'))  // 3 ("wke")

  // 测试4：空字符串
  console.log('\n--- 测试4：空字符串 ---')
  console.log('"" →', lengthOfLongestSubstring(''))  // 0

  // 测试5：单字符
  console.log('\n--- 测试5：单字符 ---')
  console.log('"a" →', lengthOfLongestSubstring('a'))  // 1

  // 测试6：为什么 Math.max 是必要的
  console.log('\n--- 测试6：abba 场景 ---')
  // abba: right=3 时 s[3]='a'，Map中 a 在 index=0，但 left 已经是 2
  // 如果不加 Math.max，left 会被错误地拉回 1
  console.log('"abba" →', lengthOfLongestSubstring('abba'))  // 2 ("ab"/"ba")

  console.log('\n========== 最长无重复子串测试完成 ==========')
}
