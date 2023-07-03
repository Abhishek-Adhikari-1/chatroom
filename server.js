const express = require("express");
const app = express();
const httpServer = require("http").createServer(app);
const port = process.env.PORT || 8000; // Changed 'port' to 'PORT'

const io = require("socket.io")(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const users = {};

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html"); // Added a forward slash before "index.html"
});

io.on("connection", (socket) => {
  socket.on("new-user-connected", (user) => {
    if (user !== "") {
      users[socket.id] = user;
      io.emit("user-connected", user); // Changed 'socket.broadcast.emit' to 'io.emit'
    }
  });
  socket.on("message", (msg) => {
    io.emit("message", msg); // Changed 'socket.broadcast.emit' to 'io.emit'
  });
  socket.on("disconnecting", () => { // Removed unused 'user' parameter
    io.emit("user-disconnected", users[socket.id]);
    delete users[socket.id]; // Changed assignment to 'delete' to remove the user from 'users' object
  });
});

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
