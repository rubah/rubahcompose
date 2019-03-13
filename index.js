require('custom-env').env(process.env.RUBAH_COMPOSE_STAGE || 'dev');
const rubahjs = require("rubahjs");
const fileSource = require("rubahjs/fileSource");
const fs = require("fs");
const recursive = require("recursive-readdir");
const util = require("util");
const rimraf = require("rimraf");
const _ = require("lodash");
const protocols = require("./protocols");
const shell = require("shelljs");
const path = require("path");
const flattenLeafValues = require("./src/utils/flattenLeafValues");
const leafMap = require("./src/utils/leafMap");
const evalEnv = require("./src/evalEnv");

let rubah;

function leafFlatMap(obj, f) {
    return flattenLeafValues(leafMap(obj, f))
}

function register(file, opts) {
    const o = Object.assign({
        module: module
    }, opts)
    rubah.register(require('./' + file.substr(0, file.length - 3))(o));
}

function registerTemplates(x, phase) {
    if (x.templates)
        for (let key in x.templates) {
            let template = x.templates[key];
            if (typeof x.template.phase == "undefined" || x.template.phase == phase) {
                template = template.path;
                register(template.substr(template.length - 3) == '.js' ? template : template + '.js');
            }
        }
}

function initRubah() {
    rubah = new rubahjs.new();
    rubah.promiseScan = async function(path) {
        return new Promise(v => {
            rubah.scan(path, x => v(x));
        });
    }
    register('composefile.js');
}

function commandCondition(cmd) {
    let cond = true;
    for (let key in cmd.conditions) {
        cond = cond && (key == cmd.conditions[key]);
    }
    return cond;
}

async function main(module) {
    initRubah();
    let x = await rubah.promiseScan('.');
    x = evalEnv(x.config);
    // console.log(util.inspect(x, { depth: 20 }));
    let commands = [];
    registerTemplates(x, "init");

    //components buildup
    let components = x.components;
    if (fs.existsSync('components')) rimraf.sync('components');
    fs.mkdirSync('components');
    if (components)
        for (let key in components)
            execComponent(key, components[key]);

    //composing
    for (let key in components) {
        let component = components[key];
        if (component.compose) {
            let comps = leafFlatMap(component.compose, (keys, value) => {
                return { path: path.resolve(process.cwd(), 'components', key, ...keys), data: value }
            });
            for (let composee of comps) {
                if (!components[composee.data]) continue;
                let data = leafFlatMap(components[composee.data].expose, (keys, value) => {
                    return { path: path.resolve(process.cwd(), 'components', composee.data, ...keys), type: value }
                });
                for (let d of data) {
                    if (d.type == "file")
                        shell.exec("cp " + d.path + " " + composee.path);
                    else if (d.type == "folder")
                        shell.exec("cp -rTf " + d.path + " " + composee.path);
                }
            }
        }
    }

    initRubah()
    register('composefile.js');
    registerTemplates(x, "compose");
    let state = await rubah.promiseScan('.');
    x = evalEnv(state.config);
    await rubah.materialize();

    //commands execution
    commands = extractSubObject(extractSubObject(components, 'component', 'commands'), 'name');
    commands.sort((a, b) => a.id - b.id);
    for (let command of commands) {
        if (commandCondition(command)) {
            console.log("executing", '[' + command.component + ']', command.name);
            shell.exec(command.command, { cwd: path.resolve(process.cwd(), 'components', command.component) });
        }
    }

    //exporting buildup
    let exports = x.exports;
    if (fs.existsSync('exports')) rimraf.sync('exports');
    fs.mkdirSync('exports');
    if (exports)
        for (let key in exports) {
            preExport(key, exports[key])
        }
    commands = extractSubObject(extractSubObject(exports, 'export', 'commands'), 'name');

    //composing
    initRubah()
    register('composefile.js');
    registerTemplates(x, "export");
    state = await rubah.promiseScan('.');
    x = evalEnv(state.config);
    await rubah.materialize();

    //commands execution
    commands.sort((a, b) => a.id - b.id);
    for (let command of commands) {
        if (commandCondition(command)) {
            console.log("executing", '[' + command.export+']', command.name);
            shell.exec(command.command, { cwd: path.resolve(process.cwd(), 'exports', command.export) });
        }
    }

    //exporting
    if (exports)
        for (let key in exports) {
            commands = commands.concat(execExport(key, exports[key]));
        }

    //cleanups
    // if (fs.existsSync('components')) rimraf.sync('components');
}

function extractSubObject(obj, keyname, sub) {
    if (Array.isArray(obj)) {
        return _.flatten(obj.map(x => extractSubObject(x, keyname)));
    }
    else
        return _.toPairs(obj).map(x => {
            let res = sub ? x[1][sub] : x[1];
            if (sub)
                for (let a of _.values(res))
                    a[keyname] = x[0];
            else
                res[keyname] = x[0];
            return res;
        });
}

function execComponent(name, obj) {
    obj._name = name;
    fs.mkdirSync('components/' + name);
    let protocol = protocols[obj.protocol] || protocols['file'];
    protocol.instantiate(obj, 'components');
}

function preExport(name, obj) {
    obj._name = name;
    fs.mkdirSync('exports/' + name);
    let protocol = protocols[obj.protocol] || protocols['file'];
    protocol.instantiate(obj, 'exports');
}

function execExport(name, obj) {
    obj._name = name;
    let protocol = protocols[obj.protocol] || protocols['file'];
    protocol.export(obj);
}

main(module);
