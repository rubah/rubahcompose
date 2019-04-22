const assert = require("assert");
const rimraf = require("rimraf");
const fs = require("fs");

const protocols = require("../src/protocols");

describe("file protocol", function() {

    let list;

    const cfg = {
        components: {
            test: {
                _name: 'test',
                protocol: 'file',
                path: 'test/static'
            }
        }
    };
    it("should initiate", function() {
        protocols({ component: cfg.components.test, action: 'instantiate', phase: 'protocol_test' });
        assert(fs.existsSync('protocol_test/test/test_file_a.txt'));
        assert(fs.existsSync('protocol_test/test/test_file_a.txt'));
        rimraf.sync('protocol_test');
    });

    it("should return list of sub-components in multi mode", function() {
        cfg.components.test.multi = true;
        cfg.components.test.noextension = true;
        list = protocols({ component: cfg.components.test, action: 'list' });
        assert.deepEqual(list, ['test_file_a', 'test_file_b']);
        cfg.components.test.noextension = false;
        list = protocols({ component: cfg.components.test, action: 'list' });
        assert.deepEqual(list, ['test_file_a.txt', 'test_file_b.txt']);
    });

    it("should create multiple sub-components in multi mode", function() {
        for (let id of list) {
            let component = protocols({ component: cfg.components.test, action: 'newComponent', id });
            assert.equal(component._name, 'test_' + id);
            assert.equal(component.protocol, 'file');
            assert(component.path.endsWith(id));
        }
    });
});

describe("git protocol", function() {
    
    let list;

    const cfg = {
        components: {
            test: {
                _name: 'test',
                protocol: 'git',
                path: 'https://github.com/averman/testrepo.git'
            }
        }
    };

    it("should initiate", function() {
        this.timeout(30000);
        protocols({ component: cfg.components.test, action: 'instantiate', phase: 'protocol_test' });
        assert(fs.existsSync('protocol_test/test/test_file_a.txt'));
        assert(fs.existsSync('protocol_test/test/test_file_a.txt'));
        rimraf.sync('protocol_test');
        cfg.components.test.branch = "test_branch";
        protocols({ component: cfg.components.test, action: 'instantiate', phase: 'protocol_test' });
        assert(fs.existsSync('protocol_test/test/test_file_a.txt'));
        assert(fs.existsSync('protocol_test/test/test_file_a.txt'));
        rimraf.sync('protocol_test');
    });

    it("should return list of sub-components in multi mode", function() {
        this.timeout(30000);
        cfg.components.test.multi = true;
        list = protocols({ component: cfg.components.test, action: 'list' });
        assert.deepEqual(list, ['master', 'test_branch']);
    });

    it("should create multiple sub-components in multi mode", function() {
        this.timeout(30000);
        for (let id of list) {
            let component = protocols({ component: cfg.components.test, action: 'newComponent', id });
            assert.equal(component._name, 'test_' + id);
            assert.equal(component.protocol, 'git');
            assert.equal(component.branch, id);
        }
    });
});
