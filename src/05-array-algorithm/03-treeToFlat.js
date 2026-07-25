/**
 * 树形结构 → 扁平数组（treeToFlat）
 *
 * 面试一句话原理：
 * 递归 DFS 遍历树，每遇到一个节点就收集它的属性（去掉 children），
 * 然后递归处理它的 children，全部收集到同一个数组里。
 *
 * 核心步骤：
 * 1. 遍历当前层级所有节点
 * 2. 取出每个节点除 children 以外的属性，放入结果数组
 * 3. 如果节点有 children，递归处理子节点
 * 4. 汇总所有结果
 *
 * 时间复杂度：O(n)，每个节点访问一次
 * 空间复杂度：O(n)（结果数组）+ O(h)（递归栈深度，h 为树高）
 *
 * 注意事项：
 * - 递归过深可能导致栈溢出（js 默认递归栈约 1 万层）
 * - 如果树层级非常深（如几千层），需要改用迭代（栈）实现
 */

/**
 * @param {Array}  tree            树形数组
 * @param {string} childrenField   children 字段名（默认 'children'）
 * @returns {Array} 扁平数组（不含 children 字段）
 */
function treeToFlat(tree, childrenField = 'children') {
  if (!Array.isArray(tree) || tree.length === 0) return []

  const result = []

  // ---- 递归 DFS ----
  function dfs(nodes) {
    for (const node of nodes) {
      // 解构：分离 children 和其他属性
      const { [childrenField]: children, ...rest } = node
      // rest 就是去掉了 children 的纯数据
      result.push(rest)

      // 如果有子节点且是数组，递归处理
      if (Array.isArray(children) && children.length > 0) {
        dfs(children)
      }
    }
  }

  dfs(tree)
  return result
}

// ====================== 扩展：迭代版本（避免栈溢出） ======================
/**
 * 栈实现：用数组模拟调用栈，避免递归过深导致栈溢出
 * 面试时如果面试官追问"怎么避免栈溢出"，就提这个版本。
 */
function treeToFlatByStack(tree, childrenField = 'children') {
  if (!Array.isArray(tree) || tree.length === 0) return []

  const result = []
  // 用数组模拟栈：初始放入所有节点（倒序是为了保持前序遍历顺序）
  const stack = [...tree].reverse()

  while (stack.length > 0) {
    const node = stack.pop()
    const { [childrenField]: children, ...rest } = node
    result.push(rest)

    // 子节点倒序入栈，保证原顺序
    if (Array.isArray(children) && children.length > 0) {
      for (let i = children.length - 1; i >= 0; i--) {
        stack.push(children[i])
      }
    }
  }

  return result
}

module.exports = { treeToFlat, treeToFlatByStack }

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试 treeToFlat ==========')

  const tree = [
    {
      id: 1, name: '前端', children: [
        {
          id: 2, name: 'JavaScript', children: [
            { id: 4, name: '闭包', children: [] }
          ]
        },
        { id: 3, name: 'Vue', children: [] }
      ]
    },
    {
      id: 5, name: '后端', children: [
        { id: 6, name: 'Node.js', children: [] }
      ]
    }
  ]

  console.log('\n输入树形结构:')
  console.log(JSON.stringify(tree, null, 2))

  console.log('\nDFS 递归结果:')
  const flat1 = treeToFlat(tree)
  console.log(JSON.stringify(flat1, null, 2))

  console.log('\n栈迭代结果:')
  const flat2 = treeToFlatByStack(tree)
  console.log(JSON.stringify(flat2, null, 2))

  // 测试2：自定义 children 字段名
  console.log('\n--- 测试2：自定义 children 字段名 ---')
  const customTree = [
    { key: 'a', sub: [{ key: 'a1', sub: [] }] }
  ]
  const customFlat = treeToFlat(customTree, 'sub')
  console.log('自定义children字段:', customFlat)

  // 测试3：不修改原树
  console.log('\n--- 测试3：原树未修改 ---')
  console.log('原树仍有children?',
    tree[0].children !== undefined ? '✅ 原树保留children' : '❌')

  // 测试4：空数组
  console.log('\n--- 测试4：空数组 ---')
  console.log('空数组:', treeToFlat([]))  // []

  console.log('\n========== treeToFlat 测试完成 ==========')
}
