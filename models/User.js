const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: null }, // Null for Google users
    googleId: { type: String, default: null }, // Store Google ID for OAuth users
    avatar: { type: String, default: null }, // Profile picture (Google users get it from Google)
    qrCode: { type: String, required: false },
    rinnkuUrl: { type: String, required: false },
    theme: { type: String, default: 'light' },
    promoCodeApplied: { type: String, required: false },
    isPremium: { type: Boolean, default: false },
    links: [
        {
            name: String,
            url: String,
            icon: String,
        }
    ],
    refreshToken: { type: String, default: null }, // Only used for email/password users
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
    },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
