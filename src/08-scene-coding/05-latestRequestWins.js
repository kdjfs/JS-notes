/**
 * 只采用最后一次请求结果（解决竞态问题）
 *
 * 面试一句话原理：
 * 用递增 requestId 标记每次请求，响应回来时检查 id 是否是最新的，
 * 只有最新的请求结果才更新数据，旧的丢弃。
 *
 * 典型场景：
 * - 搜索框输入联想：输入"a"发请求1，输入"ab"发请求2
 *   请求1 可能比 请求2 更晚返回，但不能用旧结果覆盖新状态
 * - 快速切换 Tab：切换 TabA 发请求A，切换 TabB 发请求B
 *
 * 为什么请求先发不一定先返回？
 * 网络波动、后端处理时间不同，完全可能出现后发的请求先返回的情况。
 */

// ====================== mockRequest ======================
// 模拟不同延迟（验证竞态）
function mockRequest(delay, data) {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delay)
  })
}

// ====================== latestRequestWins ======================
let globalRequestId = 0

/**
 * 返回一个包装函数，保证只采用最新一次的请求结果
 *
 * @param {Function} requestFn 真正请求函数，返回 Promise
 * @returns {Function} 包装后的请求函数
 */
function createLatestRequestWins() {
  let latestId = 0

  return function safeRequest(requestFn, onSuccess) {
    // 每次调用 ID 递增
    latestId++
    const currentId = latestId

    requestFn()
      .then(result => {
        // 只有最新请求的结果才采纳
        if (currentId === latestId) {
          onSuccess(result)
        } else {
          console.log(`  [丢弃] 请求 #${currentId} 的结果（不是最新的 #${latestId}）`)
        }
      })
      .catch(err => {
        // 失败也遵循"只有最新"
        if (currentId === latestId) {
          console.error('最新请求失败:', err.message)
        }
      })
  }
}

module.exports = { createLatestRequestWins, mockRequest }

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试 latestRequestWins ==========')

  const safeRequest = createLatestRequestWins()

  console.log('\n--- 测试：模拟搜索框输入 ---')
  console.log('输入"a"  → 请求1（延迟 300ms）')
  console.log('输入"ab" → 请求2（延迟 100ms）')

  // 模拟：搜索框输入
  // 请求1（先发，但慢）
  safeRequest(
    () => mockRequest(300, '搜索"a"的结果'),
    (data) => console.log('✅ 采纳:', data)
  )

  // 请求2（后发，但快）——这才是正确结果
  setTimeout(() => {
    safeRequest(
      () => mockRequest(100, '搜索"ab"的结果'),
      (data) => console.log('✅ 采纳:', data)
    )
  }, 50)

  setTimeout(() => {
    console.log('\n--- 说明 ---')
    console.log('请求1 的延迟是 300ms → 请求2 的延迟是 100ms')
    console.log('虽然请求1先发，但请求2先返回 → 请求1的结果被丢弃')
    console.log('如果不用这个机制，搜索结果会被旧的"a"覆盖"ab"')
    console.log('\n========== latestRequestWins 测试完成 ==========')
  }, 400)
}
