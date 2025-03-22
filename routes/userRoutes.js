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
        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();


        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({
            message: "User registered successfully",
            token, // ✅ Now returning a token
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });
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


        const existingUser = await User.findById(userId).lean();
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }


        const updatedUserData = { ...existingUser, ...req.body };


        const updateData = Object.fromEntries(
            Object.entries(updatedUserData).filter(([_, value]) => value !== undefined)
        );


        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");

        res.json(updatedUser);
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ error: "Server error" });
    }
});


router.get("/:name", async (req, res) => {
    try {
        const user = await User.findOne({ rinnkuUrl: req.params.name });
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({
            user
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
