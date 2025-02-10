const express = require("express");
const multer = require("../config/multer");
const router = express.Router();
const imageContoller = require("../controllers/imageContoller");

router.post("/", multer.single("image"), imageContoller.createImage);
router.get("/", imageContoller.getImages);
router.get("/:id", imageContoller.getImageById);
router.put("/:id", imageContoller.updateImage);
router.delete("/:id", imageContoller.deleteImage);

module.exports = router;
