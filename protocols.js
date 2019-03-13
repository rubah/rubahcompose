const shell = require("shelljs");
const path = require("path");
module.exports ={
    git: {
        instantiate: function(component, phase){
            console.log('instantiating git of',component._name);
            let name = component._name;
            let branch = component.branch? '&& git checkout '+component.branch: '';
            shell.exec('git clone '+component.path+' .'+branch, {cwd: path.resolve(process.cwd(),phase,name)});
        },
        export: function(component){
            
        }
    },
    file: {
        instantiate: function(component,phase){
            console.log('instantiating file of',component._name);
            let name = component._name;
            if(component.path.length > 0)
                shell.exec('cp -rT '+component.path+' '+path.resolve(process.cwd(),phase,name), {cwd: process.cwd()});
        },
        export: function(component){
            
        }
    }
}