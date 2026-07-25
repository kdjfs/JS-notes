/**
 * 大量数据分片渲染（时间切片）
 *
 * 面试一句话原理：
 * 用 requestAnimationFrame 或 setTimeout 把大批量操作拆成多个小片段，
 * 每一帧只处理一部分，避免长时间占用主线程导致页面卡顿。
 *
 * 核心原理：
 * - 浏览器一帧约 16ms（60fps），一帧内要完成渲染、JS执行等所有事情
 * - 如果 JS 执行超过 16ms，就会掉帧，用户感觉卡
 * - 分片后每片执行 < 16ms，浏览器可以在片间渲染，保持页面流畅
 *
 * 为什么分片不能减少总工作量？
 * 总工作量不变，只是把它"打散"到多个帧里。
 * 好处是用户不会感觉到卡顿，坏处是总完成时间变长了。
 */

// ====================== requestAnimationFrame 分片 ======================
// 仅在浏览器环境有效，Node.js 需要 mock

function chunkRender(dataList, renderItemFn, chunkSize = 20) {
  let currentIndex = 0
  const total = dataList.length

  function renderChunk() {
    // 当前片段结束位置
    const end = Math.min(currentIndex + chunkSize, total)

    // 渲染当前片段的每一项
    for (let i = currentIndex; i < end; i++) {
      renderItemFn(dataList[i], i)
    }

    currentIndex = end

    // 还没渲染完 → 申请下一帧继续
    if (currentIndex < total) {
      requestAnimationFrame(renderChunk)
    } else {
      console.log(`✅ 全部渲染完成，共 ${total} 条`)
    }
  }

  // 开始第一帧渲染
  requestAnimationFrame(renderChunk)
}

// ====================== setTimeout 分片（Node.js 可用） ======================
// 适合非渲染场景的大批量数据处理
function chunkProcess(dataList, processItemFn, chunkSize = 100) {
  return new Promise((resolve) => {
    let currentIndex = 0
    const total = dataList.length

    function processChunk() {
      const end = Math.min(currentIndex + chunkSize, total)

      for (let i = currentIndex; i < end; i++) {
        processItemFn(dataList[i], i)
      }

      currentIndex = end

      if (currentIndex < total) {
        // setTimeout 0：把下一片放到任务队列，给其他任务执行的机会
        setTimeout(processChunk, 0)
      } else {
        resolve()
      }
    }

    setTimeout(processChunk, 0)
  })
}

module.exports = { chunkRender, chunkProcess }

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试分片处理 ==========')

  // 检测运行环境
  if (typeof document !== 'undefined') {
    console.log('\n--- 浏览器环境：使用 requestAnimationFrame ---')
    console.log('（跳过，需要在浏览器中测试）')
  } else {
    console.log('\n--- Node.js 环境：使用 setTimeout 分片 ---')
    const bigList = Array.from({ length: 500 }, (_, i) => `item_${i}`)

    let processed = 0
    console.log('开始分片处理 500 条数据...', new Date().toLocaleTimeString())

    chunkProcess(
      bigList,
      (item, index) => {
        // 模拟每条处理耗时 2ms
        const start = Date.now()
        while (Date.now() - start < 2) { /* 模拟计算 */ }
        processed++
      },
      50  // 每片 50 条
    ).then(() => {
      console.log('处理完毕:', new Date().toLocaleTimeString())
      console.log('共处理:', processed, '条')
      console.log('说明：每条 2ms, 如果一次性跑需要 1000ms, 但用分片可以让中间插入其他任务')
      console.log('\n========== 分片测试完成 ==========')
    })
  }
}
