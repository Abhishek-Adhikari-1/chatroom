const express = require("express");
const app = express();
const httpServer = require("http").createServer(app);
const port = process.env.port || 8000;

const io = require("socket.io")(httpServer, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

const users = {};

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
	res.sendFile(__dirname + "index.html");
});

io.on("connection", (socket) => {
	socket.on("new-user-connected", (user) => {
		if (user !== "") {
			users[socket.id] = user;
			socket.broadcast.emit("user-connected", user);
		}
	});
	socket.on("message", (msg) => {
		socket.broadcast.emit("message", msg);
	});
	socket.on("disconnecting", (user) => {
		socket.broadcast.emit("user-disconnected", users[socket.id]);
	});
});

httpServer.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
