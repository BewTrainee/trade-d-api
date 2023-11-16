const pool = require("../database/index")
const {
    S3Client,
    PutObjectCommand,
  } = require("@aws-sdk/client-s3");

  const region = "ap-southeast-1";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucketName = process.env.BUCKET_NAME2;
  
  const s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

const userController = {
    getById: async (req, res) => {
        try {
            const { id } = req.params
            const result = await pool.query("select * from users where user_id = ?", [id])
            const user = result[0]
            res.json(user[0])
        } catch (error) {
            console.log(error)  
            res.json({
                status: "error"
            })
        }
    },
    EditProfile: async (req, res) => {
        try {
            // mode can only be name || bio || profile
            const allowedModes = ["name", "bio", "profile"];
            const {id, mode, text } = req.body

            if (!allowedModes.includes(mode)) {
                return res.status(400).json({
                  status: "error",
                  message: "Invalid mode.",
                });
              }

            if (mode === "profile") {
                try {
                  const imageUrl = await handleImageUpload(msg.message_text);
                  text = imageUrl;
                } catch (err) {
                  console.error("Error uploading image to S3:", err);
                  socket.emit("chat message error", {
                    error: "Failed to upload the image",
                  });
                  return;
                }
            }

            await pool.query("UPDATE users SET ? = ? where user_id = ?",[mode,text,id])
            res.json({
                status:'success',
                message:`Update ${mode} of user id ${id} complete`
            })
        } catch (error) {
            console.log(error)  
            res.json({ error: error.message });
        }
    }
}

const { v4: uuidv4 } = require("uuid");

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
  
      await s3Client.send(new PutObjectCommand(uploadParams));
      const imageUrl = 'https://trade-d-bucket.s3.ap-southeast-1.amazonaws.com/'+imageKey

      return imageUrl;
    } catch (error) {
      console.error("Error uploading image to S3:", error);
      throw error;
    }
  };

module.exports = userController