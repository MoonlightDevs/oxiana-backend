// routes/inventoryRoutes.js
const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");

router.post("/add", inventoryController.addInventory);
router.get("/product/:productId", inventoryController.getInventoryByProduct);
router.put("/product/:productId", inventoryController.updateInventoryQuantity);
router.get("/low-stock", inventoryController.getAllLowStockItems);

module.exports = router;
