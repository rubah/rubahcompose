const YAML = require("yamljs")
const fs = require("fs");
const evalEnv = require("./evalEnv");
const prune = require("./utils/prune");
const protocols = require("./protocols");

function readConfig(path){
    let file = fs.readFileSync(path);
    let cfg = YAML.parse(file.toString());
    cfg = prune(evalEnv(cfg));
    let components = cfg.components;
    let newComponents = {};
    for(let key in components){
        let component = components[key];
        if(component.multi){
            let list = protocols({component, action: 'list'});
            for(let l of list){
                //todo: newComponent(component,l) a function to duplicate a component with specific of l
                newComponents[key+'_'+l] = protocols({component, action:'newComponent', id: l});
                newComponents[key+'_'+l]._name = key;
            }
        }else{
            newComponents[key] = component;
            newComponents[key]._name = key;
        }
    }
    cfg.components = newComponents;
    let newCommands = [];
    for(let key in cfg.commands){
        cfg.commands[key].cfg = path;
        newCommands.push(cfg.commands[key]);
    }
    if(newCommands.length>0) cfg.commands = newCommands;
    return cfg;
}

module.exports = readConfig;