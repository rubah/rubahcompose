module.exports = function(opts){
    const path = require("path");
    const watch = opts.watch || process.cwd();
    opts.module = opts.module || module;
    const rh = module.require("rubahhelper");
    return {
        templateName: 'composefile',
        filename: path.resolve(watch,'components/testing.txt'),
        template: 'test',
        stateToData: function(state){
            return ['test'];
        },    
        dataToState: function(data){
            return data;
        }
    }
}