module.exports = function(opts){
    const path = require("path");
    const watch = opts.watch || process.cwd();
    opts.module = opts.module || module;
    const rh = module.require("rubahhelper");
    return {
        templateName: 'composefile',
        filename: path.resolve(watch,'composefile.yml'),
        template: '{{{yaml config}}}',
        stateToData: function(state){
            return state;
        },    
        dataToState: function(data){
            return data;
        },
        write: false,
        helpers: [rh.yamlHelper]
    }
}