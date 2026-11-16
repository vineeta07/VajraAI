const { Router } = require("express");
const router = Router();
const { pool } = require("../db/pool");

// Wraps a handler so a database failure becomes a JSON error the client can explain.
const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    console.error(`${req.originalUrl} failed:`, err.message);
    res.status(500).json({ error: "Database query failed", detail: err.message });
  }
};

router.get("/overview", handle(async (req, res) => {
  const result = await pool.query(`
    SELECT
      COUNT(*) AS total_transactions,
      COUNT(a.id) AS analyzed_transactions,
      COUNT(*) FILTER (WHERE a.risk_level IN ('HIGH', 'MEDIUM')) AS flagged_transactions,
      COUNT(*) FILTER (WHERE a.risk_level = 'HIGH') AS high_risk_transactions,
      COALESCE(SUM(t.amount), 0) AS total_amount,
      COALESCE(SUM(t.amount) FILTER (WHERE a.risk_level IN ('HIGH', 'MEDIUM')), 0) AS amount_at_risk,
      COUNT(DISTINCT t.vendor_id) AS vendors
    FROM transactions t
    LEFT JOIN anomaly_results a ON a.transaction_id = t.id
  `);

  const row = result.rows[0];
  const total = Number(row.total_transactions);
  const flagged = Number(row.flagged_transactions);

  res.json({
    total_transactions: total,
    analyzed_transactions: Number(row.analyzed_transactions),
    flagged_transactions: flagged,
    high_risk_transactions: Number(row.high_risk_transactions),
    total_amount: Number(row.total_amount),
    amount_at_risk: Number(row.amount_at_risk),
    vendors: Number(row.vendors),
    flagged_percentage: total > 0 ? Math.round((flagged / total) * 100) : 0
  });
}));

router.get("/risk-distribution", handle(async (req, res) => {
  const result = await pool.query(`
    SELECT risk_level, COUNT(*) AS count
    FROM anomaly_results
    GROUP BY risk_level
  `);

  const response = { LOW: 0, MEDIUM: 0, HIGH: 0 };
  result.rows.forEach(r => (response[r.risk_level] = Number(r.count)));

  res.json(response);
}));

router.get("/top-vendors", handle(async (req, res) => {
  const result = await pool.query(`
    SELECT
      t.vendor_id,
      t.vendor_name,
      COUNT(*) AS flagged_transactions,
      COUNT(*) FILTER (WHERE a.risk_level = 'HIGH') AS high_risk_transactions,
      SUM(t.amount) AS total_amount,
      CASE WHEN COUNT(*) FILTER (WHERE a.risk_level = 'HIGH') > 0 THEN 'HIGH' ELSE 'MEDIUM' END AS risk_level
    FROM anomaly_results a
    JOIN transactions t ON t.id = a.transaction_id
    WHERE a.risk_level IN ('HIGH', 'MEDIUM')
    GROUP BY t.vendor_id, t.vendor_name
    ORDER BY high_risk_transactions DESC, total_amount DESC
    LIMIT 5
  `);

  res.json(result.rows);
}));

router.get("/recent-anomalies", handle(async (req, res) => {
  const result = await pool.query(`
    SELECT
      t.id AS transaction_id,
      t.vendor_name,
      t.department,
      t.amount,
      a.risk_level,
      a.anomaly_score,
      a.detected_at
    FROM anomaly_results a
    JOIN transactions t ON t.id = a.transaction_id
    WHERE a.risk_level IN ('HIGH', 'MEDIUM')
    ORDER BY a.detected_at DESC, a.anomaly_score DESC
    LIMIT 6
  `);
  res.json(result.rows);
}));

router.get("/department-stats", handle(async (req, res) => {
  const result = await pool.query(`
    SELECT
      t.department,
      COUNT(*) AS analyzed_count,
      COUNT(*) FILTER (WHERE a.risk_level IN ('HIGH', 'MEDIUM')) AS flagged_count,
      COUNT(*) FILTER (WHERE a.risk_level = 'HIGH') AS high_count,
      COALESCE(SUM(t.amount) FILTER (WHERE a.risk_level IN ('HIGH', 'MEDIUM')), 0) AS total_risk_amount
    FROM anomaly_results a
    JOIN transactions t ON t.id = a.transaction_id
    GROUP BY t.department
    ORDER BY flagged_count DESC, total_risk_amount DESC
    LIMIT 10
  `);
  res.json(result.rows);
}));

module.exports = router;
