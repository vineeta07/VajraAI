const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DB_CONNECTION_STRING,
});

pool.on("connect", () => {
    console.log("PostgreSQL database connected");
});

module.exports = { pool };
