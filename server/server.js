require("dotenv").config();
const express = require("express");
const app = express();

const uploadRoutes = require("./routes/upload");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`);
})

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
    res.json({message: "VajraAI backend running..."});
});

