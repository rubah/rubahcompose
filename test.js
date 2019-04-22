require('custom-env').env(process.env.RUBAH_COMPOSE_STAGE || 'dev');
let cfg = require("./src/config");

console.log(cfg('composefile.yml'));