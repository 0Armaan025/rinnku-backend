const mongoose = require("mongoose");

const AnalyticsSchema = new mongoose.Schema({
    rinnkuUrl: { type: String, required: true },
    totalVisits: { type: Number, default: 0 },
    clicks: [
        {
            linkId: mongoose.Schema.Types.ObjectId,
            linkName: String,
            timestamp: { type: Date, default: Date.now },
            country: String,

            device: String,
            ip: String,
        }
    ],
    createdAt: { type: Date, default: Date.now },
});

const Analytics = mongoose.model("Analytics", AnalyticsSchema);
module.exports = Analytics;
