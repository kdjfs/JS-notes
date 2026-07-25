/**
 * LazyMan（延迟执行/任务队列/链式调用）
 *
 * 面试一句话原理：
 * 所有操作（eat、sleep）推入任务队列，构造函数用 setTimeout 异步启动任务执行，
 * 每个任务完成后调用 next 继续下一个，sleepFirst 用 unshift 插队到队首。
 *
 * 核心步骤：
 * 1. 维护一个 tasks 任务队列
 * 2. eat：把打印操作封装成任务，push 到队列末尾
 * 3. sleep：把延时 + 打印操作封装成任务，push 到末尾
 * 4. sleepFirst：把延时 + 打印操作封装成任务，unshift 到队首
 * 5. 构造函数中 setTimeout(() => next(), 0)，异步启动队列
 * 6. next() 从队首取出任务执行，任务完成后再调用 next
 *
 * 关键知识点：
 * - 为什么初始化后不能立即执行队列？
 *   → 因为链式调用时 eat/sleep 还没执行完，队列里还没收集够任务
 *   → 需要用 setTimeout 把"启动队列"推迟到当前宏任务之后
 *
 * - 为什么 sleep 要等完成后才 next？
 *   → setTimeout 模拟阻塞效果，sleep 2s 就是 2s 后调用 next
 *
 * - 为什么链式调用要 return this？
 *   → 返回 this（当前实例），让后续方法可以继续 .调用
 *
 * - sleepFirst 为什么用 unshift？
 *   → 把它插到任务队列最前面，执行时优先于在此之前添加的任务
 */

class LazyMan {
  constructor(name) {
    this.name  = name
    this.tasks = []           // 任务队列
    this.hasStarted = false   // 防止重复启动

    // 第一个任务：打印 Hi
    this.tasks.push({
      desc: 'sayHi',
      run: (next) => {
        console.log(`Hi! ${this.name}`)
        next()  // 任务完成，继续下一个
      }
    })

    // 异步启动任务队列——等所有链式调用完成后再开始执行
    // 为什么用 setTimeout？让当前宏任务中所有 .eat()/.sleep() 都添加到队列后，
    // 下一个宏任务才开始执行队列
    setTimeout(() => {
      this._next()
    }, 0)
  }

  /**
   * 执行下一个任务
   */
  _next() {
    // 队列为空，结束
    if (this.tasks.length === 0) return

    const task = this.tasks.shift()  // 取出队首任务
    task.run(() => this._next())     // 执行任务，传入 next 回调
  }

  /**
   * 吃东西：非阻塞任务，立刻完成
   */
  eat(food) {
    this.tasks.push({
      desc: 'eat',
      run: (next) => {
        console.log(`Eat ${food}`)
        next()  // 立刻继续下一个
      }
    })
    return this  // 链式调用
  }

  /**
   * 睡觉：阻塞 delay 秒
   * 用 setTimeout 模拟休眠，delay 秒后才调用 next
   */
  sleep(delay) {
    this.tasks.push({
      desc: 'sleep',
      run: (next) => {
        console.log(`Sleep ${delay}s...`)
        setTimeout(() => {
          console.log(`Wake up after ${delay}s`)
          next()  // 延迟结束后继续下一个
        }, delay * 1000)
      }
    })
    return this
  }

  /**
   * 优先睡觉：插队到任务队列最前面
   * 注意：不能插到 sayHi 前面（sayHi 是第一个任务）
   * 所以用 splice 插入到索引 1 的位置
   */
  sleepFirst(delay) {
    this.tasks.splice(1, 0, {
      desc: 'sleepFirst',
      run: (next) => {
        console.log(`SleepFirst ${delay}s...`)
        setTimeout(() => {
          console.log(`Wake up after ${delay}s`)
          next()
        }, delay * 1000)
      }
    })
    return this
  }
}

/**
 * 工厂函数：new LazyMan(name) 的快捷写法
 */
function createLazyMan(name) {
  return new LazyMan(name)
}

module.exports = { LazyMan, createLazyMan }

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试 LazyMan ==========')
  // 使用较短延迟时间方便测试

  console.log('\n--- 测试1：基本链式调用 ---')
  new LazyMan('Tom')

  setTimeout(() => {
    console.log('\n--- 测试2：eat + sleep ---')
    new LazyMan('Jerry').eat('apple').sleep(1).eat('banana')
    // Hi! Jerry → Eat apple → Sleep 1s... → Wake up → Eat banana
  }, 50)

  setTimeout(() => {
    console.log('\n--- 测试3：sleepFirst 插队 ---')
    new LazyMan('Bob').eat('bread').sleepFirst(1).eat('egg')
    // Hi! Bob → SleepFirst 1s... → Wake up → Eat bread → Eat egg
  }, 2000)

  setTimeout(() => {
    console.log('\n========== LazyMan 测试完成 ==========')
  }, 3500)
}
