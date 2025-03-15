const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    qrCode: { type: String, required: false },
    rinnkuUrl: { type: String, required: false },
    googleId: { type: String },
    theme: { type: String, default: 'light', code: '' },
    avatar: { type: String },
    promoCodeApplied: { type: String, required: false },
    isPremium: { type: Boolean, default: false },
    links: [
        {
            name: String,
            url: String,
            icon: String,
        }
    ],
    createdAt: { type: Date, default: Date.now },
    refreshToken: { type: String },// Store the refresh token
    logs: {
        type: [
            {
                country: String,
                page: String,
                createdAt: { type: Date, default: Date.now },
                ip: String,
            }
        ],
        default: []

    }

});

const User = mongoose.model('User', UserSchema);
module.exports = User;
