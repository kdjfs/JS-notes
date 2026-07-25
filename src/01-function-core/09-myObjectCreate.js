/**
 * 手写 Object.create（polyfill）
 *
 * 面试一句话原理：
 * 创建一个临时的空构造函数，把它的 prototype 指向目标 proto，new 一下就能得到一个
 * `.__proto__` 指向 proto 的实例。
 *
 * 核心步骤：
 * 1. 校验 proto 必须是对象或 null
 * 2. 创建一个临时空函数 F
 * 3. F.prototype = proto
 * 4. new F() 返回一个空对象，这个对象的隐式原型自动指向 proto
 *
 * 为什么 new F() 后 .__proto__ 就指向 proto？
 * new 操作符的一个步骤是：新对象的 [[Prototype]] = F.prototype
 * 而 F.prototype 被我们设置成了 proto，所以新对象的 .__proto__ 就是 proto。
 *
 * 局限性：
 * - 无法在 ES5 中模拟 Object.create(null)（创建没有原型的对象）
 *   new F() 创建的对象 .__proto__ 一定是 F.prototype，
 *   即使把 F.prototype 设为 null，实例 .__proto__ 也会回退到 Object.prototype
 * - 无法设置属性描述符（第二个参数 propertiesObject）
 */

/**
 * @param {Object|null} proto 新对象的原型
 * @returns {Object} 继承自 proto 的空对象
 */
function myObjectCreate(proto) {
  // proto 必须是 object、function 或 null
  if (proto !== null && typeof proto !== 'object' && typeof proto !== 'function') {
    throw new TypeError('Object prototype may only be an Object or null')
  }

  // 临时空构造函数
  function F() {}

  // 把 F 的原型指向目标 proto
  F.prototype = proto

  // new F() → 实例的隐式原型 .__proto__ 指向 F.prototype = proto
  return new F()
}

module.exports = myObjectCreate

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试 myObjectCreate ==========')

  // 测试1：正常原型链
  console.log('\n--- 测试1：原型链 ---')
  const parent = { name: 'parentObj', greet() { return 'hello' } }
  const child = myObjectCreate(parent)
  console.log('child.name:', child.name)          // parentObj（来自原型）
  console.log('child.greet():', child.greet())    // hello
  console.log('child.__proto__ === parent:',
    Object.getPrototypeOf(child) === parent)       // true

  // 测试2：child 自身没有属性
  console.log('\n--- 测试2：child 自身为空 ---')
  console.log('child 自身属性:', Object.keys(child))  // []

  // 测试3：设置属性不污染原型
  console.log('\n--- 测试3：设置属性 ---')
  child.name = 'child own'
  console.log('child.name:', child.name)           // child own
  console.log('parent.name:', parent.name)         // parentObj（未改变）

  // 测试4：proto 为 null（简单版不支持完全 null 原型，原生 Object.create 支持）
  console.log('\n--- 测试4：proto = null ---')
  console.log('注意：简单 polyfill 的 new F() 无法创建真正的 null 原型对象')
  console.log('原生 Object.create(null) 可行，但 polyfill 需其他方式')

  // 测试5：非对象参数报错
  console.log('\n--- 测试5：非对象报错 ---')
  try {
    myObjectCreate(123)
  } catch (e) {
    console.log('TypeError:', e instanceof TypeError)  // true
  }

  console.log('\n========== myObjectCreate 测试完成 ==========')
}
