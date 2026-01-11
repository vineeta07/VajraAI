const { Router } = require("express");
const { pool } = require("../db/pool");

const router = Router();

// Get all vendors with stats
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
              t.vendor_id,
              t.vendor_name,
              COUNT(t.id) AS total_transactions,
              COALESCE(SUM(t.amount), 0) AS total_amount,
              COUNT(a.id) AS flagged_count,
              COUNT(CASE WHEN a.risk_level = 'HIGH' THEN 1 END) AS high_risk_count
            FROM transactions t
            LEFT JOIN anomaly_results a ON t.id = a.transaction_id
            GROUP BY t.vendor_id, t.vendor_name
            ORDER BY flagged_count DESC, total_amount DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch vendors" });
    }
});

// Get specific vendor details
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        // Vendor Stats
        const statsRes = await pool.query(`
            SELECT
              t.vendor_id,
              t.vendor_name,
              COUNT(t.id) AS total_transactions,
              COALESCE(SUM(t.amount), 0) AS total_amount,
              COUNT(a.id) AS flagged_count,
               COUNT(CASE WHEN a.risk_level = 'HIGH' THEN 1 END) AS high_risk_count
            FROM transactions t
            LEFT JOIN anomaly_results a ON t.id = a.transaction_id
            WHERE t.vendor_id = $1
            GROUP BY t.vendor_id, t.vendor_name
        `, [id]);

        if (statsRes.rows.length === 0) {
            return res.status(404).json({ error: "Vendor not found" });
        }

        const vendor = statsRes.rows[0];

        // Recent Transactions
        const txRes = await pool.query(`
            SELECT
              t.*,
              a.risk_level,
              a.anomaly_score
            FROM transactions t
            LEFT JOIN anomaly_results a ON t.id = a.transaction_id
            WHERE t.vendor_id = $1
            ORDER BY t.transaction_date DESC
            LIMIT 50
        `, [id]);

        res.json({
            vendor,
            transactions: txRes.rows
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch vendor details" });
    }
});

module.exports = router;
