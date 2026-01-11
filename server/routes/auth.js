const { Router } = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../db/pool");

const router = Router();

router.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const hash = await bcrypt.hash(password, 10);

        await pool.query(`INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4)`, [name, email, hash, role]);

        res.json({ message: "User registered successfully" });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "User already exists" });
    }

});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
});

module.exports = router;