const express = require('express');
const userAuth = require('../middlewares/auth');
const { ConnectionRequest } = require('../models/connectionRequest');
const { User } = require('../models/user');
const requestRouter = express.Router();

const sendEmail = require("../utils/sendEmail");

requestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const status = req.params.status;
        const toUserId = req.params.toUserId;

        const allowedStatus = ["ignored", "interested"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid status type" });
        }

        const toUser = await User.findOne({ _id: toUserId });
        if (!toUser) {
            return res.status(401).send({ message: "User does not exist" });
        }

        const existingRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ],
        });

        if (existingRequest) {
            return res.status(400).send({ message: "Connection request already exist" });
        }

        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });

        const requestSent = await connectionRequest.save();

        if (status === "interested") {
            const emailRes = await sendEmail.run(
                "Request sent",
                `You have got new pending request from ${req.user.firstName}`
            );
        }

        res.json({
            message: `Status: ${status} from: ${req.user.firstName} to: ${toUser.firstName}`,
            requestSent
        });

    } catch (error) {
        res.json({ Error: error.message });
    }
});

requestRouter.post('/request/review/:status/:requestId', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const { status, requestId } = req.params;

        const allowedStatus = ["accepted", "rejected"];
        if (!allowedStatus.includes(status)) {
            return res.status(401).json({ message: "Status not allowed" });
        }

        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested",
        });

        if (!connectionRequest) {
            return res
                .status(401)
                .json({ message: "Connection request not found" });
        }

        connectionRequest.status = status;
        const requestStatus = await connectionRequest.save();

        res.json({ message: `Connection request ${status}` });

    } catch (error) {
        res.status(400).send(`Error: ${error.messagge}`);
    }
});

module.exports = { requestRouter };