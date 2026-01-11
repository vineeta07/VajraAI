const { Router } = require("express");
const { pool } = require("../db/pool");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { risk } = req.query;

    let query = `SELECT t.id AS transaction_id, t.vendor_id, t.vendor_name, t.department, t.amount, t.location, t.transaction_date, a.anomaly_score, a.risk_level, a.reason, a.detected_at FROM transactions t JOIN anomaly_results a ON t.id = a.transaction_id
        `;

    const params = [];

    if (risk) {
      query += " WHERE a.risk_level = $1";
      params.push(risk);
    }

    query += " ORDER BY a.anomaly_score ASC";
    const { rows } = await pool.query(query, params);

    res.json(rows);
  } catch (error) {
    console.error("Error fetching anomalies:", error);

    res.status(500).json({ error: "Failed to fetch anomalies" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(`SELECT t.*, a.anomaly_score, a.risk_level, a.reason, a.detected_at FROM transactions t JOIN anomaly_results a ON t.id = a.transaction_id WHERE t.id = $1`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching transaction:", error);

    res.status(500).json({ error: "Failed to fetch transaction" });
  }
});

module.exports = router;

