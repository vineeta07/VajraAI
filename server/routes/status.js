const { Router } = require("express");
const axios = require("axios");
const { pool } = require("../db/pool");

const router = Router();

function mlBaseUrl() {
  let url = process.env.ML_SERVICE_URL;
  if (!url) return null;
  if (!url.startsWith("http")) url = `http://${url}`;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

// Reports whether each part of the pipeline is working, so the client can
// explain an empty screen instead of just showing one.
router.get("/", async (req, res) => {
  const out = {
    api: true,
    db: { ok: false },
    ml: { ok: null, url: mlBaseUrl() },
    transactions: 0,
    analyzed: 0,
    last_analysis: null
  };

  try {
    const { rows } = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM transactions) AS transactions,
        (SELECT COUNT(*) FROM anomaly_results) AS analyzed,
        (SELECT MAX(detected_at) FROM anomaly_results) AS last_analysis
    `);
    out.db.ok = true;
    out.transactions = Number(rows[0].transactions);
    out.analyzed = Number(rows[0].analyzed);
    out.last_analysis = rows[0].last_analysis;
  } catch (err) {
    out.db.error = err.message || err.code || "Database query failed";
  }

  if (out.ml.url) {
    try {
      // Any HTTP answer, even a 404, means the service is up.
      await axios.get(out.ml.url, { timeout: 2500, validateStatus: () => true });
      out.ml.ok = true;
    } catch {
      out.ml.ok = false;
    }
  }

  res.json(out);
});

module.exports = router;
