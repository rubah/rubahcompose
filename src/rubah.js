const rubahjs = require("rubahjs");

function initRubah(opts) {
    opts.module = opts.module || module;
    let rubah = new rubahjs.new();
    rubah._register = function(file, opts) {
        const o = Object.assign(opts)
        this.register(opts.module.require('./' + file.substr(0, file.length - 3))(o));
    }
    rubah.promiseScan = async function(path) {
        return new Promise(v => {
            rubah.scan(path, x => v(x));
        });
    }
    rubah._register(opts.composefile || 'composefile.js');
    return rubah;
}

module.exports = initRubah;