function flattenLeafValues(obj){
    let res = [];
    for(let key in obj){
        if(typeof obj[key] === "object") res = res.concat(flattenLeafValues(obj[key]));
        res.push(obj[key]);
    }
    return res;
}

module.exports = flattenLeafValues;