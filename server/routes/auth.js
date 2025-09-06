const express = require("express");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const { registerUser, loginUser, logoutUser, getUserProfile } = require("../controllers/authController");

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Logout
router.post('/logout', protect, logoutUser);

// Get user profile
router.get("/profile", protect, getUserProfile);

module.exports = router;