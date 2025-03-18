const express = require("express");
const router = express.Router();
const Analytics = require("../models/Analytics");
const User = require("../models/User");
const mongoose = require("mongoose");
const axios = require("axios");


const getIp = (req) => req.headers["x-forwarded-for"] || req.socket.remoteAddress;


const logUserAction = async (rinnkuUrl, action, ip, country, page) => {
    try {
        const user = await User.findOne({ rinnkuUrl });

        if (!user) return; // If user not found, no need to log

        user.logs.push({
            country,
            page,
            ip,
            createdAt: new Date(),
        });

        await user.save();
    } catch (error) {
        console.error("Error logging user action:", error.message);
    }
};


router.post("/track-visit", async (req, res) => {
    try {
        const { rinnkuUrl } = req.body;

        if (!rinnkuUrl) return res.status(400).json({ error: "rinnkuUrl is required" });

        const ip = getIp(req);
        const userAgent = req.headers["user-agent"] || "Unknown Device";

        let country = "Unknown";
        try {
            const geoResponse = await axios.get(`https://ipapi.co/${ip}/json/`);
            country = geoResponse.data.country_name || "Unknown";
        } catch (geoError) {
            console.error("Error fetching location:", geoError.message);
        }

        let analytics = await Analytics.findOne({ rinnkuUrl });

        if (!analytics) {
            analytics = new Analytics({ rinnkuUrl, totalVisits: 1 });
        } else {
            analytics.totalVisits += 1;
        }

        analytics.clicks.push({ timestamp: new Date(), country, device: userAgent, ip });

        await analytics.save();

        // 🔥 Log this visit in the user's logs
        await logUserAction(rinnkuUrl, "visit", ip, country, "biolink");

        res.status(200).json({ message: "Visit tracked successfully." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
});


router.post("/track-click", async (req, res) => {
    try {
        const { rinnkuUrl, linkId, linkName } = req.body;

        if (!rinnkuUrl || !linkId || !linkName) return res.status(400).json({ message: "Missing rinnkuUrl or linkId." });

        if (!mongoose.Types.ObjectId.isValid(linkId)) return res.status(400).json({ message: "Invalid linkId." });

        const ip = getIp(req);
        const device = req.headers["user-agent"] || "Unknown Device";

        // 🔥 Extract referrer from headers
        const referrer = req.headers["referer"] || req.headers["origin"] || "Direct";

        let analytics = await Analytics.findOne({ rinnkuUrl });

        if (!analytics) {
            analytics = new Analytics({ rinnkuUrl, totalVisits: 0, clicks: [] });
        }

        analytics.clicks.push({ linkId, timestamp: new Date(), referrer, device, ip, linkName });

        await analytics.save();

        
        await logUserAction(rinnkuUrl, "click", ip, referrer, "biolink-click");

        res.status(200).json({ message: "Click tracked successfully.", referrer });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
});


router.get("/stats/:rinnkuUrl", async (req, res) => {
    try {
        const { rinnkuUrl } = req.params;

        const analytics = await Analytics.findOne({ rinnkuUrl });

        if (!analytics) return res.status(404).json({ message: "No analytics found." });

        const ip = getIp(req);


        await logUserAction(rinnkuUrl, "stats_request", ip, "Unknown", "biolink-stats");

        res.status(200).json(analytics);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
});

module.exports = router;
