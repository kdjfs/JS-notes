// ========== 核心实现：节流函数(纯时间戳最简版) ==========
/**
 * 节流函数：固定间隔内只执行一次（头部触发，无尾部兜底）
 * @param {Function} fn 需要节流处理的函数
 * @param {number} delay 节流间隔，单位毫秒
 * @returns {Function} 节流后的函数
 */
function throttle(fn, delay =300 ) {
    // 闭包缓存上一次函数执行的时间戳
    let lastTime = 0

    function throttled(...args) {
        const now = Date.now()
        // 距离上次执行超过设定间隔，放行执行
        if (now - lastTime >= delay) {
            lastTime = now
            fn.apply(this, args)
        }
    }

    // 重置节流状态，配套cancel方法
    throttled.cancel = function () {
        lastTime = 0
    }

    return throttled
}

// ========== 导出模块 ==========
module.exports = throttle;

// ========== 测试用例 ==========
console.log('=== 测试：节流 throttle ===');
console.log('短时间连续调用多次，只会执行第一次，其余被拦截');

const testLog = throttle(function (content) {
    console.log('节流执行打印内容：', content);
}, 100);

// 密集连续调用

// 几乎同一时刻疯狂调用节流函数
testLog(111)
setTimeout(()=>{testLog(222)},150)
setTimeout(()=>{testLog(333)},300)
setTimeout(()=>{testLog(444)},450)

testLog.cancel(555)
testLog(555666)