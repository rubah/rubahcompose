const loadConfig = require("./config");
const path = require("path");
const fs = require("fs");
const _ = require("lodash");

module.exports = function() {
    const env = process.env.RUBAH_COMPOSE_STAGE || 'dev';
    if(fs.existsSync('.env.'+env)) require('custom-env').env(env);
    let obj = {};

    obj.config = {};
    obj.results = {};

    obj.commandRunner = require("./command")();

    obj.run = async function(config, _module = module) {
        let cfg = typeof config == "object" ? config : loadConfig(path.resolve(config));
        // console.log(require('util').inspect(cfg,{showHidden: false, depth: null}))
        cfg = _.merge(this.config, cfg);
        let commands = cfg.commands || [];
        for (let key in commands) {
            let command = commands[key];
            command.config = cfg;
            try{
                this.results[key] = await this.commandRunner.do(command, _module);
                if(command.name) this.results[command.name] = this.results[key]; 
            }catch(e){
                console.error(e);
                if(command.required) break;
            }
        }
    };

    obj.loadConfig = function(config, _module = module) {
        let cfg = typeof config == "object" ? config : loadConfig(path.resolve(config));
        if(cfg.commands) delete cfg.commands;
        if (cfg.runners) {
            let runners = cfg.runners;
            delete cfg.runners;
            for (let run in runners) {
                let runner = _module.require('./' + runners[run]);
                this.commandRunner[run] = runner.runner;
                this.commandRunner.__primer[run] = runner.primer;
            }
        }
        this.config = _.merge(this.config, cfg);
    }

    return obj;
}
