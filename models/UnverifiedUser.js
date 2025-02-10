const mongoose = require("mongoose");

const unverifiedUserSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	verificationToken: { type: String, required: true },
	verificationTokenExpires: { type: Date, required: true },
});

const UnverifiedUser = mongoose.model("UnverifiedUser", unverifiedUserSchema);
module.exports = UnverifiedUser;
