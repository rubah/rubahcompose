module.exports = function(obj,n){
    let res = [obj];
    for(let i=0; i<n; i++){
        let temp = [];
        for(let o of res){
            temp = temp.concat(Object.values(o));
        }
        res = temp;
    }
    return res;
}