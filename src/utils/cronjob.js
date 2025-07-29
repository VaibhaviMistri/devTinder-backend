const cron = require('node-cron');
const { subDays, startOfDay, endOfDay } = require('date-fns');
const { ConnectionRequest } = require("../models/connectionRequest");
const sendEmail = require("./sendEmail");

cron.schedule("0 8 * * *", async () => {
    try {
        const yesterday = subDays(new Date(), 1);
        const yesterdayStart = startOfDay(yesterday);
        const yesterdayEnd = endOfDay(yesterday);

        const pendingRequest = await ConnectionRequest.find({
            status: "interested",
            createdAt: {
                $gte: yesterdayStart,
                $lte: yesterdayEnd
            }
        }).populate("fromUserId toUserId");        

        const listOfEmails = [...new Set(pendingRequest.map((req) => req.toUserId.emailId))];

        for (const email of listOfEmails) {
            try {
                const res = await sendEmail.run(
                    "Reminder",
                    `New requests are pending for ${email}`
                );
            } catch (error) {
                console.error(error);
            }
        }
    } catch (error) {
        console.error(error);
    }
}, { timezone: "Asia/Kolkata" });