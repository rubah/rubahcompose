function leafmap(obj, f, keys) {
    let res = [];
    if(typeof keys == "undefined") keys = [];
    for (let key in obj) {
        let nkeys = Array.from(keys);
        nkeys.push(key);
        let x = f(nkeys, obj[key]);
        if(x || x===false)
            res.push(x);
        if(typeof obj[key] === "object"){
            res = res.concat(...leafmap(obj[key],f,nkeys));
        }
    }
    return res;
}

// let x = {
//     "home": {
//         "user": "rubahjs-doc"
//     },
//     "usr": {
//         "bin": "test",
//         "temp": {
//             "test": 1
//         }
//     }
// }

// let y = leafmap({a: 1}, (k, v) => {
//     if (typeof v != "object")
//         return require("path").resolve('/',...k) + ': ' + v;
// });

// console.log(y);

module.exports = leafmap;
