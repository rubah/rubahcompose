function doMap(obj, f, p, keys, circularList){
    let res = {};
    for (let key in obj) {
        let nkeys = Array.from(keys);
        nkeys.push(key);
        res[key] = f(nkeys, obj[key]);
        if(typeof obj[key] === "object" && circularList.indexOf(obj[key])==-1 ){
            if(typeof p == "function" && p(nkeys,res[key])){
            }else{
                circularList.push(obj[key]);
                res[key] = doMap(obj[key],f,p,nkeys,circularList);
            }
        }
    }
    return res;
}

function objectMap(obj,f,p) {
    return doMap(obj, f, p, [], []);
}

module.exports = objectMap;
