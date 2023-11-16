const express = require("express")
const router = express.Router()

const userController = require("../controller/user.controller")

router.get("/:id", userController.getById)
router.put("/edit", userController.EditProfile)

module.exports = router