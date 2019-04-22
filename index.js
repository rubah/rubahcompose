require('custom-env').env(process.env.RUBAH_COMPOSE_STAGE || 'dev');
const rimraf = require("rimraf");
const protocols = require("./src/protocols");
const shell = require("shelljs");
const path = require("path");
const flattenLeafValues = require("./src/utils/flattenLeafValues");
const leafMap = require("./src/utils/leafMap");
const initRubah = require("./src/rubah");
const commandExec = require("./src/commands");
const instantiate = require("./src/instantiate");


let leafFlatMap = (obj, f)=>flattenLeafValues(leafMap(obj, f));

async function main(module) {
    let rubah = initRubah({module});
    let state = await rubah.exec();
    
    let commands = [];
    rubah.registerTemplates(state.config, "init");

    //components buildup
    instantiate(state,'components');
    let components = state.config.components;

    //composing
    console.log("composing");
    for (let key in components) {
        let component = components[key];
        if (component.compose) {
            let comps = leafFlatMap(component.compose, (keys, value) => {
                return { path: path.resolve(process.cwd(), 'components', key, ...keys), data: value };
            });
            for (let composee of comps) {
                if (!components[composee.data]) continue;
                let data = leafFlatMap(components[composee.data].expose, (keys, value) => {
                    return { path: path.resolve(process.cwd(), 'components', composee.data, ...keys), type: value };
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

    rubah = initRubah({module});
    state = await rubah.exec(state.config,true);

    //commands execution
    commandExec(components,'components');

    //exporting buildup
    let exports = state.config.exports;
    instantiate(state,'exports');

    //composing
    rubah = initRubah({module});
    state = await rubah.exec(state.config,true);

    //commands execution
    commandExec(exports,'exports');

    //exporting
    if (exports)
        for (let key in exports) {
            commands = commands.concat(execExport(key, exports[key]));
        }

    //cleanups
    rimraf.sync('components');
}

function execExport(name, obj) {
    obj._name = name;
    let protocol = protocols[obj.protocol] || protocols['file'];
    protocol.export(obj);
}

main(module);
