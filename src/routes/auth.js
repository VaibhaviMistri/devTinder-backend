const express = require('express');
const authRouter = express.Router();
const { User } = require('../models/user');
const { validateSignUpData } = require('../utils/validation');
const userAuth = require('../middlewares/auth');

authRouter.post("/signup", validateSignUpData, async (req, res) => {
    try {
        const { firstName, lastName, emailId, password } = req.body;
        const user = new User({
            firstName,
            lastName,
            emailId,
            password
        });

        const savedUser = await user.save();
        const token = await savedUser.getJwt();

        res.cookie("token", token, {
          expires: new Date(Date.now() + 8 * 3600000),
          httpOnly: true,
          sameSite: "lax", // IMPORTANT for localhost
          secure: false,
        });

        res.json({ message: "User Added successfully!", data: savedUser });
    } catch (error) {
        res.status(500).json({ error: "Signup failed", details: error.message });
    }
});

authRouter.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;
        const user = await User.findOne({ emailId });

        if (!user) {
            throw new Error('Invalid credential');
        }

        const isPasswordValid = await user.validatePassword(password);

        if (isPasswordValid) {
            const token = await user.getJwt();
            res.cookie("token", token, {
              expires: new Date(Date.now() + 8 * 3600000),
              httpOnly: true,
              sameSite: "lax", // IMPORTANT for localhost
              secure: false,
            });
            res.send(user);
        }
        else {
            throw new Error('Invalid credentials');
        }
    } catch (error) {
        res.status(400).send("ERROR : " + error.message);
    }
});

authRouter.post('/logout', userAuth, async (req, res) => {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: "lax", // IMPORTANT for localhost
      secure: false,
    });
    res.send("Logout successfull");
});

module.exports = { authRouter };