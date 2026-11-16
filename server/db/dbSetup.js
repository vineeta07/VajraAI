require("dotenv").config();
const { Client } = require("pg");
const { connectionOptions } = require("./config");
const { ensureSchema } = require("./schema");

async function main() {
  console.log("Creating tables if they are missing...");

  const client = new Client(connectionOptions());

  await client.connect();
  await ensureSchema(client);
  await client.end();

  console.log("done");
}

main().catch((err) => {
  console.error("Database setup failed:", err.message);
  process.exit(1);
});
