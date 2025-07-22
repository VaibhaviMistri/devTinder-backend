const mongoose = require('mongoose');

const connectDB = async () => {
    return await mongoose.connect('mongodb+srv://vaibhavimistri11:vaibhavi_113@nodejs.h5jbhrt.mongodb.net/devTinder?retryWrites=true&w=majority');
}

module.exports = { connectDB };