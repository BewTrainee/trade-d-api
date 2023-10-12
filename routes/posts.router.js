const express = require("express")
const router = express.Router()
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');

// const uploadDirectory = '/uploads';

// // Check if the upload directory exists; if not, create it
// // if (!fs.existsSync(uploadDirectory)) {
// //   fs.mkdirSync(uploadDirectory);
// // }

// // Define the storage for multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDirectory);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage: storage });

// Use the `upload` middleware with your routes

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: 'ap-southeast-1' // Your S3 bucket region
});

const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'trade-d-bucket',
    acl: 'public-read', // Your S3 bucket permissions
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + path.extname(file.originalname))
    }
  })
});

const postsController = require("../controller/posts.controller")
router.get("/", postsController.getAll)
router.get("/:id", postsController.getById)
router.get("/user_PTC/:id", postsController.getByUid)
router.post("/create",upload.array('images'), postsController.create)
router.put("/:id", postsController.update)
router.delete("/:id", postsController.delete)

module.exports = router