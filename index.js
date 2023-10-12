const express = require("express")
const app = express()
const cors = require("cors")
const http = require("http");
const path = require('path');
const server = http.createServer(app);

const io = require("socket.io")(server,{
    cors:{
        origin:"*",
        methods:["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        Credential:true,
    }
})
require('dotenv').config()

app.use(cors());
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'uploads')));

const postsRouter = require('./routes/posts.router')
const authRouter = require('./routes/auth.router')
const chatRouter = require('./routes/chat.router')
const userRouter = require('./routes/user.router')


app.use("/posts", postsRouter)
app.use("/auth", authRouter)
app.use("/chat", chatRouter)
app.use("/user", userRouter)

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

io.on("connection", (socket) => {
    //console.log("A user connected");

    socket.on("chat message", (msg) => {
      // Save the message to the database if needed
      const message = {
        chat_id: msg.chat_id,
        sender_uid: msg.sender_uid,
        message_text: msg.message_text,
        send_at: new Date(),
      };

      const { chat_id, sender_uid, message_text, send_at } = message;
      const query =
        "INSERT INTO messages (chat_id, sender_uid, message_text, send_at) VALUES (?, ?, ?, ?)";
      const values = [chat_id, sender_uid, message_text, send_at];

      connection.query(query, values, (error, results) => {
        if (error) {
          console.error("Error storing message in the database:", error);
          res.status(500).json({error: "Failed to store the message"})
        } else {
          console.log("Message stored in the database:", results);
        }
      });

      io.emit("chat message", msg); // Broadcast the message to all connected clients
    });

    socket.on("disconnect", () => {
      //console.log("A user disconnected");
    });
  });
