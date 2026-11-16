const { Router } = require("express");
const router = Router();
const { pool } = require("../db/pool");

// Flag counts grouped by one transaction column. `count` is what matched the
// optional ?risk= filter; flagged/high/amount are always returned alongside.
function grouped(column, alias, orderBy) {
  return async (req, res) => {
    try {
      const { risk } = req.query;
      const params = [];
      let where = "";
      if (risk) {
        where = "WHERE a.risk_level = $1";
        params.push(risk);
      }

      const result = await pool.query(`
        SELECT
          ${column} AS ${alias},
          COUNT(*) AS count,
          COUNT(*) FILTER (WHERE a.risk_level IN ('HIGH', 'MEDIUM')) AS flagged_count,
          COUNT(*) FILTER (WHERE a.risk_level = 'HIGH') AS high_count,
          COALESCE(SUM(t.amount) FILTER (WHERE a.risk_level IN ('HIGH', 'MEDIUM')), 0) AS risk_amount
        FROM anomaly_results a
        JOIN transactions t ON t.id = a.transaction_id
        ${where}
        GROUP BY ${column}
        ORDER BY ${orderBy}
      `, params);

      res.json(result.rows);
    } catch (err) {
      console.error(`${req.originalUrl} failed:`, err.message);
      res.status(500).json({ error: "Database query failed", detail: err.message });
    }
  };
}

router.get("/location", grouped("t.location", "location", "count DESC"));
router.get("/department", grouped("t.department", "department", "count DESC"));
router.get("/time", grouped("t.transaction_date", "date", "date"));

module.exports = router;
