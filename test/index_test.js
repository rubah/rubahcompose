const rubahcompose = require("../src/index");
const assert = require("assert");
const fs = require("fs");
const rimraf = require("rimraf");
describe("rubahcompose",function(){
    
    it("should do basic commands", function(){
        let rc = rubahcompose();
        rc.loadConfig('test/content/config2.yml');
        return rc.run('test/content/config3.yml').then(x=>{
            return  assert(!fs.existsSync('components/test1/test_file_a.txt'), 'file a');
        }).then(x=>{
            return  assert(fs.existsSync('components/test1/test_file_b.txt'), 'file b');
        });
    });
    
    
    it("should do rubahsuite pipeline", function(){
        this.timeout(100000);
        let rc = rubahcompose();
        return rc.run('test/content/rubahsuite.yml', module).then(x=>{
            return  assert(fs.existsSync('components/rubahjs/README.md'), 'readme');
        }).then(x=>{
            return  assert(!fs.existsSync('components/rubahjs/doc'), 'doc');
        });
    });
    
    after(function(){
        rimraf.sync('components');
    });
})