const _ = require("lodash");
const map = require("./utils/objectMap");
const prune = require("./utils/prune");
const flatten = require("./utils/flatten");

module.exports = function (obj, phase, sub, name){
    let res = map(obj,(keys,value)=>{
        if(keys[1] === sub && keys.length == 3){
            let res = {...value};
            res[phase] = keys[0];
            res[name] = keys[2];
            return res;
        } else if(keys[1] && keys[1]!== sub) return undefined;
        return value;
    },(keys,value)=>{
        if(keys[1] === sub && keys.length == 3) return true;
        return false;
    });
    return flatten(prune(res),3);
}