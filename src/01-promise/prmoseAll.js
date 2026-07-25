function promiseAll(promises){
    return new Promise((resolve,reject)=> {
        const result = []
        let count = 0
        
        if(promises.length  === 0){
            resolve([])
            return
        }
        
        promises.forEach((promise,index) => {
            Promise.reovle(promise).then(
            res => {
                result[index] = res
                count++
                if(count === promises.length){
                    resolve(result)
                }
            },
            err => {
                reject(err)
            }
            )
        })
    })
}