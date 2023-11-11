const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const sharp = require("sharp");
const crypto = require("crypto");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const pool = require("../database/index");
const { adsense } = require("googleapis/build/src/apis/adsense");
const { assuredworkloads } = require("googleapis/build/src/apis/assuredworkloads");

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

const postsController = {
  getAll: async (req, res) => {
    try {
      // const result = await pool.query("select posts.*,p.name,p.lastname,p.avatar from posts posts RIGHT JOIN profile p ON posts.uid = p.uid order by create_at DESC")
      const result = await pool.query("call AllPostToCard();");
      const data = result[0];
      for (let image of data[0]) {
        image.imageUrl = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: bucketName,
            Key: image.image_key,
          }),
          { expiresIn: 36000 }
        );
      }
      res.json(data[0]);
    } catch (error) {
      console.log(error);
      res.json({
        status: "error",
      });
    }
  },
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        "SELECT p.item_id,p.description,p.condition,p.category_id FROM items p where item_id = ?",
        [id]
      );
      const categoryId = result[0][0]?.category_id;
      console.log(categoryId)
      const category = await pool.query(
        `select * from categories where category_id=?`,
        [categoryId]
      );
      const images = await pool.query(
        "SELECT i.image_id,i.image_key FROM images i where item_id = ?",
        [id]
      );
      data = result[0];
      for (let image of images[0]) {
        image.imageUrl = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: bucketName,
            Key: image.image_key,
          }),
          { expiresIn: 36000 }
        );
      }
      res.json({
        data: result[0],
        category: category[0][0],
        images: images[0],
      });
    } catch (error) {
      console.log(error);
      res.json({
        status: "error",
      });
    }
  },
  getByUid: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query("CALL PostToCard(?);", [id]);
      data = result[0];
      for (let image of data[0]) {
        image.imageUrl = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: bucketName,
            Key: image.image_key,
          }),
          { expiresIn: 36000 }
        );
      }
      res.json(data[0]);
    } catch (error) {
      console.log(error);
      res.json({
        status: "error",
      });
    }
  },
  create: async (req, res) => {
    try {
      const { uid, name, description, condition, category_id } = req.body;
      const images = req.files; // Extract uploaded images from the request
      const create_at = new Date()
      // Insert post data into the posts table
      // INSERT INTO `main_app`.`items` (`user_id`, `name`, `description`, `category_id`, `condition`, `create_at`) VALUES ('1', 'PostManItems', 'Postman is an API platform for building and using APIs. Postman simplifies each step of the API lifecycle and streamlines collaboration so you can create better APIs—faster.', '1', 'Find Me a Better One', '2023-11-10 21:28:43');
      const [postRows] = await pool.query(
        "INSERT INTO items (`user_id`, `name`, `description`, `category_id`, `condition`, `create_at`) VALUES (?, ?, ?, ?, ?, ?)",
        [uid, name, description, category_id, condition, create_at]
      );

      const postId = postRows.insertId;

      // Insert image paths into the images table
      
        for (const image of images) {
          const fileBuffer = await sharp(image.buffer)
            .resize({ height: 1920, width: 1080, fit: "contain" })
            .toBuffer();
  
          const fileName = generateFileName();
          const uploadParams = {
            Bucket: bucketName,
            Body: fileBuffer,
            Key: fileName,
            ContentType: image.mimetype,
          };
  
          await s3Client.send(new PutObjectCommand(uploadParams));
  
          await pool.query(
            "INSERT INTO images (item_id, image_key) VALUES (?, ?)",
            [postId, fileName]
          );
        }
      res.json({
        status: "success",
        message: "File uploaded successfully",
      });
      // res.json({ message: 'Images uploaded successfully', files: req.files });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "error",
        message: "Error creating post with images",
        error: error.message, // Add the error message for debugging
      });
    }
  },

  update: async (req, res) => {
    try {
      const { content } = req.body;
      const { id } = req.params;
      const sql = "update items set content = ? where item_id = ?";
      const [rows, fields] = await pool.query(sql, [content, id]);
      res.json({
        status: "success",
        message: "Post Updated",
      });
    } catch (error) {
      console.log(error);
      res.json({
        status: "error",
      });
    }
  },
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const images = await pool.query(
        "SELECT * FROM images where item_id = ?",
        [id]
      );

      for (let image of images[0]) {
        const deleteParams = {
          Bucket: bucketName,
          Key: image.image_key,
        };
        await s3Client.send(new DeleteObjectCommand(deleteParams));
      }
      await pool.query("CALL DeletePost(?);", [id]);
      res.json({
        status: "success",
        message: "Post Deleted",
      });
    } catch (error) {
      console.log(error);
      res.json({
        status: "error",
      });
    }
  },
};

module.exports = postsController;
