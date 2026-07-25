/**
 * 寄生组合继承（ES5 最佳继承方案）
 *
 * 面试一句话原理：
 * Child 中 call Parent 继承实例属性，再用 Object.create 把 Child 原型指向 Parent 原型继承方法，
 * 只用一次 Parent 调用，是 ES5 中最优继承方案。
 *
 * 核心步骤：
 * 1. 在 Child 构造函数中通过 Parent.call(this, ...args) 继承 Parent 的实例属性
 * 2. Child.prototype = Object.create(Parent.prototype) 继承 Parent 原型方法
 * 3. 修正 Child.prototype.constructor 指向 Child 自身
 *
 * 为什么不用其他继承方案？
 *
 * 1. 原型链继承（Child.prototype = new Parent()）：
 *    - 问题：所有 Child 实例共享 Parent 实例中的引用属性（如数组、对象）
 *    - 改了一个实例的 arr，其他实例的 arr 也跟着变
 *
 * 2. 借用构造函数继承（Parent.call(this)）：
 *    - 问题：只能继承实例属性，无法继承 Parent 原型上的方法
 *
 * 3. 组合继承（Parent.call + new Parent()）：
 *    - 问题：Parent 被调用了两次 → 浪费，子原型上多了一套多余的属性
 *
 * 4. 寄生组合继承（Parent.call + Object.create）：
 *    - 优点：Parent 只调用一次，实例属性来自 Parent.call，原型方法来自 Object.create
 *    - 这是 ES6 class extends 的底层实现
 */

/**
 * --- 面试过程完整示例 ---
 * 面试官：请用 ES5 写寄生组合继承
 * 你应该按以下顺序写（先写代码，再解释）
 */

// ====================== 父类 ======================
function Parent(name) {
  this.name = name
  this.colors = ['red', 'blue']  // 引用类型——用来验证不会共享
}

Parent.prototype.sayName = function () {
  return this.name
}

// ====================== 子类 ======================
function Child(name, age) {
  // 步骤1：继承实例属性（父类构造函数中 this.xxx 的属性）
  // 把 Parent 当作普通函数调用，this 指向 Child 实例
  Parent.call(this, name)

  // 子类自己的属性
  this.age = age
}

// 步骤2：继承原型方法
// 关键：Object.create 创建空对象，把原型指向 Parent.prototype
// 用 new Parent() 会多执行一次 Parent 构造函数，在原型上创建多余的实例属性
// 用 Object.create(Parent.prototype) 只建立原型链，不执行构造函数
Child.prototype = Object.create(Parent.prototype)

// 步骤3：修正 constructor
// 为什么必须修正？Object.create 后，Child.prototype.constructor 默认指向 Parent
// 不加这一步，instance.constructor 就不会指向 Child，行为和预期不一致
Child.prototype.constructor = Child

// ---- 子类自己的原型方法 ----
Child.prototype.sayAge = function () {
  return this.age
}

module.exports = { Parent, Child }

// ====================== 测试用例 ======================
if (require.main === module) {
  console.log('========== 测试寄生组合继承 ==========')

  const child1 = new Child('张三', 20)
  const child2 = new Child('李四', 25)

  console.log('\n--- 测试1：实例属性 ---')
  console.log('child1.name:', child1.name)  // 张三
  console.log('child1.age:', child1.age)    // 20
  console.log('child2.name:', child2.name)  // 李四

  console.log('\n--- 测试2：原型方法 ---')
  console.log('child1.sayName():', child1.sayName())  // 张三
  console.log('child1.sayAge():', child1.sayAge())    // 20

  console.log('\n--- 测试3：引用类型不共享 ---')
  child1.colors.push('green')
  console.log('child1.colors:', child1.colors)  // ['red', 'blue', 'green']
  console.log('child2.colors:', child2.colors)  // ['red', 'blue'] ← 没有被污染

  console.log('\n--- 测试4：原型链检测 ---')
  console.log('child1 instanceof Child:', child1 instanceof Child)   // true
  console.log('child1 instanceof Parent:', child1 instanceof Parent) // true
  console.log('child1.constructor === Child:', child1.constructor === Child)  // true

  console.log('\n--- 测试5：constructor 修正验证 ---')
  console.log('Child.prototype.constructor === Child:',
    Child.prototype.constructor === Child)  // true

  console.log('\n--- 测试6：Child.prototype 上无多余属性 ---')
  console.log('Child.prototype 上 name 属性:',
    Child.prototype.hasOwnProperty('name'))  // false ← 说明没调用 Parent 构造函数

  console.log('\n========== 继承测试完成 ==========')
}
