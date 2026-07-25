/**
 * 手写简易 EventEmitter 事件发布订阅（node events 核心实现）
 * 方法：on(订阅) / once(单次订阅) / emit(派发事件) / off(取消订阅) / clear(清空事件)
 * 存储结构：Map(事件名 => Set(多个回调函数))，Set自动去重同一个监听函数重复绑定
 */
class EventEmitter {
  constructor() {
    /**
     * 事件仓库
     * key：事件名称 string
     * value：Set 集合，存放该事件所有的回调函数
     * 使用Set：天然避免同一个函数多次on绑定造成重复执行
     */
    this.events = new Map()
  }

  /**
   * 持续订阅事件，触发emit就执行回调
   * @param {string} eventName 事件名称
   * @param {Function} handler 事件回调函数
   * @returns {Function} 解绑函数，调用即可移除本次监听
   */
  on(eventName, handler) {
    // 校验回调必须为函数
    if (typeof handler !== 'function') {
      throw new TypeError('事件处理函数必须是函数类型')
    }
    // 当前事件不存在，则新建一个Set容器存放回调
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set())
    }
    // 将回调添加进对应事件的集合中
    this.events.get(eventName).add(handler)
    // 返回一个解绑函数，外部可直接调用解绑
    return () => this.off(eventName, handler)
  }

  /**
   * 只执行一次的订阅，执行完毕自动解绑
   * @param {string} eventName 事件名称
   * @param {Function} handler 只执行一次的回调
   * @returns {Function} 解绑函数
   */
  once(eventName, handler) {
    // 包装一层外壳函数
    const wrapperFn = (...args) => {
      // 执行逻辑前先解绑自身，规避回调内部同步触发emit导致重复执行
      this.off(eventName, wrapperFn)
      // 执行用户真实的handler，绑定this为EventEmitter实例，透传所有参数
      handler.apply(this, args)
    }
    // 在包装函数身上挂载原始函数，off支持传入原始函数解绑once事件
    wrapperFn.originalHandler = handler
    // 调用on绑定这个包装函数
    return this.on(eventName, wrapperFn)
  }

  /**
   * 取消指定事件的指定监听函数
   * @param {string} eventName 事件名
   * @param {Function} handler 要移除的回调（原始函数/once原始函数都支持）
   */
  off(eventName, handler) {
    // 取出当前事件所有回调集合
    const handlerSet = this.events.get(eventName)
    // 没有该事件，直接终止执行
    if (!handlerSet) return

    // 遍历所有回调，匹配普通函数 或 once挂载了originalHandler的包装函数
    handlerSet.forEach(item => {
      if (item === handler || item.originalHandler === handler) {
        handlerSet.delete(item)
      }
    })

    // 当前事件所有回调被清空，把整个事件从Map中删掉，释放内存
    if (handlerSet.size === 0) {
      this.events.delete(eventName)
    }
  }

  /**
   * 触发事件，执行对应事件下所有回调
   * @param {string} eventName 要派发的事件名
   * @param  {...any} args 向回调函数传递的参数
   * @returns {boolean} true=存在事件并执行，false=无此事件
   */
  emit(eventName, ...args) {
    const handlerSet = this.events.get(eventName)
    if (!handlerSet) return false

    // 解构复制一份集合遍历：防止回调执行时同步off删除函数，造成遍历异常
    ;[...handlerSet].forEach(fn => {
      fn.apply(this, args)
    })
    return true
  }

  /**
   * 清空事件
   * @param {string} [eventName] 不传参清空全部事件，传参只清空对应事件
   */
  clear(eventName) {
    if (eventName === undefined) {
      // 清空整个Map所有事件
      this.events.clear()
    } else {
      // 删除单个事件
      this.events.delete(eventName)
    }
  }
}

// 导出类，外部模块可引入使用
module.exports = EventEmitter

// ====================== 测试用例 ======================
console.log('========== EventEmitter 事件总线测试 ==========')
const bus = new EventEmitter()

// 1、测试on + emit 多次触发
function normalCb(msg) {
  console.log('普通on监听执行：', msg)
}
const unBind = bus.on('test', normalCb)
bus.emit('test', '第一次触发')
bus.emit('test', '第二次触发')

// 2、测试off解绑
unBind()
bus.emit('test', '解绑后不会打印这条')

// 3、测试once 只执行一次
bus.once('onceTest', (res) => {
  console.log('once单次执行：', res)
})
bus.emit('onceTest', 'once第一条')
bus.emit('onceTest', 'once第二条(不会执行)')

// 4、测试off解绑once原始函数
const onceFn = (v) => console.log('可解绑的once', v)
bus.once('onceOff', onceFn)
bus.off('onceOff', onceFn)
bus.emit('onceOff', '被解绑，无输出')

// 5、测试clear清空单个事件
bus.on('clearTest', () => console.log('clear测试'))
bus.clear('clearTest')
bus.emit('clearTest')

// 6、clear清空全部事件
bus.on('all', () => console.log('全部事件'))
bus.clear()
bus.emit('all')


// 核心背诵要点
// 存储结构：Map(事件名) → Set(回调列表)，Set 去重重复绑定
// once 原理：包一层 wrapper，执行前先解绑自己
// emit 先用[...handlerSet]拷贝数组遍历，避免运行中删除元素导致遍历出错
// off 兼容普通函数、once 原始函数两种解绑方式
// on 返回解绑函数，使用更加便捷