# 前端手写题面试复习清单

> 按 P0 → P1 → P2 优先级排序，每道题一句话原理 + 易错点 + 追问。

---

## P0：必刷（面试出现率 90%+）

### 01-function-core（函数与JS核心）

| # | 题目 | 文件 | 一句话原理 | 时间复杂度 | 最容易写错的点 | 面试官追问 |
|---|------|------|-----------|-----------|---------------|-----------|
| 1 | 防抖 debounce | `01-debounce.js` | 每次触发重置定时器，只有最后一次触发后等待结束才执行 | O(1) | clearTimeout 后没重新计时；this 指向丢失 | 如何实现 immediate 立即执行版本？节流和防抖的区别？ |
| 2 | 节流 throttle | `02-throttle.js` | 用时间戳/定时器确保固定间隔内只执行一次 | O(1) | 最后一次触发的尾部调用可能丢失；this 丢失 | throttle 的 trailing 尾部执行如何实现？用定时器怎么做？ |
| 3 | 深拷贝 deepClone | `03-deepClone.js` | 递归拷贝每个属性，Map/WeakMap解决循环引用，特殊对象单独处理 | O(n) | 循环引用没有用缓存导致栈溢出；忘记处理 Date/RegExp/Map/Set | WeakMap 和 Map 在深拷贝中有什么区别？Symbol属性怎么拷贝？ |
| 4 | call/apply/bind | `04-call-apply-bind.js` | 函数挂到对象上作为方法调用，this自动指向对象；bind返回新函数 | O(1) | bind 返回函数的 new 行为没处理；忘记修正 constructor | bind 返回的函数 new 时 this 指向谁？为什么？ |
| 5 | new 操作符 | `05-myNew.js` | 创建空对象→绑定原型→执行构造函数→判断返回值类型 | O(1) | 忘记判断构造函数 return 对象的情况；箭头函数不能用 new | 构造函数 return 基本类型和对象有什么区别？ |
| 6 | instanceof | `06-myInstanceof.js` | 沿左边.__proto__链向上找，匹配右边.prototype | O(n) | 没判断 null 和基本类型；循环条件是 proto !== null 不是 !== undefined | instanceof 和 typeof 的区别？Object.prototype.toString 呢？ |
| 7 | 寄生组合继承 | `07-parasiticCombinationInheritance.js` | Parent.call(this)继承实例属性 + Object.create(Parent.prototype)继承原型方法 | O(1) | 忘记修正 constructor；用 new Parent() 而不是 Object.create；组合继承调用两次 Parent | ES6 class extends 和寄生组合继承的关系？Object.create vs new Parent()的区别？ |
| 8 | 千分位 | `08-thousandSeparator.js` | 整数部分从后往前每三位加逗号，用循环或正则实现 | O(n) | 小数部分也被加了逗号；负号处理遗漏 | 正则 \B(?=(\d{3})+(?!\d)) 每部分是什么意思？ |
| 9 | Object.create | `09-myObjectCreate.js` | 空函数 F.prototype = proto，new F()返回 proto 为原型的空对象 | O(1) | proto 参数类型校验；无法模拟 null 原型对象 | Object.create(null) 创建的"纯净对象"有什么用处？ |

### 02-promise-series（Promise全家桶）

| # | 题目 | 文件 | 一句话原理 | 时间复杂度 | 最容易写错的点 | 面试官追问 |
|---|------|------|-----------|-----------|---------------|-----------|
| 1 | MyPromise | `01-MyPromise.js` | then收集回调到两个队列，resolve/reject异步执行队列，每次then返回新Promise实现链式调用 | - | 状态只能改变一次忘记判断；then不返回新Promise；循环引用没检测 | 为什么回调必须异步执行？Promise/A+规范是什么？ |
| 2 | Promise.all | `02-promiseAll.js` | 全部成功按序返回结果，一个失败整体立刻reject | O(n) | 结果顺序和传入顺序不一致；空数组没直接resolve | Promise.all vs Promise.allSettled 区别？ |
| 3 | Promise.race | `03-promiseRace.js` | 第一个敲定状态的Promise决定整体 | O(n) | 空数组没有直接返回pending Promise（应该永久pending） | race 用在什么场景？请求超时怎么用？ |
| 4 | Promise.any | `04-promiseAny.js` | 一个成功即resolve，全部失败才AggregateError | O(n) | 没累积错误列表；any 只有一个成功就停止等待其他 | any vs race 本质区别？ |
| 5 | Promise.allSettled | `05-promiseAllSettled.js` | 等所有完成，永远不reject，返回{status,value/reason}数组 | O(n) | 在 reject 分支 resolve 了；用不到 reject 参数 | allSettled 适用什么业务场景？ |
| 6 | finally | `06-promiseFinally.js` | 调用 this.then 同时处理成功和失败，执行回调后原样透传结果 | O(1) | 回调报错忘了覆盖原结果；回调返回Promise忘了等待 | finally 的回调参数是什么？（答案：没有参数） |
| 7 | 并发控制 | `07-promisePool.js` | 共享游标+limit个worker并发抢占任务，while循环直到所有任务完成 | O(n) | 结果按下标存但多worker同时操作需原子化游标；空数组 | limit个worker怎么分配任务？为什么用 while(true)？ |
| 8 | 请求重试 | `08-promiseRetry.js` | for循环尝试，成功返回，失败sleep后重试，到达最大次数还失败则抛出 | O(retries) | 循环条件没加等号(attempt<=maxRetries)；最后一次错误忘记抛出 | 重试的退避策略有哪些？指数退避怎么做？ |
| 9 | resolve/reject | `09-promiseResolveReject.js` | resolve展开thenable/Promise，reject不展开直接作为失败原因 | O(1) | resolve Promise时直接new新Promise了；reject对Promise做了展开 | resolve(Promise.reject()) 返回什么状态？ |
| 10 | sleep | `10-sleep.js` | setTimeout包装Promise.resolve，await暂停async函数后续代码 | O(1) | 认为sleep会阻塞主线程（不会！） | sleep 和同步等待的区别？forEach + await 为什么不行？ |

### 03-design-pattern（设计模式）

| # | 题目 | 文件 | 一句话原理 | 时间复杂度 | 最容易写错的点 | 面试官追问 |
|---|------|------|-----------|-----------|---------------|-----------|
| 1 | EventEmitter | `01-EventEmitter.js` | Map(事件名→Set(回调))，on存回调，emit执行，once执行前先off | O(1) | emit时遍历Set忘了拷贝直接操作导致foreach出错；once解绑时机 | 和浏览器 EventTarget 的区别？Node.js EventEmitter 为什么用 Set 而不用数组？ |

### 04-array-methods（数组方法重写）

| # | 题目 | 文件 | 一句话原理 | 时间复杂度 | 最容易写错的点 | 面试官追问 |
|---|------|------|-----------|-----------|---------------|-----------|
| 1 | myMap | `01-myMap.js` | 遍历原数组，callback处理每个元素，返回新数组 | O(n) | 稀疏空位没跳过；忘了传thisArg | map 的 callback 接收几个参数？ |
| 2 | myFilter | `02-myFilter.js` | 遍历原数组，callback返回true的元素push进新数组 | O(n) | 空位和值为undefined/false的元素混淆；结果长度不定用push | filter(Boolean) 能过滤哪些值？ |
| 3 | myReduce | `03-myReduce.js` | accumulator累计，每轮callback合并当前值 | O(n) | 没传initialValue时从i=1开始但空数组报错；用arguments.length不用initialValue===undefined | 如何用 reduce 实现 map？`acc.push()` 为什么不行？ |
| 4 | myFlat | `04-myFlat.js` | reduce 递归：是数组则继续展开，否则拼接 | O(n) | 递归忘记deep参数；没处理Infinity深度 | flat(Infinity) 怎么实现的？ |

### 05-array-algorithm（数组算法）

| # | 题目 | 文件 | 一句话原理 | 时间复杂度 | 最容易写错的点 | 面试官追问 |
|---|------|------|-----------|-----------|---------------|-----------|
| 1 | 数组去重 | `01-arrayUnique.js` | Set天然去重O(n)，循环版用includes检查 | O(n) / O(n²) | NaN 去重Set能但indexOf不能；对象数组需按字段去重 | Set 为什么能去重 NaN？SameValueZero 和 === 的区别？ |
| 2 | 数组转树 | `02-flatToTree.js` | Map先存所有节点O(1)查找，再按parentId挂children | O(n) | 用了递归查找父节点O(n²)；忘记处理空children | 如果数据量十万级怎么办？递归版为什么是O(n²)？ |
| 3 | 树转数组 | `03-treeToFlat.js` | 递归DFS，解构分离children和普通属性，push进结果 | O(n) | 结果中混入了children字段（需要用解构去掉） | 如果树层级极深怎么办？（用栈迭代避免爆栈） |
| 4 | 大数相加 | `04-bigNumberAdd.js` | 双指针从末位相加，carry进位，直到两数都完且无进位 | O(max(n,m)) | 最高位进位忘记处理；结果没反转；没补0 | BigInt 内部是什么数据结构？ |
| 5 | 快速排序 | `05-quickSort.js` | 选pivot，小的左大的右，递归排左右再拼接 | O(n log n) 平均 | 基准值选第一个在已排序数组时O(n²)；忘了处理等于的情况 | 最坏O(n²)什么时候出现？怎么优化选pivot？ |
| 6 | 二分查找 | `06-binarySearch.js` | left/right双指针取mid比较，小去右大去左 | O(log n) | 循环条件写成left<right漏本组；mid没加left导致不更新 | left+right直接加会溢出吗？JS中会吗？ |
| 7 | 最长无重复子串 | `07-longestSubstring.js` | right右扩窗口，Map记位置，遇重复left跳到重复位+1 | O(n) | left更新没Math.max导致回退；字符位置忘记更新 | 为什么是O(n)？Map和对象字面量的区别？ |
| 8 | 集合运算 | `08-arraySetOperations.js` | Set.has快速判断，filter选出交集/差集，Set合并并集 | O(n+m) | 没对输入数组先去重导致结果重复 | 并集去重时用什么数据结构？ |
| 9 | 版本号比较 | `09-versionCompare.js` | split('.')后逐段转Number比对，短版补0 | O(n) | 用了parseFloat比较导致1.0.10和1.0.2判相等 | 如果版本号有字母前缀怎么办？ |
| 10 | 数组实用函数 | `10-arrayUtilities.js` | groupBy用对象分组、chunk用slice分批、shuffle用Fisher-Yates | O(n) | shuffle用sort(random)不均衡；chunk非法size没校验 | Fisher-Yates 为什么比 sort(random) 好？ |

### 06-lodash-like（工具函数）

| # | 题目 | 文件 | 一句话原理 | 时间复杂度 | 最容易写错的点 | 面试官追问 |
|---|------|------|-----------|-----------|---------------|-----------|
| 1 | curry | `01-curry.js` | 闭包收集参数，够了(>=fn.length)执行，不够返回函数继续收 | O(1) 每次 | fn.length不包括默认参数和rest；参数顺序拼接 | 如何实现占位符？curry 和 partial 的区别？ |
| 2 | compose/pipe | `02-composePipe.js` | compose用reduceRight从右到左、pipe用reduce从左到右串函数 | O(n) | 执行顺序搞反；忘了处理空参数情况 | Redux中间件的compose怎么用？ |
| 3 | memoize | `03-memoize.js` | Map缓存函数执行结果，key=JSON.stringify(args)，命中就不重新算 | O(1) 查询 | JSON.stringify不支持循环引用/函数/Symbol；缓存无限增长 | 如何实现LRU版的memoize？用WeakMap行吗？ |

---

## P1：高频（出现率 60%+）

| # | 题目 | 文件 | 一句话原理 | 时间复杂度 | 最容易写错的点 | 面试官追问 |
|---|------|------|-----------|-----------|---------------|-----------|
| 1 | LRU Cache | `src/07-data-structure/01-LRUCache.js` | Map保持插入顺序，get/put时delete再set移到最新，超容量删第一个 | O(1) | delete和set的顺序；顺序变了没反映 | 生产级为什么用双向链表+Map而不是纯Map？ |

---

## P2：场景代码题（出现率 40%+）

| # | 题目 | 文件 | 一句话原理 | 最容易写错的点 | 面试官追问 |
|---|------|------|-----------|---------------|-----------|
| 1 | LazyMan | `src/08-scene-coding/01-LazyMan.js` | 任务队列+setTimeout异步启动，eat/sleep往队尾push，sleepFirst插队 | sleepFirst用unshift但不要越过sayHi；next调用链 | 如果任务中出错怎么处理？ |
| 2 | 请求超时 | `src/08-scene-coding/02-requestTimeout.js` | Promise.race让请求和超时Promise赛跑 | 超时后底层请求没真正取消；定时器忘清理 | AbortController怎么配合fetch？ |
| 3 | 请求去重 | `src/08-scene-coding/03-requestDeduplicate.js` | Map缓存进行中的Promise，相同key返回同一个，完成后清理 | 失败也清理缓存（否则后续请求被永久阻塞） | 这是"进行中"去重，和缓存成功结果有什么区别？ |
| 4 | 请求缓存TTL | `src/08-scene-coding/04-requestCacheTTL.js` | 成功结果+过期时间存入Map，未过期直接返回 | 用Date.now() + TTL算过期，别用setTimeout主动清理 | TTL缓存和HTTP缓存的关系？ |
| 5 | 采用最新请求 | `src/08-scene-coding/05-latestRequestWins.js` | 递增requestId，响应时检查是否是最新id，旧的丢弃 | 只判断了成功没判断失败；竞态发生在网络层不是代码层 | 怎么用AbortController代替requestId？ |
| 6 | 分片渲染 | `src/08-scene-coding/06-chunkRender.js` | requestAnimationFrame每帧渲染固定数量，时间切片不阻塞主线程 | Node.js没有rAF需要降级为setTimeout | 和虚拟列表有什么区别？ |
| 7 | 可暂停轮询 | `src/08-scene-coding/07-polling.js` | 递归setTimeout（非setInterval），请求完成后再排下一次 | 用了setInterval导致请求堆积；stop时没清timeout | 轮询、长轮询、WebSocket的区别？ |

---

## 推荐学习路线

1. **第一周**：P0 01-function-core + 04-array-methods（基础最高频）
2. **第二周**：P0 02-promise-series 全部（面试重灾区）
3. **第三周**：P0 05-array-algorithm + 03-design-pattern
4. **第四周**：P1 全部 + P2 全部

### 背诵技巧

- **先背骨架**：每道题的极简骨架（去注释去测试约 10-20 行），对着键盘盲打 5 遍
- **再理解原理**：每道题"一句话原理"能不看文档默写下来
- **最后跑测试**：`node 文件路径` 验证自己的手写代码
