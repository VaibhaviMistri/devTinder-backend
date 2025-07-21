const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 15
    },
    lastName: {
        type: String
    },
    emailId: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email address: " + value);
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error("Enter a strong password");
            }
        }
    },
    age: {
        type: Number,
        min: 18
    },
    gender: {
        type: String,
        enum: {
            values: ["male", "female", "other"],
            message: `{VALUE} is not a valid gender type`
        }
    },
    photoUrl: {
        type: String,
        default: "https://geographyandyou.com/images/user-profile.png",
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error("Invalid photo url: " + value);
            }
        }
    },
    about: {
        type: String,
        default: "No decription added"
    },
    skills: {
        type: [String],
    },
},
    {
        timestamps: true
    }
);


userSchema.pre('save', async function (next) {
    const user = this;

    if (!user.isModified("password")) {
        return next();
    }
    try {
        const saltRound = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(user.password, saltRound);
        user.password = hashPassword;
    } catch (error) {
        next(error);
    }
});

userSchema.methods.getJwt = async function () {
    const user = this;
    const token = await jwt.sign({ _id: user._id, }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

    return token;
}

userSchema.methods.validatePassword = async function (passwordInputByUser) {
    const user = this;
    const encryptedPassword = user.password;

    const isPasswordValid = await bcrypt.compare(
        passwordInputByUser,
        encryptedPassword
    );

    return isPasswordValid;
}

const User = mongoose.model("User", userSchema);
module.exports = { User };