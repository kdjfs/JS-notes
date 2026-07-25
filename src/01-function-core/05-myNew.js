/**
 * 手写 new 操作符

new Person() 内部主要做四件事：

创建新对象。
新对象原型指向构造函数 prototype。
构造函数中的 this 指向新对象。
根据构造函数返回值决定最终结果。
 * 模拟 new 操作符
 * @param {Function} Constructor 构造函数
 * @param  {...any} args 构造函数参数
 */
function myNew(Constructor, ...args) {
    // 校验：myNew第一个入参必须是函数，否则抛出错误
    if (typeof Constructor !== 'function') {
        throw new TypeError('Constructor 必须是函数')
    }

    // 1、创建空实例，绑定原型：instance.__proto__ = Constructor.prototype
    const instance = Object.create(Constructor.prototype)

    // 2、执行构造函数，this绑定为instance，传入参数，接收构造函数return的值
    const result = Constructor.apply(instance, args)

    // 3、判断构造函数的返回值是不是 引用类型（object / function）
    const isObject =
        result !== null &&
        (
            typeof result === 'object' ||
            typeof result === 'function'
        )

    // 是引用值 → 返回构造函数自己return的内容
    // 原始值/无return → 返回我们手动创建的instance实例
    return isObject ? result : instance
}

// 导出
module.exports = myNew


console.log("===== 测试 myNew =====")
// 测试1：正常构造函数
function Person(name) {
  this.name = name
}
const p1 = myNew(Person, "凤伟")
console.log(p1.name) // 凤伟
console.log(p1 instanceof Person) // true

// 测试2：构造函数手动返回一个对象（会覆盖实例）
function Test() {
  this.num = 100
  return { num: 999 }
}
const t = myNew(Test)
console.log(t.num) // 999

// 测试3：构造函数返回基本类型，不影响实例
function Test2() {
  this.age = 20
  return 666
}
const t2 = myNew(Test2)
console.log(t2.age) // 20


