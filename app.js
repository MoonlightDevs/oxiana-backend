const express = require("express");
const passport = require("passport");
const jwtMiddleware = require("./middleware/varifyToken");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Add cookie-parser middleware
// Importing route files
const categoryRoutes = require("./routes/categoryRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const shippingRoutes = require("./routes/shippingRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const customerRoutes = require("./routes/customerRoutes");
const productRoutes = require("./routes/productRoutes");
const imageRoutes = require("./routes/imageRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Set views directory
app.set("views", path.join(__dirname, "views"));

// Middlewares

// Logging middleware
app.use(morgan("combined"));

// Add cookie-parser before jwtMiddleware

// CORS middleware (make sure it's before the route handlers)
app.use(
	cors({
		origin: "http://localhost:3000",
		credentials: true,
	})
);
app.use(cookieParser());

// Body parsers
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Passport middleware (after session)
require("./config/passport")(passport);
app.use(passport.initialize());


// JWT Middleware should come after cookieParser
app.use(jwtMiddleware); // Ensure this is in the correct order
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/images", imageRoutes);
app.use("/api", uploadRoutes);

// Static file serving for simple frontend
app.get("/login", (req, res) => {
	res.sendFile(path.join(__dirname, "views/login.html"));
});
app.get("/register", (req, res) => {
	res.sendFile(path.join(__dirname, "views/register.html"));
});
app.get("/verify-email", (req, res) => {
	res.sendFile(path.join(__dirname, "views/verify-email.html"));
});

// Error handling middleware (at the end)
app.use(errorHandler);

module.exports = app;
