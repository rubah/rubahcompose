const shell = require("shelljs");
const path = require("path");
const toRegex = require("./utils/toRegex");
const prune = require("./utils/prune");
const fs = require("fs");
const rimraf = require("rimraf");

const prep = function(component, phase){
    if(!fs.existsSync(phase))fs.mkdirSync(phase);
    rimraf.sync(phase+'/' + component._name);
    fs.mkdirSync(phase+'/' + component._name);
};

const protocols = {
    git: {
        instantiate: function(component, phase) {
            // console.log('instantiating git of', component._name);
            let name = component._name;
            let branch = component.branch ? '&& git checkout ' + component.branch : '';
            let res = shell.exec('git clone ' + component.path + ' .' + branch, { cwd: path.resolve(process.cwd(), phase, name), silent: true });
            if (res.code != 0) throw new Error(res.stderr);
            return res.stdout;
        },
        // export: function(component) {

        // },
        list: function(component) {
            prep(component, 'temp');
            this.instantiate(component, 'temp');
            let list = shell.exec('git branch -r', { cwd: path.resolve(process.cwd(), 'temp', component._name), silent: true }).stdout;
            list = list.split('\n').filter(x => !x.startsWith('  origin/HEAD') && x.length>0).map(x => x.substr(9).trim());
            shell.exec('rm -rf', { cwd: path.resolve(process.cwd(), 'temp', component._name), silent: true });
            let filter = toRegex(component.filter);
            return list.filter(x=>filter.test(x));
        },
        newComponent: function(component, uid){
            let res = Object.assign({},component);
            res._name += '_'+uid;
            res.multi = undefined;
            res.filter = undefined;
            res.branch = uid;
            res = prune(res);
            return res;
        }
    },
    file: {
        instantiate: function(component, phase) {
            // console.log('instantiating file of', component._name);
            let name = component._name;
            let res = shell.exec('cp -rT ' + component.path + ' ' + path.resolve(process.cwd(), phase, name), { cwd: process.cwd(), silent: true });
            if (res.code != 0) throw new Error(res.stderr);
            return `copying ${path.resolve(component.path)} to components/${name}`
        },
        // export: function(component) {

        // },
        list: function(component) {
            let list = shell.exec('ls '+component.path, {silent: true}).stdout;
            list = list.split('\n').filter(x=>x.length>0);
            let filter = toRegex(component.filter);
            let res = list.filter(x=>filter.test(x));
            if(component.noextension) res = res.map(x=>x.split('.').slice(0, -1).join('.'));
            return res;
        },
        newComponent: function(component, uid){
            let res = Object.assign({},component);
            res._name += '_'+uid;
            res.multi = undefined;
            res.filter = undefined;
            res.noextension = undefined;
            res.path = path.resolve(res.path, uid);
            res = prune(res);
            return res;
        }
    }
};

module.exports = async function(options){
    let protocol = protocols[options.component.protocol];
    switch (options.action) {
        case 'instantiate': 
            prep(options.component, options.phase);
            return await protocol.instantiate(options.component, options.phase);
        // case 'export': return protocol.export(options.component); 
        case 'list': return await protocol.list(options.component); 
        case 'newComponent': return await protocol.newComponent(options.component, options.id); 
    }
};