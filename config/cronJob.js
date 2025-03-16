const cron = require("node-cron");
const mongoose = require("mongoose");
const User = require("../models/User");

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

cron.schedule("0 0 * * *", async () => {
    console.log("Running promo expiry check...");

    const now = new Date();
    try {
        const result = await User.updateMany(
            { promoExpiry: { $lt: now }, isPremium: true },
            { $set: { isPremium: false, promoCode: null, promoExpiry: null } }
        );

        console.log(`Downgraded ${result.modifiedCount} users.`);
    } catch (error) {
        console.error("Error updating users:", error);
    }
});

module.exports = cron;
