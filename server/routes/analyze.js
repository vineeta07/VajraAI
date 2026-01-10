const {Router} = require("express");
const {pool} = require("../db/pool");
const axios = require("axios");

const router = Router();

const {buildFeatures} = require("../services/featureEngineering");
const {generateReasons} = require("../services/ruleEngine");

router.post("/", async (req, res) => {
    try {
        const {rows} = await pool.query("SELECT * FROM transactions");

        const featureData = buildFeatures(rows);
        const mlResponse = await axios.post(process.env.ML_SERVICE_URL, featureData);

        for (let result of mlResponse.data){
            const reasons = generateReasons(result);

            await pool.query(`INSERT INTO anomaly_results(transaction_id, anomaly_score, risk_level, reason) VALUES ($1, $2, $3, $4)`, [result.transaction_id, result.anomaly_score, result,risk_level, reasons]);
        }
        res.json({message: "Fraud analysis completed"});

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Analysis failed"});
    }
});

module.exports = router;