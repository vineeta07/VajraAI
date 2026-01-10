const {Router} = require("express");
const {pool} = require("../db/pool");

const router = Router();

router.get("/location", async (req, res) => {
  try {
    const {rows} = await pool.query(`SELECT t.location, COUNT(*) AS anomaly_count, SUM(t.amount) AS risky_amount FROM transactions t JOIN anomaly_results a ON t.id = a.transaction_id WHERE a.risk_level IN ('HIGH', 'MEDIUM') GROUP BY t.location`);

    res.json(rows);
  } catch (error) {
    console.error("Heatmap location error:", error);
    
    res.status(500).json({error: "Failed to load location heatmap"});
  }
});

router.get("/department", async (req, res) => {
  try {
    const {rows} = await pool.query(`SELECT t.department, COUNT(*) AS anomaly_count FROM transactions t JOIN anomaly_results a ON t.id = a.transaction_id WHERE a.risk_level != 'LOW' GROUP BY t.department ORDER BY anomaly_count DESC`);

    res.json(rows);
  } catch (error) {
    console.error("Heatmap department error:", error);

    res.status(500).json({error: "Failed to load department heatmap"});
  }
});

module.exports = router;
