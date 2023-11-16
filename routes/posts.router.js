const express = require("express")
const router = express.Router()
const multer = require('multer');

const storage = multer.memoryStorage()
const upload = multer({ storage:storage })


const postsController = require("../controller/posts.controller")
router.get("/", postsController.getAll)
router.get("/getAll", postsController.testGetAll)
router.get("/Category", postsController.getCategory)
router.get("/Category/:id", postsController.findCate)
router.get("/:id", postsController.getById)
router.get("/test/:id", postsController.testAPI)
router.get("/user_PTC/:id", postsController.getByUid)
router.put("/create", upload.array('images'), postsController.create)
router.put("/update/:id", postsController.update)
router.put("/updateImages/:id", upload.array('images'), postsController.updateImages)
router.delete("/:id", postsController.delete)
router.delete("/ImageDelete/:id/:key", postsController.ImageDelete)


//Logic ทำ Update Post ให้ลบทีละรูปแล้วยืนยันไปทีละอันจะได้ง่าย ส่วนของใหม่ก็สร้างตามปกติ
// หรือไม่ก็เอาชื่อเดิมของรูปมาอัพเดทแล้วโพส์ซ้ำไปเลย

module.exports = router