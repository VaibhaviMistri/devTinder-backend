const socket = require("socket.io");
const crypto = require('crypto');
const cookie = require('cookie');
const { User } = require('../models/user');
const { Chat } = require('../models/chat');
const { ConnectionRequest } = require("../models/connectionRequest");
const jwt = require('jsonwebtoken');
const { log } = require("console");

const getSecretRoomId = async (userId, targetUserId) => {
    return crypto
        .createHash("sha256")
        .update([userId, targetUserId].sort().join("_"))
        .digest("hex");
};

const initializeSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        },
    });

    io.use(async (socket, next) => {
        try {
            const cookies = cookie.parse(socket.handshake.headers.cookie || "");

            const token = cookies.token;

            if (!token) {
                return next(new Error("Authentication error"));
            }

            const decoded = await jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findById({ _id: decoded._id });

            if (!user) {
                throw new Error("User not found");
            }

            socket.user = user;
            next();
        } catch (error) {
            console.error("Socket Auth Error:", error.message);
            next(new Error("Authentication failed"));
        }
    });

    io.on("connection", (socket) => {
        const { _id, firstName, lastName, photoUrl } = socket.user;

        socket.on("joinChat", async ({ targetUserId }) => {
            try {

                const existingConnection = await ConnectionRequest.findOne({
                    $or: [
                        { fromUserId: _id, toUserId: targetUserId },
                        { fromUserId: targetUserId, toUserId: _id }
                    ],
                    status: "accepted"
                });
                
                if (!existingConnection) {
                    socket.emit("chatAccessDenied", {
                        message: "You are not connected with this user",
                        targetUserId
                    });
                    return;
                }
                
                const roomId = await getSecretRoomId(_id, targetUserId);
                socket.join(roomId);
            } catch (error) {
                console.error(error);
            }
        });

        socket.on("sendMessage", async ({ targetUserId, text }) => {
            try {
                const roomId = await getSecretRoomId(_id, targetUserId);
                let chat = await Chat.findOne({
                    participants: { $all: [_id, targetUserId] },
                });
                if (!chat) {
                    chat = new Chat({
                        participants: [_id, targetUserId],
                        messages: []
                    });
                }
                chat.messages.push({
                    senderId: _id,
                    text
                });
                await chat.save();

                io.to(roomId).emit("messageReceived", { _id, firstName, lastName, photoUrl, text });
            } catch (error) {
                console.error(error);
            }
        });
        socket.on("disconnect", () => {

        });
    });
};

module.exports = initializeSocket;