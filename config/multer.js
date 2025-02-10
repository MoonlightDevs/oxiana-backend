const multer = require("multer");

// Configure Multer to use memory storage (no local storage)
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
