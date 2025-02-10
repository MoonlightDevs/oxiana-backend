// server.js
const app = require("./app"); // Import the app object
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
