const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const PromoCode = require("../models/PromoCode");
const User = require("../models/User");


router.get("/", async (req, res) => {
    return res.status(200).json({
        message: "promo code 200 success!",
    });
});

router.post("/create", async (req, res) => {
    // this will create a promo code of 16 digits
    try {

        const code = Math.random().toString(36).substring(2, 18).toUpperCase();
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

module.exports = router;