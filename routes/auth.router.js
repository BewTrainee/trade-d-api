const express = require("express")
const router = express.Router()

const authController = require("../controller/auth.controller")

router.post("/register", authController.register)
router.post("/login", authController.login)
router.post("/forget", authController.ForgetPasswordEmailCheck)
router.post("/changePass", authController.ChangePassword)

module.exports = router