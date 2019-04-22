module.exports = function(str) {
    if(!str) return /.*/;
    let regexStr = str;
    let regexFlag = regexStr.substr(regexStr.lastIndexOf('/') + 1);
    let regexSource = regexStr.substring(0, regexStr.lastIndexOf('/')).substr(1);
    return new RegExp(regexSource, regexFlag);
}
