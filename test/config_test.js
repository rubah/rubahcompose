const assert = require("assert");
const YAML = require("yamljs");
const _ = require("lodash");
const test1 = { components: { 
    test1: { protocol: 'file', path: 'test' }, 
} };
const multi = { protocol: 'file', path: 'test/static', multi: true, filter: "/test_file.*txt/", noextension: true};

const env1 = { components: { test1: { protocol: '${TEST_PROTOCOL}' }}};

const namify = function(cfg){
    for(let key in cfg.components)
        cfg.components[key]._name = key;
    return cfg;
}

describe("config loading", function(){
    
    it("should load config file according to yamljs",function(){
        let cfgRead = require("../src/config");
        require("fs").writeFileSync("test/content/config1.yml",YAML.stringify(test1,10));
        let cfg = cfgRead("test/content/config1.yml");
        assert.deepEqual(cfg, namify(test1));
    });
    
    it("should evaluate environment variable substitution",function(){
        let cfgRead = require("../src/config");
        let test2 = _.merge(test1,env1);
        require("fs").writeFileSync("test/content/config1.yml",YAML.stringify(test2,10));
        test2.components.test1.protocol = 'git';
        process.env.TEST_PROTOCOL = 'git';
        let cfg = cfgRead("test/content/config1.yml");
        assert.deepEqual(cfg, namify(test2));
    });
    
    it("should process multi components",function(){
        let cfgRead = require("../src/config");
        let test2 = Object.assign({}, test1);
        test2.components.multi = multi;
        require("fs").writeFileSync("test/content/config1.yml",YAML.stringify(test2,10));
        process.env.TEST_PROTOCOL = 'git';
        let cfg = cfgRead("test/content/config1.yml");
        assert.deepEqual(Object.keys(cfg.components),['test1','multi_test_file_a','multi_test_file_b']);
    });
})