const pool = require("../database/index");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const sharp = require("sharp");

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

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const userController = {
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const [result] = await pool.query("select * from users where user_id = ?", [
        id,
      ]);
      const user = result[0];
      res.json(result[0]);
    } catch (error) {
      console.log(error);
      res.json({
        status: "error",
      });
    }
  },
  EditProfile: async (req, res) => {
    try {
      // mode can only be name || bio || profile
      const allowedModes = ["name", "bio", "profile"];
      const { id, mode, text } = req.body;

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

      await pool.query("UPDATE users SET ? = ? where user_id = ?", [
        mode,
        text,
        id,
      ]);
      res.json({
        status: "success",
        message: `Update ${mode} of user id ${id} complete`,
      });
    } catch (error) {
      console.log(error);
      res.json({ error: error.message });
    }
  },
  EditFullProfile: async (req, res) => {
    try {
      const { user_id, name, bio, location } = req.body;
      const [image] = req.files;
      // console.log('Received request:', req.body, req.files);
      // console.log(image)
      if (image !== undefined) {
        // Image is provided
        const fileBuffer = await sharp(image.buffer).toBuffer();
        const fileName = generateFileName();
        try {
          await uploadToS3(fileBuffer, fileName, image.mimetype);

          const imageUrl = `https://trade-d-bucket.s3.ap-southeast-1.amazonaws.com/${fileName}`;

          // Fetch the updated user data
          const updatedUserData = await updateProfileInDatabase(
            name,
            bio,
            location,
            imageUrl,
            user_id
          );

          return res.json({
            status: "success",
            user: updatedUserData,
          });
        } catch (uploadError) {
          // Handle S3 upload error
          console.error(uploadError);
          return res.status(500).json({
            message: "Error updating profile",
            error: "Internal Server Error",
          });
        }
      } else {
        // Image is not provided, update profile without an image
        const updatedUserData = await updateProfileInDatabase(
          name,
          bio,
          location,
          null,
          user_id
        );

        return res.json({
          status: "success",
          user: updatedUserData,
        });
      }
    } catch (error) {
      res.status(400).json({
        message: "Profile Update Error",
        error: error.message,
      });
    }
  },
  getStatusCount: async (req, res) => {
    try {
      let {user_id} = req.params
      let [result] = await pool.query(`SELECT
      user_id,
      COUNT(CASE WHEN status = 'Pending' THEN 1 END) AS PendingCount,
      COUNT(CASE WHEN status = 'Complete' THEN 1 END) AS CompleteCount,
      COUNT(CASE WHEN status = 'Cancel' THEN 1 END) AS CancelCount
      FROM
          items
      WHERE
          user_id = ?;
      `,[user_id]);
      res.json(result[0])
    } catch (error) {
      res.status(400).json({
        message: "Invalid user_id",
        error:error.message
      })
    }
  },
};

const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
  const uploadParams = {
    Bucket: bucketName,
    Body: fileBuffer,
    Key: fileName,
    ContentType: mimeType,
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
  } catch (error) {
    throw new Error(`Error uploading to S3: ${error.message}`);
  }
};

const updateProfileInDatabase = async (
  name,
  bio,
  location,
  imageUrl,
  user_id
) => {
  try {
    // console.log("imageUrl", imageUrl)
    const query =
      imageUrl === null
        ? `UPDATE users SET name = ?, bio = ?, location = ? WHERE user_id = ?`
        : `UPDATE users SET name = ?, bio = ?, location = ?, profile = ? WHERE user_id = ?`;

    const result = await pool.query(
      query,
      imageUrl === null
        ? [name, bio, location, user_id]
        : [name, bio, location, imageUrl, user_id]
    );
    // console.log(result)
    // Fetch and return the updated user data
    const updatedUserData = await getUserById(user_id);
    // console.log(updatedUserData)
    return updatedUserData;
  } catch (error) {
    throw new Error(`Error updating profile in the database: ${error.message}`);
  }
};

const getUserById = async (user_id) => {
  try {
    const [user] = await pool.query(
      "SELECT u.user_id, u.name, u.gender, u.email, u.phone, u.bio, u.profile, u.location FROM users as u WHERE u.user_id = ?",
      [user_id]
    );
    return user;
  } catch (error) {
    throw new Error(`Error fetching user data: ${error.message}`);
  }
};

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
    const imageUrl =
      "https://trade-d-bucket.s3.ap-southeast-1.amazonaws.com/" + imageKey;

    return imageUrl;
  } catch (error) {
    console.error("Error uploading image to S3:", error);
    throw error;
  }
};

module.exports = userController;
