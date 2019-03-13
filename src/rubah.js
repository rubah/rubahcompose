const rubahjs = require("rubahjs");
const evalEnv = require("./evalEnv");

function initRubah(opts) {
    opts.module = opts.module || module;
    let rubah = new rubahjs.new();
    rubah.module = opts.module;
    rubah._register = function(file) {
        this.register(this.module.require('./' + file.substr(0, file.length - 3))(opts));
    }
    rubah.registerTemplates = function(x, phase) {
        if (x.templates)
            for (let key in x.templates) {
                let template = x.templates[key];
                if (typeof x.template.phase == "undefined" || x.template.phase == phase) {
                    template = template.path;
                    this._register(template.substr(template.length - 3) == '.js' ? template : template + '.js');
                }
            }
    }
    rubah.promiseScan = async function(path) {
        return new Promise(v => {
            rubah.scan(path, x => v(x));
        });
    }
    rubah.exec = async function(config, materialize){
        if(config)
            rubah.registerTemplates(config, "export");
        let state = await rubah.promiseScan('.');
        state.config = evalEnv(state.config);
        if(materialize)
            await rubah.materialize();
        return state;
    }
    rubah._register(opts.composefile || 'composefile.js');
    return rubah;
}

module.exports = initRubah;
