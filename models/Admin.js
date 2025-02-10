const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		enum: ["superadmin", "admin"],
		default: "admin",
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

// Hash password before saving
adminSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

// Method to validate password
adminSchema.methods.isValidPassword = async function (password) {
	return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Admin", adminSchema);
