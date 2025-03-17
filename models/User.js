const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: null }, // Null for Google users
    googleId: { type: String, default: null }, // Store Google ID for OAuth users
    avatar: { type: String, default: null }, // Profile picture (Google users get it from Google)
    qrCode: { type: String, required: false },
    rinnkuUrl: { type: String, required: false },
    bio: {
        type: String,

        default: "Hi there, I'm using Rinkuu!"
    },
    layout: { type: String, default: "standard" },
    animation: { type: String, default: "scale" },
    theme: { type: String, default: 'midnight' },
    promoExpiry: { type: Date, required: false },
    promoCode: { type: String, required: false },
    isPremium: { type: Boolean, default: false },
    links: [
        {
            name: String,
            url: String,
            icon: { type: String, default: 'social' },
            animation: { type: String, default: 'scale' },

        }
    ],

    roundedCorners: { type: Boolean, default: true },
    showShadows: { type: Boolean, default: true },
    showBorders: { type: Boolean, default: true },
    fullWidth: { type: Boolean, default: true },
    showAvatar: { type: Boolean, default: true },
    showIcons: { type: Boolean, default: true },
    showBio: { type: Boolean, default: true },
    isPublic: { type: Boolean, default: true },
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
