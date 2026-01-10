const {Routes} = require("express");
const {pool} = require("../db/pool");
const router = Router();

router.get("/", async (req, res) => {
    const total = await pool.query("SELECT COUNT(*) FROM transactions");
    const flagged = await pool.query("SELECT COUNT(*) FROM anomaly_results WHERE risk_level != 'LOW'");
    const amount = await pool.query(`SELECT SUM(t.amount) FROM transactions t JOIN anomaly_results a ON t.id = a.transaction_id WHERE a.risk_level = HIGH`);

    res.json({
        totalTransactions: total.rows[0].count,
        flaggedTransactions: flagged.rows[0].count,
        amountAtRisk: amount.rows[0].sum
    });
});

module.exports = router;