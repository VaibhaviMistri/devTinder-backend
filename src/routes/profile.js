const express = require('express');
const profileRouter = express.Router();
const bcrypt = require('bcrypt');
const validator = require('validator');
const userAuth = require('../middlewares/auth');
const { validateEditProfile } = require('../utils/validation');

profileRouter.get('/profile/view', userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    } catch (error) {
        res.status(400).send("Error: " + error.message);
    }
});

profileRouter.patch('/profile/edit', userAuth, validateEditProfile, async (req, res) => {
    try {
        const loggedInUser = req.user;
        
        Object.keys(req.body).forEach((key) => loggedInUser[key] = req.body[key]);

        await loggedInUser.save();
        res.json({
            message: `${loggedInUser.firstName}, your profile updated successfuly`,
            data: loggedInUser,
        });
        
    } catch (error) {        
        res.status(401).send(`Error: ${error.message}`);
    }
});

profileRouter.patch('/profile/updatePassword', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const isPasswordValid = await loggedInUser.validatePassword(req.body.password);
        if (isPasswordValid) {
            throw new Error("Please try different password");
        }

        if (!validator.isStrongPassword(req.body.password)) {
            throw new Error("Enter a strong password");
        }

        const saltRound = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(req.body.password, saltRound);

        loggedInUser.password = newHashPassword;

        await loggedInUser.save();
        res.json({
            message: `${loggedInUser.firstName}, your profile updated successfuly`,
            data: loggedInUser,
        });
    } catch (error) {
        res.status(401).json({ Error: error.message });
    }
});

module.exports = { profileRouter };