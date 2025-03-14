const express = require("express");
const router = express.Router();
const Analytics = require("../models/Analytics");
const axios = require("axios"); // For getting country info


router.post("/track-visit", async (req, res) => {
    try {
        const { rinnkuUrl } = req.body;

        if (!rinnkuUrl) return res.status(400).json({ error: "rinnkuUrl is required" });


        const userIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;


        const userAgent = req.headers["user-agent"] || "Unknown Device";


        let country = "Unknown";
        try {
            const geoResponse = await axios.get(`https://ipapi.co/${userIp}/json/`);
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


        analytics.clicks.push({
            timestamp: new Date(),
            country,
            device: userAgent,
            ip: userIp,
        });

        await analytics.save();

        res.status(200).json({ message: "Visit tracked successfully." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }

    router.post("/track-click", async (req, res) => {
        try {
            const { rinnkuUrl, linkId, referrer } = req.body;

            if (!rinnkuUrl || !linkId) {
                return res.status(400).json({ message: "Missing rinnkuUrl or linkId." });
            }


            if (!mongoose.Types.ObjectId.isValid(linkId)) {
                return res.status(400).json({ message: "Invalid linkId." });
            }


            const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
            const device = req.headers["user-agent"] || "Unknown Device";


            let analytics = await Analytics.findOne({ rinnkuUrl });

            if (!analytics) {
                analytics = new Analytics({ rinnkuUrl, totalVisits: 0, clicks: [] });
            }


            analytics.clicks.push({
                linkId,
                timestamp: new Date(),
                referrer: referrer || "Direct",
                device,
                ip,
            });

            await analytics.save();

            res.status(200).json({ message: "Click tracked successfully." });

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

            res.status(200).json(analytics);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error." });
        }
    });

});

module.exports = router;
