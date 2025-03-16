const express = require("express");
const dotenv = require("dotenv");
const cors = require('cors');
const morgan = require("morgan");
const rateLimit = require("express-rate-limit")
const connectDB = require("./config/db");
const helmet = require("helmet");

const analyticsRoute = require("./routes/analyticsRoute");
const userRoutes = require("./routes/userRoutes");
const bioLinkRoutes = require("./routes/bioLinkRoute");
const promoCodeRoute = require("./routes/promoCodeRoute");

const hidePoweredBy = require("hide-powered-by");

dotenv.config();
connectDB();

const app = express();

// middlewares

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(express.json());
app.use(cors());

app.use(morgan("dev"));
app.use(hidePoweredBy());
app.use(helmet());


require("./config/cronJob");

// normal route

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to the API"
    });
});

app.use("/api", apiLimiter);

app.use("/api/user", userRoutes);
app.use("/api/bioLink", bioLinkRoutes);
app.use("/api/analytics", analyticsRoute);
app.use("/api/promocode", promoCodeRoute);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));