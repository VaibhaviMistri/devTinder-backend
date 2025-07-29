const express = require('express');
const chatRouter = express.Router();
const { Chat } = require('../models/chat');
const userAuth = require('../middlewares/auth');

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const _id = req.user;
        
        let chat = await Chat.findOne({
            participants: { $all: [_id, targetUserId] },  
        }).populate({
            path: "messages.senderId",
            select: "firstName lastName photoUrl",
        });

        if (!chat) {
            chat = new Chat({
                participants: [_id, targetUserId],
                messages: []
            });
            await chat.save();
        }
        res.json(chat);

    } catch (error) {
        res.status(401).json({ Error: error.message });
    }
});

module.exports = { chatRouter };