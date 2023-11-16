const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const https = require("https");
const path = require("path");
const pool = require("./database/index");
const server = http.createServer(app);
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {
  S3Client,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const aws = require("aws-sdk");


const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    Credential: true,
  },
});

require("dotenv").config();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));

const postsRouter = require("./routes/posts.router");
const authRouter = require("./routes/auth.router");
const chatRouter = require("./routes/chat.router");
const userRouter = require("./routes/user.router");

app.use("/posts", postsRouter);
app.use("/auth", authRouter);
app.use("/chat", chatRouter);
app.use("/user", userRouter);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//IO PART
io.on("connection", (socket) => {
  // console.log("A user connected");

  socket.on("chat message", async (msg) => {
    // Save the message to the database if needed
    const message = {
      sender_id: msg.sender_id,
      receiver_id: msg.receiver_id,
      message_text: msg.message_text,
      timestamp: new Date(),
      type: msg.type || "text",
    };
    
    console.log(message)
    if (msg.type === "image") {
      try {
        const imageUrl = await handleImageUpload(msg.message_text);
        message.message_text = imageUrl;
      } catch (err) {
        console.error("Error uploading image to S3:", err);
        socket.emit("chat message error", {
          error: "Failed to upload the image",
        });
        return;
      }
    }

    const { sender_id, receiver_id, message_text, timestamp, type } = message;
    const query =
      "INSERT INTO chats (sender_id, receiver_id, message_text, timestamp, type) VALUES (?, ?, ?, ?, ?)";
    const values = [sender_id, receiver_id, message_text, timestamp, type];

    try {
      let results = await pool.query(query, values);
      // Emit a success event back to the client
      console.log("Message stored in the database:", results[0]);
    } catch (err) {
      console.error("Error storing message in the database:", err);
      // Emit an error event back to the client
      socket.emit("chat message error", {
        error: "Failed to store the message",
      });
    }
    io.emit("chat message", message); // Broadcast the message to all connected clients
  });
  socket.on("disconnect", () => {
    // console.log("A user disconnected");
  });
});

const region = "ap-southeast-1";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucketName = process.env.BUCKET_NAME2;

const s3 = new aws.S3({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region,
});

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const fs = require("fs").promises;
const util = require("util");
const { v4: uuidv4 } = require("uuid");
const readFileAsync = util.promisify(fs.readFile);

const handleImageUpload = async (image) => {
  if (!image) {
    throw new Error("Image parameter is undefined");
  }

  try {
    const imageKey = `${uuidv4()}.jpg`;
    const uploadParams = {
      Bucket: bucketName,
      Body: image,
      Key: imageKey,
      ContentType: "image/jpeg",
    };

    // console.log(uploadParams);

    // await s3Client.putObject(uploadParams).promise();
    await s3Client.send(new PutObjectCommand(uploadParams));
    const imageUrl = 'https://trade-d-bucket.s3.ap-southeast-1.amazonaws.com/'+imageKey
    // const getObjectCommand = new GetObjectCommand({
    //   Bucket: bucketName,
    //   Key: imageKey,
    // });

    // const signedUrl = await getSignedUrl(s3Client, getObjectCommand, {
    //   expiresIn: 36000,
    // });

    return imageUrl;
  } catch (error) {
    console.error("Error uploading image to S3:", error);
    throw error;
  }
};


function keepAlive() {
  const options = {
    hostname: "trade-d-api.onrender.com",
    port: 443,
    path: "/",
    method: "GET",
  };

  const req = https.request(options, (res) => {
    // console.log(`Keep-alive request status code: ${res.statusCode}`);
  });

  req.on("error", (error) => {
    console.error("Keep-alive request error:");
    console.error(error);
  });

  req.end();
}

setInterval(keepAlive, 300000); //KeepAlive every 5 min

// You can also call `keepAlive` immediately to make the first request.
keepAlive();
