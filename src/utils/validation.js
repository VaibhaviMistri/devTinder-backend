const validator = require("validator");

const validateSignUpData = (req, res, next) => {
    const { firstName, lastName, emailId, password } = req.body;
    if (!firstName || !lastName) {
        throw new Error("Name is not valid!");
    } else if (!validator.isEmail(emailId)) {
        throw new Error("Email is not valid!");
    } else if (!validator.isStrongPassword(password)) {
        throw new Error("Please enter a strong Password!");
    }
    next();
};

const validateEditProfile = (req, res, next) => {
    try {
        const allowedFields = [
            "firstName", "lastName", "photoUrl", "gender", "age", "about", "skills"
        ];

        const isEditAllowed = Object.keys(req.body).every((field) => allowedFields.includes(field));
        if (!isEditAllowed) {
            throw new Error("Invalid edit request");
        }

        next();
    } catch (error) {
        res.status(401).send( `Error: ${error.message}` );
    }
}
module.exports = {
    validateSignUpData,
    validateEditProfile
};