const objectMap = require("./objectMap");

// function doLeafMap(obj, f, keys){
//     let res = {};
//     for (let key in obj) {
//         let nkeys = Array.from(keys);
//         nkeys.push(key);
//         if(typeof obj[key] === "object" && circularList.indexOf(obj[key])==-1 ){
//             circularList.push(obj[key]);
//             res[key] = doLeafMap(obj[key],f,nkeys);
//         }else
//             res[key] = f(nkeys, obj[key]);
//     }
//     return res;
// }

function leafMap(obj,f) {
    return objectMap(obj,(keys,value)=>{
        if(typeof value === "object") return value;
        return f(keys,value);
    }, ()=>false)
}

module.exports = leafMap;
