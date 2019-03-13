let circularList = [];

function doLeafMap(obj, f, keys){
    let res = {};
    for (let key in obj) {
        let nkeys = Array.from(keys);
        nkeys.push(key);
        if(typeof obj[key] === "object" && circularList.indexOf(obj[key])==-1 ){
            res[key] = doLeafMap(obj[key],f,nkeys);
        }else
            res[key] = f(nkeys, obj[key]);
    }
    return res;
}

function leafMap(obj,f) {
    return doLeafMap(obj, f, []);
}

module.exports = leafMap;
