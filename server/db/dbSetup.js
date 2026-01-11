require("dotenv").config();
const { Client } = require("pg");

const SQL = `
CREATE TABLE IF NOT EXISTS transactions (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  vendor_id VARCHAR(50) NOT NULL,
  vendor_name VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  amount NUMERIC(15,2) NOT NULL CHECK (amount >= 0),
  location VARCHAR(100),
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS anomaly_results (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  transaction_id INT UNIQUE
    REFERENCES transactions(id)
    ON DELETE CASCADE,
  anomaly_score FLOAT NOT NULL,
  risk_level VARCHAR(10) NOT NULL
    CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  reason TEXT[] NOT NULL,
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendors (
  vendor_id VARCHAR(50) PRIMARY KEY,
  vendor_name VARCHAR(100) NOT NULL,
  total_transactions INT DEFAULT 0,
  total_amount NUMERIC(15,2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('ADMIN', 'AUDITOR')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function main() {
  console.log("seeding...");

  const client = new Client({
    connectionString: process.env.DB_CONNECTION_STRING,
  });

  await client.connect();
  await client.query(SQL);
  await client.end();

  console.log("done")
}

main();