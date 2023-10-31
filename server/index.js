const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const users = new Map(); // Keep track of online users and their usernames

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
    if (users.has(socket.id)) {
      const username = users.get(socket.id);
      users.delete(socket.id);
      // Notify other clients that the user has gone offline
      io.emit("user-status", { username, online: false });
    }
  });

  socket.on("set-username", (username) => {
    // Set the username for the user
    users.set(socket.id, username);
    // Notify other clients that a user has come online
    io.emit("user-status", { username, online: true });
  });

  socket.on("message", (messageData) => {
    const username = users.get(socket.id);
    if (username) {
      // Broadcast the message to all connected clients, including the sender
      io.emit("message", messageData);
    }
  });

  socket.on("image", (imageData) => {
    const username = users.get(socket.id);
    if (username) {
      // Broadcast the image to all connected clients, including the sender
      io.emit("image", imageData);
    }
  });
});

http.listen(4200, () => {
  console.log("Listening on port 4200");
});
