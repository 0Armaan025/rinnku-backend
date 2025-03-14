const express = require("express");
const dotenv = require("dotenv");
const cors = require('cors');
const morgan = require("morgan");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// middlewares

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// normal route

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to the API"
    });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));