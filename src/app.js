const dotenv = require('dotenv');
dotenv.config();
const express = require("express");
const { connectDB } = require("./config/database.js");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require('cors');

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const { authRouter } = require('./routes/auth.js');
const { profileRouter } = require('./routes/profile.js');
const { requestRouter } = require('./routes/request.js');
const { userRouter } = require('./routes/user.js');

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);

connectDB()
    .then(() => {
        console.log("database connection is successfull");
        app.listen(process.env.PORT, () => {
            console.log(`server running at port 3000`);
        });
    })
    .catch((err) => {
        console.error("Database not connected", err.message);
    });