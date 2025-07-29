const express = require("express");
const app = express();
const dotenv = require('dotenv');
const http = require("http");
const cors = require('cors');
dotenv.config();
const { connectDB } = require("./config/database.js");
const cookieParser = require("cookie-parser");
const initializeSocket = require("./utils/socket.js");
require("./utils/cronjob.js");

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
const { chatRouter } = require('./routes/chat.js');

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);
app.use('/', chatRouter);

const server = http.createServer(app);

initializeSocket(server);

connectDB()
    .then(() => {
        console.log("database connection is successfull");
        server.listen(process.env.PORT, () => {
            console.log(`server running at port 3000`);
        });
    })
    .catch((err) => {
        console.error("Database not connected", err.message);
    });