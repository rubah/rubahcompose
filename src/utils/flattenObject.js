let fo = function(o, map, keys, res){
    for(let key in o){
        if(typeof map == "function")
            res.push(map({key: keys.concat([key]), value: o[key]}));
        else
            res.push({key: keys.concat([key]), value: o[key]});
        if(typeof o[key] == "object") fo(o[key],map,keys.concat([key]),res);
    }
    return res;
}

module.exports = function(o,map){
    return fo(o,map,[],[]);
}