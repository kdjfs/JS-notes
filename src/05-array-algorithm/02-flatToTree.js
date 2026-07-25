/**
 * 扁平数组 → 树形结构（flatToTree）
 *
 * 面试一句话原理：
 * 先用 Map 保存所有节点（id → 节点引用），再遍历一次，
 * 根据每个节点的 parentId 找到父节点，把自己挂到父节点的 children 里，两次遍历都是 O(n)。
 *
 * 核心步骤：
 * 1. 遍历数组，深拷贝每个节点（不修改原数据），存入 Map(id → node)
 * 2. 再遍历数组，根据每个节点的 parentId 去 Map 中找父节点
 * 3. 找到 → 挂载到父节点的 children
 * 4. 找不到（顶级节点）→ 加入结果数组
 *
 * 优点：O(n) 时间复杂度，父节点在子节点后面也正确工作
 *
 * 为什么不使用递归查找父节点？
 * 递归版每个节点都要遍历数组找父节点，时间复杂度 O(n²)，
 * 数据量大时性能极差。Map 版是面试标准答案。
 */

/**
 * @param {Array}  arr          扁平数组 [{id, parentId, ...}]
 * @param {number|string} rootParentId  顶级节点的 parentId 值（默认 0）
 * @returns {Array} 树形结构
 */
function flatToTree(arr, rootParentId = 0) {
  if (!Array.isArray(arr) || arr.length === 0) return []

  // ---- 第一遍：建立 id → 节点副本 的映射 ----
  // 为什么用展开运算符？不修改原数组对象
  // 先创建空 children 数组，每个节点都可能是父节点
  const nodeMap = new Map()
  arr.forEach(item => {
    nodeMap.set(item.id, {
      ...item,           // 展开复制所有属性
      children: []       // 预先创建 children 数组
    })
  })

  // ---- 第二遍：根据 parentId 挂载到父节点的 children ----
  const tree = []
  arr.forEach(item => {
    const node = nodeMap.get(item.id)
    const parentNode = nodeMap.get(item.parentId)

    if (parentNode) {
      // 父节点存在 → 挂到父节点的 children
      parentNode.children.push(node)
    } else {
      // 父节点不存在 → 顶级节点，加入结果数组
      // 找不到父节点的情况：要么是根节点，要么数据中真没有
      if (item.parentId === rootParentId) {
        tree.push(node)
      }
      // 如果 parentId 不等于 rootParentId 但找不到父节点 → 数据有误，也放入 tree
      // 可根据需求改为丢弃或报错
    }
  })

  return tree
}

module.exports = flatToTree

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试 flatToTree ==========')

  const flatData = [
    { id: 1, parentId: 0, name: '前端' },
    { id: 2, parentId: 1, name: 'JavaScript' },
    { id: 3, parentId: 1, name: 'Vue' },
    { id: 4, parentId: 2, name: '闭包' },
    { id: 5, parentId: 0, name: '后端' },
    { id: 6, parentId: 5, name: 'Node.js' }
  ]

  const tree = flatToTree(flatData, 0)
  console.log('\n输入扁平数组:')
  console.log(JSON.stringify(flatData, null, 2))

  console.log('\n输出树形结构:')
  console.log(JSON.stringify(tree, null, 2))

  // 预期结构：
  // [
  //   { id: 1, parentId: 0, name: '前端', children: [
  //     { id: 2, parentId: 1, name: 'JavaScript', children: [
  //       { id: 4, parentId: 2, name: '闭包', children: [] }
  //     ]},
  //     { id: 3, parentId: 1, name: 'Vue', children: [] }
  //   ]},
  //   { id: 5, parentId: 0, name: '后端', children: [
  //     { id: 6, parentId: 5, name: 'Node.js', children: [] }
  //   ]}
  // ]

  // 测试2：父节点在子节点后面出现（Map 版可以正确处理）
  console.log('\n--- 测试2：父节点在子节点后 ---')
  const reversedData = [
    { id: 4, parentId: 2, name: '闭包' },
    { id: 2, parentId: 1, name: 'JavaScript' },
    { id: 1, parentId: 0, name: '前端' }
  ]
  const tree2 = flatToTree(reversedData, 0)
  console.log('颠倒顺序也能正确构建:', JSON.stringify(tree2, null, 2))

  // 测试3：不修改原数组
  console.log('\n--- 测试3：不修改原数组 ---')
  console.log('原数组元素 children 字段保留吗?',
    flatData[0].children === undefined ? '✅ 未修改' : '❌ 被修改')

  // 测试4：空数组
  console.log('\n--- 测试4：空数组 ---')
  console.log('空数组:', flatToTree([]))  // []

  console.log('\n========== flatToTree 测试完成 ==========')
}
