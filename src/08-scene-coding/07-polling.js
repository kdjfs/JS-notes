/**
 * 可暂停轮询
 *
 * 面试一句话原理：
 * 用递归 setTimeout 实现轮询（不是 setInterval），
 * 上一次请求完成后才安排下一次，避免了请求堆积。
 *
 * 核心设计：
 * 1. 每次请求完成后，用 setTimeout 安排下一次请求
 * 2. stop 时清除 timeoutId，停止下次安排
 * 3. start 时启动新的轮询循环
 *
 * 为什么用递归 setTimeout 而不是 setInterval？
 * - setInterval 不管上次请求是否完成，到点就发，可能导致请求堆积
 * - 递归 setTimeout 在每次请求完成后才安排下一次，间隔是"上次完成 + delay"
 *   vs setInterval 的间隔是"上次开始 + delay"
 *
 * 页面隐藏时暂停（visibilitychange）：
 * - 页面隐藏时轮询是浪费资源
 * - 可以利用 document.visibilitychange 事件控制启停
 */

class PollingManager {
  /**
   * @param {Function} requestFn 请求函数，返回 Promise
   * @param {number}   interval  轮询间隔（毫秒）
   */
  constructor(requestFn, interval = 3000) {
    this.requestFn = requestFn      // 请求函数
    this.interval  = interval       // 轮询间隔
    this.timerId   = null           // setTimeout 返回值
    this.isRunning = false          // 当前是否在运行
    this.abortFlag = false          // 停止标记
  }

  /** 启动轮询 */
  start() {
    if (this.isRunning) return       // 已在运行中
    this.isRunning = true
    this.abortFlag = false
    this._poll()
  }

  /** 停止轮询 */
  stop() {
    this.abortFlag = true
    this.isRunning = false
    if (this.timerId !== null) {
      clearTimeout(this.timerId)
      this.timerId = null
    }
    console.log('🛑 轮询已停止')
  }

  /** 内部轮询循环 */
  async _poll() {
    if (this.abortFlag) return

    try {
      // 执行请求
      const result = await this.requestFn()
      console.log('📡 轮询结果:', result)
    } catch (err) {
      console.error('❌ 轮询请求失败:', err.message)
    }

    // 请求完成后，安排下一次（如果还在运行）
    if (!this.abortFlag) {
      this.timerId = setTimeout(() => this._poll(), this.interval)
    }
  }
}

/**
 * 浏览器环境：页面隐藏时暂停轮询
 * 仅在浏览器中可用，Node.js 环境下 document 不存在
 */
function setupVisibilityControl(pollingManager) {
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        pollingManager.stop()
        console.log('👁 页面隐藏，暂停轮询')
      } else {
        pollingManager.start()
        console.log('👁 页面可见，恢复轮询')
      }
    })
  }
}

module.exports = { PollingManager, setupVisibilityControl }

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试可暂停轮询 ==========')

  // mock 请求
  let mockCount = 0
  function mockFetch() {
    return new Promise(resolve => {
      const count = ++mockCount
      setTimeout(() => resolve(`数据_${count}`), 200)
    })
  }

  const poller = new PollingManager(mockFetch, 300)

  console.log('\n--- 测试：启动轮询，运行 2 次后停止 ---')
  poller.start()

  // 1.2 秒后停止
  setTimeout(() => {
    poller.stop()
    console.log('（应为约 3 次请求）')

    // 过一会儿再启动
    setTimeout(() => {
      console.log('\n--- 测试：重新启动 ---')
      poller.start()

      // 再过 600ms 停止
      setTimeout(() => {
        poller.stop()
        console.log('\n========== 轮询测试完成 ==========')
      }, 600)
    }, 500)
  }, 1200)
}
