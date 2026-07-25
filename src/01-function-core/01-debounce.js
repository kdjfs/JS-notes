// ========== 核心实现：防抖函数 ==========
/**
 * 防抖函数：用户连续触发时，只执行最后一次
 * @param {Function} fn 需要防抖处理的函数
 * @param {number} wait 等待时间，单位毫秒
 * @param {boolean} immediate 是否立即执行
 * @returns {Function} 防抖后的函数
 */
function debounce(fn, wait, immediate = false) {
    // 保存定时器id
    let timer = null

    function debounced(...args) {
        // 保存调用时的 this 指向
        const context = this

        // immediate为true 且 当前没有定时器时，立即执行
        const shouldCallNow = immediate && timer === null

        // 每次触发都清除之前的定时器，重新计时
        if (timer !== null) {
            clearTimeout(timer)
        }

        // 重新设置定时器
        timer = setTimeout(() => {
            // 定时器执行后清空标记
            timer = null
            // 非立即执行模式：等待结束后执行函数
            if (!immediate) {
                fn.apply(context, args)
            }
        }, wait)

        // 立即执行模式
        if (shouldCallNow) {
            return fn.apply(context, args)
        }
    }

    // 提供取消防抖的方法
    debounced.cancel = function () {
        if (timer !== null) {
            clearTimeout(timer)
            timer = null
        }
    }

    return debounced
}

// ========== 导出模块 ==========
module.exports = debounce;

// ========== 测试用例 ==========
console.log('=== 测试：防抖 debounce ===');
console.log('连续触发3次，500ms后只会输出最后一次 "vue"');

const handleSearch = debounce(function (keyword) {
    console.log('执行搜索：', keyword);
}, 500);

// 连续触发
handleSearch('v');
handleSearch('vu');
handleSearch('vue');