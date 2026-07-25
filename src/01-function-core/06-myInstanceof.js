/**
 * 手写 instanceof 运算符底层实现
 * 原理：沿着实例的 __proto__ 原型链向上遍历，匹配是否存在构造函数的 prototype
 * @param {*} instance 实例对象
 * @param {Function} Constructor 构造函数
 * @returns {boolean} 是否属于该构造函数的实例
 */
function myInstanceof(instance, Constructor) {
  // 规则：原始值、null 没有原型链，直接返回 false
  if (
    instance === null ||
    (typeof instance !== 'object' && typeof instance !== 'function')
  ) {
    return false
  }

  // instanceof 右边必须是函数，否则原生JS直接报错
  if (typeof Constructor !== 'function') {
    throw new TypeError("Right-hand side of 'instanceof' is not callable")
  }

  // 拿到构造函数显式原型
  const consPrototype = Constructor.prototype
  // 获取实例第一层隐式原型（等价 instance.__proto__，标准API写法）
  let nowProto = Object.getPrototypeOf(instance)

  // 循环向上追溯整条原型链，原型链顶端 Object.__proto__ = null
  while (nowProto !== null) {
    // 原型匹配上 → 是该构造的实例
    if (nowProto === consPrototype) {
      return true
    }
    // 向上找父级原型
    nowProto = Object.getPrototypeOf(nowProto)
  }

  // 整条链遍历完毕无匹配
  return false
}

module.exports = myInstanceof

// ===================== 测试用例 =====================
console.log("===== 测试 myInstanceof ====")
function Person(name) {
  this.name = name
}
const p = new Person("测试")

console.log(myInstanceof(p, Person)) // true
console.log(myInstanceof(p, Object)) // true 所有对象都继承Object
console.log(myInstanceof([1,2,3], Array)) // true
console.log(myInstanceof(123, Number)) // false 基本类型
console.log(myInstanceof(()=>{}, Function)) // true
console.log(myInstanceof(null, Object)) // false