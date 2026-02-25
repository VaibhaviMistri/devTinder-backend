const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { connectDB } = require("./src/config/database.js");
const cookieParser = require("cookie-parser");
const initializeSocket = require("./src/utils/socket.js");
require("./src/utils/cronjob.js");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
const { authRouter } = require("./src/routes/auth.js");
const { profileRouter } = require("./src/routes/profile.js");
const { requestRouter } = require("./src/routes/request.js");
const { userRouter } = require("./src/routes/user.js");
const { chatRouter } = require("./src/routes/chat.js");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);

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
