const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Import User Model
const authMiddleware = require("../middlewares/authMiddleware");


const isValidUsername = (username) => /^[a-zA-Z0-9_-]{3,30}$/.test(username);


router.post("/create", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        let { rinnkuUrl } = req.body;

        if (!rinnkuUrl) return res.status(400).json({ message: "Biolink username is required." });

        rinnkuUrl = rinnkuUrl.trim();

        if (!isValidUsername(rinnkuUrl)) {
            return res.status(400).json({ message: "Invalid username. Use 3-30 letters, numbers, - or _." });
        }

        const existingUser = await User.findOne({ rinnkuUrl });
        if (existingUser) return res.status(400).json({ message: "This username is already taken." });

        const user = await User.findByIdAndUpdate(
            userId,
            { rinnkuUrl },
            { new: true }
        );

        res.status(200).json({
            message: "Biolink created successfully.",
            rinnkuUrl: `https://rinnku.vercel.app/@${rinnkuUrl}`
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
});


router.put("/update", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        let { rinnkuUrl } = req.body;

        if (!rinnkuUrl) return res.status(400).json({ message: "New biolink username is required." });

        rinnkuUrl = rinnkuUrl.trim().toLowerCase();

        if (!isValidUsername(rinnkuUrl)) {
            return res.status(400).json({ message: "Invalid username. Use 3-30 letters, numbers, - or _." });
        }

        const existingUser = await User.findOne({ rinnkuUrl });
        if (existingUser) return res.status(400).json({ message: "This username is already taken." });

        const user = await User.findByIdAndUpdate(
            userId,
            { rinnkuUrl },
            { new: true }
        );

        res.status(200).json({
            message: "Biolink updated successfully.",
            rinnkuUrl: `https://rinnku.vercel.app/@${rinnkuUrl}`
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
});


router.delete("/delete", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findByIdAndUpdate(
            userId,
            { $unset: { rinnkuUrl: "" } }, // Removes the field
            { new: true }
        );

        res.status(200).json({ message: "Biolink deleted successfully." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
});

module.exports = router;
