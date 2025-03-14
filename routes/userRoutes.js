const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');  // JWT authentication middleware

const router = express.Router();


router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: "All fields are required" });


        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ error: "User already exists" });


        const hashedPassword = await bcrypt.hash(password, 10);


        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "All fields are required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });


        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});


router.get('/me', authMiddleware, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const user = await User.findById(userId).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});


router.put('/update', authMiddleware, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const { name, avatar } = req.body;

        const updatedUser = await User.findByIdAndUpdate(userId, { name, avatar }, { new: true }).select("-password");

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/:name", async (req, res) => {
    try {
        const user = await User.findOne({ name: req.params.name });
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({
            name: user.name,
            email: user.email,
            profilePic: user.avatar,
            links: user.links,
            isPremium: user.isPremium,
            rinnkuUrl: user.rinnkuUrl,
            qrCode: user.qrCode,
            theme: user.theme,
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/logout", async (req, res) => {
    try {
        const { userId } = req.body;
        await User.findByIdAndUpdate(userId, { refreshToken: null }); // Remove refresh token
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ error: "Logout failed" });
    }
});

module.exports = router;
