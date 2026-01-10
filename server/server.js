require("dotenv").config();
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Express app running on PORT: ${PORT}`);
})

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/api", (req, res) => {
    res.json({message: "root"});
});

