const express = require("express")
const router = express.Router()
const multer = require('multer');

const storage = multer.memoryStorage()
const upload = multer({ storage:storage })

const userController = require("../controller/user.controller")

router.get("/:id", userController.getById)
router.get("/getStatus/:user_id", userController.getStatusCount)
router.put("/edit", userController.EditProfile)
router.put("/EditProfile", upload.array('image'), userController.EditFullProfile)

module.exports = router