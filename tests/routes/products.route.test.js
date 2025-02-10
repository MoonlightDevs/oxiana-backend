const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app"); // Your Express app

// Mock Models
const Product = require("../../models/Product");
const Category = require("../../models/Category");
const Order = require("../../models/Order");

// Mock dependencies
jest.mock("../../models/Product");
jest.mock("../../models/Category");
jest.mock("../../models/Order");

beforeEach(() => {
	jest.clearAllMocks(); // Reset mocks before each test
});

afterAll(() => {
	mongoose.connection.close(); // Close DB connection if opened
});
