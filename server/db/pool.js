const {Pool} = require("pg");

module.exports = new Pool({
    host: process.env.HOSTNAME,
    user: process.env.USERNAME,
    db: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
})