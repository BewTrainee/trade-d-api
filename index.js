const express = require("express")
const app = express()
const cors = require("cors")
const http = require("http");
const https = require('https');
const path = require('path');
const pool = require("./database/index");
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

app.get("/", (req,res) => {
    res.sendFile(__dirname + "/index.html")
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})



//IO PART
io.on("connection", (socket) => {
    // console.log("A user connected");
  
    socket.on("chat message", async (msg) => {
        // Save the message to the database if needed
        const message = {
            chat_id: msg.chat_id,
            sender_uid: msg.sender_uid,
            message_text: msg.message_text,
            send_at: new Date(),
        };

        // console.log(message)

        const { chat_id, sender_uid, message_text, send_at } = message;
        const query =
            "INSERT INTO messages (chat_id, sender_uid, message_text, send_at) VALUES (?, ?, ?, ?)";
        const values = [chat_id, sender_uid, message_text, send_at];

        try {
            var results = await pool.query(query, values);
            // console.log('Message stored in the database:', results[0]);
            // Emit a success event back to the client
            socket.emit('chat message success', { message: 'Message stored successfully' });
          } catch (err) {
            console.error('Error storing message in the database:', err);
            // Emit an error event back to the client
            socket.emit('chat message error', { error: 'Failed to store the message' });
          }

        io.emit("chat message", msg); // Broadcast the message to all connected clients
    });
    socket.on("disconnect", () => {
        // console.log("A user disconnected");
      });
  });

  function keepAlive() {
    const options = {
      hostname: 'trade-d-api.onrender.com',
      port: 443,
      path: '/',
      method: 'GET',
    };
    https.request(options);
    // const req = https.request(options, (res) => {
      // console.log(`Keep-alive request status code: ${res.statusCode}`);
    // });
  
    req.on('error', (error) => {
      console.error('Keep-alive request error:');
      console.error(error);
    });
  
    req.end();
  }
  
  setInterval(keepAlive, 300000); //KeepAlive every 5 min
  
  
  // You can also call `keepAlive` immediately to make the first request.
  keepAlive();