const {Client} = require("pg");

const SQL = `
CREATE TABLE transactions(
id INT ALWAYS GENERATED AS IDENTITY PRIMARY KEY,
vendor_id VARCHAR(50) NOT NULL,
vendor_name VARCHAR(100) NOT NULL,
department VARCHAR(100) NOT NULL,
amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
location VARCHAR(100),
transaction_date DATE NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE anomaly_result(
id INT ALWAYS GENERATED AS INDENTITY PRIMARY KEY,
transaction_id INT NOT NULL UNIQUE
REFERENCES transactions(id)
ON DELETE CASCADE,
anomaly score FLOAT NOT NULL,
risk_level VARCHAR(10) NOT NULL CHECK (risk_level IN ("LOW", "MEDIUM", "HIGH")),
reason TEXT[] NOT NULL,
detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vendors(
vendor_id VARCHAR(50) PRIMARY KEY,
vendor_name VARCHAR(100) NOT NULL,
total_transactions INT DEFAULT 0,
total_amount NUMERIC(15, 2) DEFAULT 0,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users(
id INT ALWAYS GENERATED AS IDENTITY PRIMARY KEY,
name VARCHAR(50) NOT NULL,
email VARCHAR(50) NOT NULL,
password_hash VARCHAR(20) NOT NULL,
role VARCHAR(10) NOT NULL CHECK (role IN ('ADMIN', 'AUDITOR')),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

async function main(){
    console.log("seeding...");
    
    const client = new Client({
        connectionString: process.env.DB_CONNECTION_STRING,
    });

    await client.connect();
    await client.query(SQL);
    await client.end();

    console.log("done")
}