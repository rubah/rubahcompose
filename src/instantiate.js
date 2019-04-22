const fs = require("fs");
const rimraf = require("rimraf");
const protocols = require("./protocols");

function prep(name, obj,phase) {
    obj._name = name;
    fs.mkdirSync(phase+'/' + name);
    let protocol = protocols[obj.protocol] || protocols['file'];
    protocol.instantiate(obj, phase);
}

module.exports = function(state,phase){
    let res = state.config[phase];
    rimraf.sync(phase);
    fs.mkdirSync(phase);
    if (res)
        for (let key in res)
            prep(key, res[key],phase);
}