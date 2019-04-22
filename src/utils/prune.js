function doPrune(obj, circularList){
    let res = {};
    for(let key in obj){
        if(typeof obj[key] != "undefined"){
            if(typeof obj[key] === "object" && circularList.indexOf(obj[key])==-1 ){
                circularList.push(obj[key]);
                res[key] = doPrune(obj[key],circularList);
            }else if(typeof res[key] != "object")
                res[key] = obj[key];
        }
    }
    return res;
}

module.exports = function (obj){ return doPrune(obj,[]) };
