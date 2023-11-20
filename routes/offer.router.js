const express = require("express")
const router = express.Router()
const multer = require('multer');

const storage = multer.memoryStorage()
const upload = multer({ storage:storage })

const offerController = require("../controller/offer.controller")
router.get("/getOffers/:item_id",offerController.getAllOffers)
// router.get("/testGetImage",offerController.testGetImage) //เส้นทดสอบ
router.put("/updateStatus",offerController.UpdatePostStatus)
router.put("/createOffer", upload.array('images') ,offerController.createNewOffer)

module.exports = router