const express = require('express');
const userRouter = express.Router();
const userAuth = require("../middlewares/auth");
const { ConnectionRequest } = require('../models/connectionRequest');
const { User } = require('../models/user');

const SAFE_USER_DATE = ["firstName", "lastName", "photoUrl", "age", "gender", "skills", "about"];

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const pendingRequest = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested"
        }).populate(
            "fromUserId",
            SAFE_USER_DATE
        ).select("_id toUserId fromUserId");

        res.json({ message: "Data fetched successfully", pendingRequest });

    } catch (error) {
        res.status(400).send(`Error: ${error.message}`);
    }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connections = await ConnectionRequest.find({
            $or: [
                { toUserId: loggedInUser._id },
                { fromUserId: loggedInUser._id },
            ],
            status: "accepted"
        }).populate("fromUserId", SAFE_USER_DATE)
            .populate("toUserId", SAFE_USER_DATE);

        const data = connections.map((row) => {
            if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return row.toUserId;
            }
            return row.fromUserId;
        });

        res.json({ message: "Data fetched successfully", data });
    } catch (error) {
        res.status(400).send(`message: ${error.message}`);
    }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;
        const skip = (page - 1) * limit;

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id },
                { toUserId: loggedInUser._id }
            ]
        }).select("fromUserId toUserId").lean();

        const hideUserFromFeed = new Set();
        connectionRequests.forEach((req) => {
            hideUserFromFeed.add(req.fromUserId.toString());
            hideUserFromFeed.add(req.toUserId.toString());
        });

        const showInfeedUser = await User.find({
            $and: [
                { _id: { $nin: Array.from(hideUserFromFeed) } },
                { _id: { $ne: loggedInUser._id } }
            ],
        }).select(SAFE_USER_DATE).lean().skip(skip).limit(limit);

        res.json({ data: showInfeedUser });

    } catch (error) {
        res.status(400).send(`Error: ${error.message}`);
    }
});

module.exports = { userRouter };