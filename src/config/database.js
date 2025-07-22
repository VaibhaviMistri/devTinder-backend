const mongoose = require('mongoose');

const connectDB = async () => {    
    return await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
}

module.exports = { connectDB };