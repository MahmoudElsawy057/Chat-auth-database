const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");
const redis = require("redis");
const client = redis.createClient();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./models/user");

const authRoutes = require("./routes/auth");
// import { createClient } from "redis";
// const client = createClient();
// client.on("error", (err) => console.log("Redis Client Error", err));
// await client.connect();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use(authRoutes);
client
  .connect()
  .then(() => {
    console.log("Connected to Redis");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use(cors());

const io = new Server(server, {
  cors: {
    methods: ["GET", "POST"],
    origin: "http://localhost:5173",
  },
});

// async function sendMessage(socket, room) {
//   const list = await client.lRange("messages", 0, -1);

//   list.map((x) => {
//     const usernameMessage = x.split(";");
//     const redisMessageRoom = usernameMessage[0];
//     const redisUsername = usernameMessage[1];
//     const redisMessage = usernameMessage[2];
//     const redisMessageTime = usernameMessage[3];
//     if (redisMessageRoom == room) {
//       socket.emit("recieve_message", {
//         room: redisMessageRoom,
//         author: redisUsername,
//         message: redisMessage,
//         time: redisMessageTime,
//       });
//     }
//   });
// }

const jwt = require("jsonwebtoken");

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.query.token;
    const payload = await jwt.verify(token, "secretdo2rom");
    // console.log(token);
    // socket.userId = payload.id;
    next();
  } catch (err) {}
});

io.on("connection", (socket) => {
  // console.log(socket.id, "connected");
  socket.on("join_room", (room) => {
    // sendMessage(socket, room);
    // console.log(room);
    socket.join(room);
  });

  socket.on("send_message", async ({ room, author, message, time }) => {
    // client.rPush("messages", `${room};${author};${message};${time}`);

    socket.to(room).emit("recieve_message", { room, author, message, time });
    const user = await User.findOne({ userName: author });
    user.messsages.push({ room, author, message, time });
    await user.save();
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// server.listen(3001, () => console.log("server is runnin"));

mongoose
  .connect("mongodb+srv://do2rom:33885551@cluster0.s6iytmu.mongodb.net/chat")
  .then((res) => server.listen(3001))
  .catch((err) => console.log(err));
