const express = require("express");
const { ensureAuthenticated } = require("../middleware/authenticate");
const {
	authorizeCustomer,
} = require("../middleware/authorize/authorizeCustomer");
const validateId = require("../middleware/validateId");
const router = express.Router();
const {
	updateProfile,
	viewProfile,
	deleteProfile,
} = require("../controllers/customerController");

router.get(
	"/:id/profile",
	validateId,
	ensureAuthenticated,
	authorizeCustomer,
	viewProfile
);
router.put(
	"/:id/profile/edit",
	validateId,
	ensureAuthenticated,
	authorizeCustomer,
	updateProfile
);
router.delete(
	"/:id/profile/edit",
	validateId,
	ensureAuthenticated,
	authorizeCustomer,
	deleteProfile
);

module.exports = router;
