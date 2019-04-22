const shell = require("shelljs");
const path = require("path");
const protocols = require("./protocols");
const config = require("./config");
const initRubah = require("./rubahjs");
const flattenObject = require("./utils/flattenObject");
const fs = require("fs");

module.exports = function() {
    let obj = {};
    obj.__primer = {
        shell: x => x.command,
        component: x => x.component,
        rubah: x => x.description?x.description:JSON.stringify(x.templates),
        compose: x => JSON.stringify(x.scheme)
    };
    obj.__log = function(command) {
        let cntr = s => {
            let x = 12 - s.length;
            let r = x.length%2==0?x/2:Math.floor(x/2), 
            l = x.length%2==0?x/2:Math.ceil(x/2);
            return (new Array(l)).fill(' ').join('')+s+(new Array(r)).fill(' ').join('')
        }
        let fstr = s => s.length < 12 ? cntr(s) : s.substr(0, 12);
        let s = this.__primer[command.type]?this.__primer[command.type](command):'';
        console.log(`\x1b[32m[ \x1b[92m${fstr(command.type)}\x1b[0m \x1b[32m] : \x1b[37m${s}\x1b[0m`);
    };
    obj.do = async function(command, module) {
        if (command.map) command.map = eval(command.map);
        if (!command.condition || eval(command.condition)) {
            if(!command.silent)this.__log(command);
            let res = await this[command.type](command, module) || '';
            let ret = res;
            if (command.map) res = command.map(res);
            if(!command.silent)console.log(res.toString().split('\n').map(x=>'\x1b[32m| '+x).join('\n')+'\n\x1b[32m=======\n\x1b[0m');
            return ret;
        }
        return false;
    }
    obj.shell = async function(command, module) {
        let res;
        let opts = { silent: true, stdio: "inherit" };
        if (command.component) opts.cwd = path.resolve(process.cwd(), 'components', command.component);
        res = await shell.exec(command.command, opts);
        if (res.code != 0) throw new Error(res.stderr);
        else res = res.stdout;
        return res;
    };
    obj.component = async function(command, module) {
        let res;
        let cfg = command.config || module.config || config(command.cfg || module.cfg);
        let component = cfg.components[command.component];
        try{
            res = await protocols({ action: 'instantiate', component, phase: 'components' });
        }catch(e){throw e}
        return res;
    };
    obj.rubah = async function(command, module) {
        let res;
        let t = console.log;
        console.slog = '';
        console.log = function(x){this.slog+=x+'\n'};
        let opts = Object.assign({ module, templates: command.templates}, command.opts);
        opts.path = command.path || '.';
        let rubah = initRubah(opts);
        if (command.exclude)
            for (let x in command.exclude){
                rubah.source.sources.file.exclude(command.exclude[x]);
            }
        if (command.materialize) opts.materialize = true;
        try{
            res = await rubah.exec(opts);
        }catch(e){throw e}
        res.__proto__.toString = function(){
            return console.slog+"\nresulting state:\n"+require("util").inspect(this, {depth: command.opts.depth || null});
        }
        console.log = t;
        return res;
    }
    obj.compose = async function(command, module) {
        let res = "";
        let log = (x, ...y) => res += x.concat(y).map((a, i, ar) => i % 2 == 0 ? ar[Math.floor(i / 2)] : ar[Math.floor(i / 2) + x.length]).join('') + '\n';
        let isComponent = x => x[0] == '$' ? x[1] == '$' ? false : true : false;
        let extract = x => x[0] == '$' ? x.substr(1) : x;
        let scheme = command.scheme;
        scheme = flattenObject(scheme, function(x) {
            if (typeof x.value == "object") {
                return { key: x.key, value: x.key[x.key.length - 1], type: 'folder' };
            }
            else
                return { key: x.key, value: extract(x.value), type: isComponent(x.value) ? 'component' : 'folder' };
        }).sort((a, b) => a.key.length - b.key.length);
        for (let key in scheme) {
            let x = scheme[key];
            let p = path.resolve('components', ...x.key);
            if (x.type == 'folder') {
                if (!fs.existsSync(p)) {
                    log `creating folder ${p}`;
                    let res = shell.mkdir('-p', p);
                    if (res.code != 0) throw new Error(res.stderr);
                }
            }
            else if (x.type == 'component') {
                log `copying component ${x.value}`;
                let res = shell.cp('-rf', path.resolve('components', x.value), p);
                if (res.code != 0) throw new Error(res.stderr);
            }
        }
        return res;
    }

    return obj;
};
