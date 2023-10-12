const express = require("express")
const router = express.Router()

const userController = require("../controller/user.controller")

router.get("/:id", userController.getById)
// router.post("/login", userController.login)

module.exports = router