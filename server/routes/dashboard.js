const { Router } = require("express");
const router = Router();
const { pool } = require("../db/pool");

router.get("/overview", async (req, res) => {
    const result = await pool.query(`
    SELECT
      COUNT(*) AS total_transactions,
      COUNT(*) FILTER (WHERE a.risk_level IN ('HIGH', 'MEDIUM')) AS flagged_transactions,
      COUNT(*) FILTER (WHERE a.risk_level = 'HIGH') AS high_risk_transactions,
      COALESCE(SUM(t.amount) FILTER (WHERE a.risk_level != 'LOW'), 0) AS amount_at_risk
    FROM transactions t
    LEFT JOIN anomaly_results a ON a.transaction_id = t.id
  `);

    const row = result.rows[0];

    res.json({
        total_transactions: Number(row.total_transactions),
        flagged_transactions: Number(row.flagged_transactions),
        high_risk_transactions: Number(row.high_risk_transactions),
        amount_at_risk: Number(row.amount_at_risk),
        flagged_percentage:
            row.total_transactions > 0
                ? Math.round(((row.flagged_transactions / row.total_transactions) * 100))
                : 0
    });
});

router.get("/risk-distribution", async (req, res) => {
    const result = await pool.query(`
    SELECT risk_level, COUNT(*) AS count
    FROM anomaly_results
    GROUP BY risk_level
  `);

    const response = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    result.rows.forEach(r => (response[r.risk_level] = Number(r.count)));

    res.json(response);
});

router.get("/top-vendors", async (req, res) => {
    const result = await pool.query(`
    SELECT
      t.vendor_name,
      COUNT(a.id) AS flagged_transactions,
      SUM(t.amount) AS total_amount,
      MAX(a.risk_level) AS risk_level
    FROM anomaly_results a
    JOIN transactions t ON t.id = a.transaction_id
    GROUP BY t.vendor_name
    ORDER BY total_amount DESC
    LIMIT 5
  `);

    res.json(result.rows);
});

module.exports = router;
