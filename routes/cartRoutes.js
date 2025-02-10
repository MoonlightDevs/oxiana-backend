const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const authenticate = require("../middleware/authenticate").ensureAuthenticated;
const { authorizeCart } = require("../middleware/authorize/authorizeCart");
const validateId = require("../middleware/validateId");
const sessionMiddleware = require("../middleware/varifyToken");

router.get("/", cartController.getCart);
router.post("/", cartController.createCart);
router.delete("/", cartController.deleteCart);
router.post("/items", cartController.addItem);
router.put("/:itemId/items", cartController.updateItemQuantity);
router.delete("/:itemId/items", cartController.removeItem);
router.delete("/items", cartController.clearItems);

module.exports = router;
