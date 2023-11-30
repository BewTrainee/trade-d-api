const pool = require("../database/index")
const sharp = require("sharp");
const crypto = require("crypto");
const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
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

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const offerController = {
    getAllOffers: async (req, res) => {
        try {
            let {item_id} = req.params
            let [result,row] = await pool.query(`
            SELECT 
            f.offer_id,
            f.item_id,
            f.wisher_id,
            u.name,
            u.profile,
            f.condition,
            f.preview_image,
            f.create_at
            FROM offers as f LEFT JOIN users as u ON f.wisher_id = u.user_id WHERE f.item_id = ?`,[item_id])
            res.json(result)
        } catch (error) {
            res.json({error: error.message})
        }
    },
    createNewOffer: async (req, res) => {
        try {
          const {
            user_offer_id,
            to_item_id,
            item_name,
            offer_to_userId,
            condition,
            offer_message,
          } = req.body;
          const images = req.files;
          const create_at = new Date();
      
          await pool.query(
            `INSERT INTO chats (sender_id,receiver_id,message_text,timestamp,type) 
            values (?, ?, ?, 'ฉันสนใจ ${item_name} ของคุณ ${offer_message}', 'text')`,
            [user_offer_id, offer_to_userId, create_at]
          );
      
          const uploadedImageUrls = [];
      
          for (const image of images) {
            const fileBuffer = await sharp(image.buffer)
              .resize({ height: 640, width: 320, fit: "contain" })
              .toBuffer();
      
            const fileName = generateFileName();
            const uploadParams = {
              Bucket: bucketName,
              Body: fileBuffer,
              Key: fileName,
              ContentType: image.mimetype,
            };
      
            await s3Client.send(new PutObjectCommand(uploadParams));
      
            const imageUrl = `https://trade-d-bucket.s3.ap-southeast-1.amazonaws.com/${fileName}`;
            uploadedImageUrls.push(imageUrl);
      
            await pool.query(
              `INSERT INTO chats (sender_id,receiver_id,message_text,timestamp,type) 
              values (?, ?, ?, ?, 'image')`,
              [user_offer_id, offer_to_userId, imageUrl, create_at]
            );
          }
      
          const firstImage = uploadedImageUrls[0]; // Use the first uploaded image URL as the preview image
          const Insert_Offer = await pool.query(
            'insert into offers (item_id, wisher_id, user_offer_id, `condition`, preview_image,create_at) values (?,?,?,?,?,?)',
            [
              to_item_id,
              user_offer_id,
              offer_to_userId,
              condition,
              firstImage,
              create_at,
            ]
          );
      
          res.json({
            status: "success",
            message: "File uploaded successfully",
          });
        } catch (error) {
          res.status(400).json({
            message: "Error creating offer",
            error: error.message,
          });
        }
      },
    UpdatePostStatus: async (req,res) => {
        try {
            AllowStatus = ["pending","Complete","Cancel"]
            const {item_id, status} = req.body
            if (!AllowStatus.includes(status)){
                return res.status(400).json({
                    status: "error",
                    message: "Invalid status.",
                });
            }
            await pool.query("UPDATE items SET status = ? WHERE item_id = ?",[status,item_id])
            res.status(201).json({ message: 'Successfully updated the post status.'});
        } catch (error) {
            console.log(error) 
            res.json({error: error.message})
        }
    },
    testGetImage: async (req,res) => {
        try {
            [firstImage] = await pool.query(`SELECT * from chats WHERE sender_id = 1 AND receiver_id = 2 AND type = 'image' LIMIT 1`)
            res.json({ImageUrl:firstImage[0].message_text})
        } catch (error) {
            console.log(error)
            res.json({
                error: error.message
            })
        }
    }
}

module.exports = offerController;