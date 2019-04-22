const command = require("../src/command")()
const assert = require("assert");
const fs = require("fs");
const rimraf = require("rimraf");
describe("command", function(){
    it("should do shell", function(){
        const cmd = {
            type: 'shell',
            command: 'echo test'
        }
        const res = command.do(cmd,module);
        return res.then(x=>assert.equal(x,'test\n'))
    });
    it("should do component", function(){
        assert(!fs.existsSync('components/test1/test_file_a.txt'))
        const cmd = {
            type: 'component',
            component: 'test1',
            cfg: 'test/content/config2.yml',
            map: "x=>require('fs').existsSync('components/test1/test_file_a.txt')"
        }
        const res = command.do(cmd,module);
        return res.then(x=>assert(x))
        // return res.then(x=>assert(fs.existsSync('components/test1/test_file_a.txt')))
    });
    it("should do rubah", function(){
        const cmd = {
            type: 'rubah',
            templates: ['content/testing'],
            materialize: true,
            map: "x=>require('fs').existsSync('components/testing.txt')",
            exclude: ['.git','node_modules']
        }
        const res = command.do(cmd,module);
        return res.then(x=>assert(x))
        // return res.then(x=>assert(fs.existsSync('components/testing.txt')))
    });
    it("should do compose", function(){
        const cmd = {
            type: 'compose',
            scheme: {
                test_compose: "$test1",
                test_compose2: {test: "$test1"}
            }
        }
        const res = command.do(cmd,module);
        return res.then(x=>assert(fs.existsSync('components/test_compose/test_file_a.txt')))
        .then(x=>assert(fs.existsSync('components/test_compose2/test/test_file_a.txt')));
    });
    after(function(){
        rimraf.sync('components');
    });
});