const { Router } = require("express");
const { pool } = require("../db/pool");

const router = Router();

router.post("/", async (req, res) => {
    try {
        const transactions = req.body;

        for (let t of transactions) {
            await pool.query(`INSERT INTO transactions(vendor_id, vendor_name, department, amount, location, transaction_date) VALUES ($1, $2, $3, $4, $5, $6)`, [t.vendor_id, t.vendor_name, t.department, t.amount, t.location, t.transaction_date]);
        }
        res.json({ message: "Transactions uploaded successfully!" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Upload failed" });

    }
});

module.exports = router;