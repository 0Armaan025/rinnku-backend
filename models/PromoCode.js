const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const PromoCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },

    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    maxUsers: { type: Number, default: 1 },
    currentUsers: { type: Number, default: 0 },
});

const PromoCode = mongoose.model("PromoCode", PromoCodeSchema);
module.exports = PromoCode;