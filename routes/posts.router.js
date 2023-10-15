const express = require("express")
const router = express.Router()
const multer = require('multer');

const storage = multer.memoryStorage()
const upload = multer({ storage:storage })


const postsController = require("../controller/posts.controller")
router.get("/", postsController.getAll)
router.get("/:id", postsController.getById)
router.get("/user_PTC/:id", postsController.getByUid)
router.put("/create", upload.array('images'), postsController.create)
router.put("/update/:id", postsController.update)
router.delete("/:id", postsController.delete)

router.put("/upload", upload.array('images'), async (req, res) => {
  try {
    const { uid, content } = req.body;
    const images = req.files; // Extract uploaded images from the request

    // Insert post data into the posts table
    const [postRows] = await pool.query(
      'INSERT INTO posts (uid, content, create_at) VALUES (?, ?, NOW())',
      [uid, content]
    );

    const postId = postRows.insertId;

    // Insert image paths into the images table
    for (const image of images) {
      
      const fileBuffer = await sharp(image.buffer)
      .resize({height: 1920, width: 1080, fit: "contain"}).toBuffer()

      const fileName = generateFileName()
      const imagePath = `https://trade-d-bucket.s3.ap-southeast-1.amazonaws.com/${fileName}`; // Adjust the URL as needed
      const uploadParams = {
        Bucket: bucketName,
        Body: fileBuffer,
        Key: fileName,
        ContentType: image.mimetype
      }

      await s3Client.send(new PutObjectCommand(uploadParams))

      await pool.query(
        'INSERT INTO images (post_id, image_path) VALUES (?, ?)',
        [postId, imagePath]
      );
    }

    res.json({
      status: 'success',
      message: 'File uploaded successfully',
    });
    // res.json({ message: 'Images uploaded successfully', files: req.files });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating post with images',
      error: error.message, // Add the error message for debugging
    });
  }
});


module.exports = router