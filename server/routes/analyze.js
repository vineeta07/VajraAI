const { Router } = require("express");
const { pool } = require("../db/pool");
const { buildFeatures } = require("../services/featureEngineering");
const { runMLDetection } = require("../services/mlService");
const { generateReasons } = require("../services/ruleEngine");

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { rows: transactions } = await pool.query(
      "SELECT * FROM transactions"
    );

    if (transactions.length === 0) {
      return res.status(400).json({ error: "No transactions found" });
    }

    const features = buildFeatures(transactions);

    const mlResults = await runMLDetection(features);

    await pool.query("DELETE FROM anomaly_results");

    for (const result of mlResults) {
      const tx = transactions.find(t => t.id === result.transaction_id);
      const f = features.find(f => f.transaction_id === result.transaction_id);

      const derived_metrics = {};
      if (f && f.estimated_cost) {
        derived_metrics.overspend_ratio = (Number(tx.amount) - f.estimated_cost) / f.estimated_cost;
      }
      if (f && f.num_bidders !== null && f.num_bidders !== undefined) {
        derived_metrics.bidders = f.num_bidders;
      }

      const reasons = generateReasons({
        ...result,
        amount: Number(tx.amount),
        avg_amount: f ? f.avg_amount : Number(tx.amount),
        frequency: f ? f.frequency : 1,
        department: tx.department,
        vendor_name: tx.vendor_name,
        location: tx.location,
        derived_metrics
      });

      await pool.query(
        `INSERT INTO anomaly_results
         (transaction_id, anomaly_score, risk_level, reason)
         VALUES ($1,$2,$3,$4)`,
        [
          result.transaction_id,
          result.anomaly_score,
          result.risk_level,
          reasons
        ]
      );
    }

    res.json({
      message: "Fraud analysis completed",
      analyzed: mlResults.length
    });

  } catch (err) {
    console.error("Analysis error:", err.message);
    res.status(500).json({ error: "Fraud analysis failed" });
  }
});

module.exports = router;