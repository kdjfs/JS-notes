"# JS-notes" 
记录自己学习JS的编程题、面试中常考到的手撕

js-handwrite-notes       # 仓库根目录（GitHub仓库名）
├── README.md            # 仓库首页说明（面试加分项）
└── src
    ├── 01-function-core     # 模块1：函数与JS核心原理（6道，面试最高频）
    │   ├── 01-debounce.js      # 防抖 debounce
    │   ├── 02-throttle.js      # 节流 throttle
    │   ├── 03-deepClone.js     # 深拷贝 deepClone
    │   ├── 04-call-apply-bind.js # call / apply / bind 三兄弟
    │   ├── 05-myNew.js         # 手写 new 操作符
    │   └── 06-myInstanceof.js  # 手写 instanceof
    │
    ├── 02-promise-series    # 模块2：Promise 全家桶（10道，面试重灾区）
    │   ├── 01-MyPromise.js      # 完整手写 Promise 基础版
    │   ├── 02-promiseAll.js     # Promise.all
    │   ├── 03-promiseRace.js    # Promise.race
    │   ├── 04-promiseAny.js     # Promise.any
    │   ├── 05-promiseAllSettled.js # Promise.allSettled
    │   ├── 06-promiseFinally.js # Promise.prototype.finally
    │   ├── 07-promisePool.js    # Promise 并发控制（限流）
    │   ├── 08-promiseRetry.js   # Promise 请求重试
    │   ├── 09-promiseResolveReject.js # resolve/reject 静态方法
    │   └── 10-sleep.js          # sleep 延时函数
    │
    ├── 03-design-pattern    # 模块3：设计模式与事件通信（1道）
    │   └── 01-EventEmitter.js  # 发布订阅 EventEmitter
    │
    ├── 04-array-methods     # 模块4：数组原生方法重写（4道）
    │   ├── 01-myMap.js         # 手写 Array.prototype.map
    │   ├── 02-myFilter.js      # 手写 Array.prototype.filter
    │   ├── 03-myReduce.js      # 手写 Array.prototype.reduce
    │   └── 04-myFlat.js        # 手写 flat 数组扁平化
    │
    └── 05-array-algorithm   # 模块5：数组与数据处理算法（10道）
        ├── 01-arrayUnique.js    # 数组去重（基础版+对象按字段去重）
        ├── 02-arrayToTree.js    # 扁平数组转树形结构
        ├── 03-treeToArray.js    # 树形结构转扁平数组
        ├── 04-groupBy.js        # 数组按字段分组 groupBy
        ├── 05-twoSum.js         # 两数之和
        ├── 06-arraySetOps.js    # 数组交集 / 并集 / 差集
        ├── 07-arrayShuffle.js   # Fisher-Yates 洗牌算法
        ├── 08-arrayMaxMin.js    # 数组最大值 + 最小值
        ├── 09-chunkArray.js     # 数组分片切割
        └── 10-mergeSortedArray.js # 双指针合并有序数组