const { Router } = require("express");
const router = Router();
const { pool } = require("../db/pool");

router.get("/location", async (req, res) => {
  const { risk } = req.query;

  let query = `
    SELECT
      t.location,
      COUNT(*) AS count
    FROM anomaly_results a
    JOIN transactions t ON t.id = a.transaction_id
  `;

  const params = [];
  if (risk) {
    query += ` WHERE a.risk_level = $1`;
    params.push(risk);
  }

  query += `
    GROUP BY t.location
    ORDER BY count DESC
  `;

  const result = await pool.query(query, params);
  res.json(result.rows);
});

router.get("/department", async (req, res) => {
  const { risk } = req.query;

  let query = `
    SELECT
      t.department,
      COUNT(*) AS count
    FROM anomaly_results a
    JOIN transactions t ON t.id = a.transaction_id
  `;

  const params = [];
  if (risk) {
    query += ` WHERE a.risk_level = $1`;
    params.push(risk);
  }

  query += `
    GROUP BY t.department
    ORDER BY count DESC
  `;

  const result = await pool.query(query, params);
  res.json(result.rows);
});

router.get("/time", async (req, res) => {
  const { risk } = req.query;

  let query = `
    SELECT
      t.transaction_date AS date,
      COUNT(*) AS count
    FROM anomaly_results a
    JOIN transactions t ON t.id = a.transaction_id
  `;

  const params = [];
  if (risk) {
    query += ` WHERE a.risk_level = $1`;
    params.push(risk);
  }

  query += `
    GROUP BY t.transaction_date
    ORDER BY date
  `;

  const result = await pool.query(query, params);
  res.json(result.rows);
});

module.exports = router;
