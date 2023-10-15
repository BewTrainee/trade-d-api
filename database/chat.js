// socket.js
const socketIO = require("socket.io");

function setupSocketServer(server, pool) {
    const io = socketIO(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["my-custom-header"],
            Credential: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("A user connected");

        socket.on("chat message", async (msg) => {
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

            try {
                const [results] = await pool.query(query, values);
                console.log("Message stored in the database:", results);

                // Emit a success event back to the client
                socket.emit("chat message success", { message: "Message stored successfully" });
            } catch (error) {
                console.error("Error storing message in the database:", error);

                // Emit an error event back to the client
                socket.emit("chat message error", { error: "Failed to store the message" });
            }

            io.emit("chat message", msg); // Broadcast the message to all connected clients
        });

        socket.on("disconnect", () => {
            console.log("A user disconnected");
        });
    });

    return io;
}

module.exports = setupSocketServer;
