const { Pool } = require("pg");
const { connectionOptions } = require("./config");

const pool = new Pool({ ...connectionOptions(), connectionTimeoutMillis: 10000 });

pool.on("connect", () => {
    console.log("PostgreSQL database connected");
});

// An idle connection dropping must not take the whole server down.
pool.on("error", (err) => {
    console.error("PostgreSQL connection error:", err.message);
});

module.exports = { pool };
