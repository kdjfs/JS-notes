/**
 * 手写实现 Function.prototype.call / apply / bind
 * 核心原理：把函数挂载到指定context对象身上，对象.函数() 自动绑定this为对象，执行后删除临时属性
 */

// ====================== myCall 实现 ======================
/**
 * @param {Object} context 函数this指向的对象
 * @param  {...any} args 逐个传入的执行参数
 * @returns 原函数执行返回值
 */

// this （myCall内部）= 调用myCall的普通函数
// context = 用户传入的需要绑定的this指向对象
// tempKey：临时、唯一的属性标识
Function.prototype.myCall = function (context, ...args) {
  // this -> 调用myCall的那个函数，如果不是函数直接抛错
  if (typeof this !== 'function') {
    throw new TypeError('myCall must be called by a function')
  }

  // context为null/undefined，自动绑定全局globalThis；基础值装箱处理
  context = context == null ? globalThis : Object(context)

  // Symbol 独一无二，不会和对象原有属性重名
//   Symbol()：JS 原生独一无二的值，永远不会重复。就算写两次 Symbol('temp_fn')，两个值也不相等。
// 括号里的 temp_fn：仅仅只是描述字符串、备注名字，方便你调试控制台查看的时候，
// 知道这个 Symbol 是用来存放临时函数的，没有任何代码逻辑作用，改成'abc'、'hello'程序运行效果完全一致。
  const tempKey = Symbol('temp_fn')
  // 将原函数挂载到context临时属性上
  context[tempKey] = this

  try {
    // 对象调用方法，函数内this = context，展开参数执行
    return context[tempKey](...args)
  } finally {
    // 无论执行成功/报错，一定要删掉临时挂载的属性，不污染原对象
    delete context[tempKey]
  }
}

// ====================== myApply 实现 ======================
/**
 * @param {Object} context 函数this指向
 * @param {Array|null} args 数组格式参数
 * @returns 原函数执行返回值
 */
Function.prototype.myApply = function (context, args) {
  if (typeof this !== 'function') {
    throw new TypeError('myApply must be called by a function')
  }

  context = context == null ? globalThis : Object(context)
  const tempKey = Symbol('temp_fn')
  context[tempKey] = this

  try {
    // 不传第二个参数默认空数组
//     如果 args 有值（用户传了第二个参数） → 执行 Array.from(args)
// 如果 args === null / args === undefined（调用 myApply 不传数组参数） → 赋值为空数组 []
    const argArr = args ? Array.from(args) : []
    return context[tempKey](...argArr)
  } finally {
    delete context[tempKey]
  }
}

// ====================== myBind 实现 ======================
/**
 * bind特点：返回绑定this的新函数、支持预设参数、new实例化时this失效继承原函数原型
 * @param {Object} context 绑定的this
 * @param  {...any} presetArgs 预先传入的参数
 * @returns {Function} 绑定后的新函数
 */
Function.prototype.myBind = function (context, ...presetArgs) {
  if (typeof this !== 'function') {
    throw new TypeError('myBind must be called by a function')
  }

  // 保存原始函数
  const originFn = this

  // 生成绑定后的包裹函数
  function boundFn(...laterArgs) {
    // 判断当前是不是用 new 调用该函数
    const isNew = this instanceof boundFn
    // new调用：this指向实例，忽略绑定的context；普通调用使用绑定context
    const realThis = isNew ? this : context
    // 拼接：bind预设参数 + 调用时传入的参数
    return originFn.myApply(realThis, [...presetArgs, ...laterArgs])
  }

  // 继承原函数的原型，new关键字实例化正常生效
  if (originFn.prototype) {
    boundFn.prototype = Object.create(originFn.prototype)
    // 修正constructor指向
    Object.defineProperty(boundFn.prototype, 'constructor', {
      value: boundFn,
      writable: true,
      configurable: true
    })
  }

  return boundFn
}

// ========== 测试用例 ==========
console.log('========== 测试 myCall ==========')
const person1 = { name: '张三' }
function sayHello(age) {
  console.log(this.name, age)
}
sayHello.myCall(person1, 20) // 张三 20

console.log('========== 测试 myApply ==========')
sayHello.myApply(person1, [22]) // 张三 22

console.log('========== 测试 myBind ==========')
const bindSay = sayHello.myBind(person1, 18)
bindSay() // 张三 18
// new 测试
function Person(name) {
  this.name = name
}
const BindPerson = Person.myBind(null)
const p = new BindPerson('李四')
console.log(p.name) // 李四