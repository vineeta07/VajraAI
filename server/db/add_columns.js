require("dotenv").config();
const { Client } = require("pg");

const SQL = `
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS num_bidders INT;
`;

async function main() {
    console.log("Updating schema...");
    const client = new Client({
        connectionString: process.env.DB_CONNECTION_STRING,
    });

    try {
        await client.connect();
        await client.query(SQL);
        console.log("Schema updated successfully.");
    } catch (err) {
        console.error("Error updating schema:", err);
    } finally {
        await client.end();
    }
}

main();
