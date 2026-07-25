
//这个我没看懂，要花时间慢慢消耗，先跟着手敲二十遍慢慢搞懂
/**
 * 完整版深拷贝
 * 支持：基本类型/Null/Date/RegExp/Map/Set/数组/普通对象/Symbol键/不可枚举属性/原型继承/循环引用
 * @param {*} value 待拷贝的数据
 * @param {WeakMap} cache 缓存容器，专门解决循环引用报错，参数默认值自动新建WeakMap实例
 * @returns {*} 返回一份完全隔离内存的全新数据
 */
function deepClone(value, cache = new WeakMap()) {
  // ====================== 第一段：基本数据类型直接返回 ======================
  // null 是object类型，需要单独判断
  // 除了object，剩余都是原始值（number string boolean symbol bigint undefined）
  // 原始值不存在引用地址，直接返回自己就行，不用拷贝
  if (value === null || typeof value !== 'object') {
    return value
  }

  // ====================== 第二段：缓存处理，解决循环引用（重点） ======================
  // cache结构：key=原对象，value=已经克隆好的新对象
  // 如果当前原对象已经被克隆过，直接取出之前克隆好的对象返回，终止递归，防止无限递归栈溢出
  if (cache.has(value)) {
    return cache.get(value)
  }

  // ====================== 第三段：单独处理 Date 日期对象 ======================
  if (value instanceof Date) {
    // value.getTime() 拿到时间戳，用时间戳新建一个全新日期实例
    const copyDate = new Date(value.getTime())
    // 把【原日期对象-克隆后的日期】存入缓存
    cache.set(value, copyDate)
    // 返回新的日期
    return copyDate
  }

  // ====================== 第四段：单独处理 RegExp 正则对象 ======================
  if (value instanceof RegExp) {
    // source：正则匹配的文本内容  /\d+/g  → source = "\d+"
    // flags：正则修饰符 g/i/m等标识
    const copyReg = new RegExp(value.source, value.flags)
    // lastIndex：正则匹配的游标位置，浅拷贝会共用这个值，深拷贝必须同步赋值
    copyReg.lastIndex = value.lastIndex
    // 存入缓存
    cache.set(value, copyReg)
    return copyReg
  }

  // ====================== 第五段：单独处理 Map 数据结构 ======================
  if (value instanceof Map) {
    // 创建一个空的全新Map
    const copyMap = new Map()
    // 立刻存入缓存！！防止Map内部存在循环引用
    cache.set(value, copyMap)
    // 遍历原Map每一组 key + value
    value.forEach((val, key) => {
      // key有可能是对象、数组，value也可能是复杂类型，全部递归深拷贝再放入新Map
      copyMap.set(deepClone(key, cache), deepClone(val, cache))
    })
    return copyMap
  }

  // ====================== 第六段：单独处理 Set 数据结构 ======================
  if (value instanceof Set) {
    // 新建空Set
    const copySet = new Set()
    // 写入缓存
    cache.set(value, copySet)
    // 遍历Set每一项数据，递归拷贝后加入新Set
    value.forEach(item => {
      copySet.add(deepClone(item, cache))
    })
    return copySet
  }

  // ====================== 第七段：创建数组/普通对象的容器 ======================
  // 判断：如果是数组就创建[]，普通对象就创建一个和原对象原型一致的空对象
  // Object.getPrototypeOf(value) 获取原对象的原型，保证拷贝后的原型和原来一模一样
  const cloneTarget = Array.isArray(value)
    ? []
    : Object.create(Object.getPrototypeOf(value))

  // 重中之重：创建完空容器立刻存入缓存，后面递归属性时如果出现循环引用不会爆栈
  cache.set(value, cloneTarget)

  // ====================== 第八段：遍历对象所有属性，逐个拷贝 ======================
  // Reflect.ownKeys() 可以拿到：普通属性、不可枚举属性、Symbol类型的键
  // for...in 拿不到不可枚举、Symbol，完整版深拷贝必须用 Reflect.ownKeys
  Reflect.ownKeys(value).forEach(key => {
    // 数组自带length属性，数组的length会根据下标自动生成，不需要手动拷贝，直接跳过处理
    if (Array.isArray(value) && key === 'length') return

    // 获取当前key完整的属性描述符
    // 描述符包含：value值、是否可写writable、是否可枚举enumerable、是否可删除configurable、get/set存取器
    const propDesc = Object.getOwnPropertyDescriptor(value, key)

    // 判断该属性是普通数据属性（存在value字段），递归深拷贝属性值
    if ('value' in propDesc) {
      propDesc.value = deepClone(propDesc.value, cache)
    }
    // 将修改好的描述符挂载到新对象身上，保留原有属性全部配置
    Object.defineProperty(cloneTarget, key, propDesc)
  })

  // 最终返回完整克隆完毕的数组/对象
  return cloneTarget
}

// 导出函数，外部文件可以require导入使用
module.exports = deepClone

// ===================== 测试用例 =====================
console.log('========== 深拷贝函数测试 ==========')
// 测试1：普通对象+数组
const originObj = {
  name: 'test',
  info: [1, 2, { a: 100 }],
  symbolKey: Symbol('key')
}
const cloneObj = deepClone(originObj)
originObj.info[2].a = 999
console.log('普通对象拷贝校验：', cloneObj.info[2].a === 100 ? '✅ 深拷贝成功' : '❌ 拷贝失败')

// 测试2：循环引用
const cycleObj = { num: 666 }
cycleObj.self = cycleObj
const cloneCycle = deepClone(cycleObj)
console.log('循环引用校验：', cloneCycle.self === cloneCycle ? '✅ 循环引用正常处理' : '❌ 循环引用报错')

// 测试3：Date、RegExp
const data = {
  d: new Date(),
  r: /\d+/g
}
const cloneData = deepClone(data)
data.d.setTime(0)
data.r.lastIndex = 99
console.log('日期正则校验：', cloneData.d.getTime() !== 0 && cloneData.r.lastIndex === 0 ? '✅' : '❌')

// 测试4：Map Set
const map = new Map([['x', 1], [Symbol(), 2]])
const set = new Set([10, 20, [30, 40]])
const cloneMap = deepClone(map)
const cloneSet = deepClone(set)
console.log('Map&Set校验：', cloneMap.get('x') === 1 && cloneSet.has(10) ? '✅ Map Set拷贝正常' : '❌')
    