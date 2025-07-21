const mongoose = require('mongoose');

const connectDB = async () => {
    return await mongoose.connect(process.env.DATABASE_CONNECTION_STRING + '/devTinder?retryWrites=true&w=majority');
}

module.exports = { connectDB };