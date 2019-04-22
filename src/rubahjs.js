const rubahjs = require("../../rubahjs/index");

function initRubah(opts) {
    opts.module = opts.module || module;
    let rubah = new rubahjs.new(opts);
    rubah.module = opts.module;
    rubah._register = function(file) {
        this.register(this.module.require('./' + file.substr(0, file.length - 3))(opts));
    };
    rubah.registerTemplates = function(templates) {
        for (let key in templates) {
            let template = templates[key];
            this._register(template.substr(template.length - 3) == '.js' ? template : template + '.js');
        }
    };
    if(opts.templates) rubah.registerTemplates(opts.templates);
    rubah.promiseScan = async function(path) {
        return new Promise(v => {
            rubah.scan(path, x => v(x));
        });
    };
    rubah.exec = async function(opts) {
        let state = await rubah.promiseScan(opts.path);
        if (opts.materialize)
            await rubah.materialize();
        return state;
    };
    return rubah;
}

module.exports = initRubah;
