const leafMap = require("./utils/leafMap");

let envPattern = /^\$\{(.*)\}$/;

function evalEnv(obj) {
    return leafMap(obj, (keys, value) => {
        if (typeof value === "string") {
            if (envPattern.test(value)) {
                return process.env[envPattern.exec(value)[1]];
            }
            return value;
        }
        return value;
    })
}

module.exports = evalEnv;