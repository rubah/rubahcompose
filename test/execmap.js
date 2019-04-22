module.exports = function(s){
    s = s.split('\n');
    let e = s.filter(x => x.search("- extract success") > -1);
    let m = s.filter(x => x.search("materializing") > -1);
    return `${e.length} extractions ${m.length} materializations`;
}