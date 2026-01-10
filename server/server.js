require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

const uploadRoutes = require("./routes/upload");
const analyzeRoutes = require("./routes/analyze");
const dashboardRoutes = require("./routes/dashboard");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`);
})

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/api/upload", uploadRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
    res.json({message: "VajraAI backend running..."});
});

