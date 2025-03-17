const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const PromoCode = require("../models/PromoCode");
const User = require("../models/User");
const authMiddleWare = require("../middlewares/authMiddleware");


router.get("/", async (req, res) => {
    return res.status(200).json({
        message: "promo code 200 success!",
    });
});

router.post("/create", async (req, res) => {

    try {

        const { maxUsers } = req.body;

        if (!maxUsers || isNan(maxUsers) || maxUsers <= 0) {
            return res.status(400).json({
                message: "Invalid maxUsers",
            });
        }


        const code = [...Array(16)]
            .map(() => Math.floor(Math.random() * 36).toString(36))
            .join('')
            .toUpperCase();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        const promoCode = new PromoCode({
            code,
            expiresAt,
        });
        await promoCode.save();
        return res.status(200).json({
            message: "promo code created",
            code,
        });
    }
    catch (e) {
        return res.status(500).json({
            message: "some problem is there, sorry!",
            error: e.message,
        })
    }
});

router.post('/apply/:code', authMiddleWare, async (req, res) => {
    try {
        const { code } = req.params;
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const promoCode = await PromoCode.findOne({ code });

        if (!promoCode) {
            return res.status(404).json({
                message: "Invalid promo code",
            });
        }
        else if (promoCode.expiresAt < new Date() || promoCode.currentUsers >= promoCode.maxUsers) {
            return res.status(400).json({
                message: "Promo code expired or max use left reached",
            });
        }
        else {

            const user = await User.findOne({ _id: userId });

            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }
            else {
                user.promoCode = code;
                user.isPremium = true;
                user.promoExpiry = promoCode.expiresAt;
                promoCode.currentUsers += 1;
                await promoCode.save();
                await user.save();
                return res.status(200).json({
                    message: "Promo code applied successfully",
                });
            }


        }
    }
    catch (e) {
        return res.status(500).json({
            message: "Some error occurred",
            error: e.message,
        });
    }
});

module.exports = router;