const {Pool} = require("pg");

// export const pool = new Pool({
//     host: process.env.DB_HOSTNAME,
//     user: process.env.DB_USERNAME,
//     db: process.env.DB_NAME,
//     password: process.env.DB_PASSWORD,
//     port: process.env.DB_PORT
// });

export const pool = new Pool({
    connectionString: process.env.DB_CONNECTION_STRING,
});

pool.on("connect", () => {
    console.log("PostgreSQL database connected");
});
