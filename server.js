const express = require("express");
const dotenv = require("dotenv");
const cors = require('cors');
const morgan = require("morgan");

const connectDB = require("./config/db");

const analyticsRoute = require("./routes/analyticsRoute");
const userRoutes = require("./routes/userRoutes");
const bioLinkRoutes = require("./routes/bioLinkRoute");
const promoCodeRoute = require("./routes/promoCodeRoute");

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

app.use("/api/user", userRoutes);
app.use("/api/bioLink", bioLinkRoutes);
app.use("/api/analytics", analyticsRoute);
app.use("/api/promocode", promoCodeRoute);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));