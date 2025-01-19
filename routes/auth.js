const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/user");
const router = express.Router();

// Register Route
router.post("/register", async (req, res) => {
  try {
    // Log the request body for debugging
    console.log("Registration request body:", req.body);

    const { name, email, password, isAdmin } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Please provide all required fields: name, email, and password",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already registered with this email.",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false,
    });

    // Save user to database
    await user.save();
    console.log("User saved successfully:", user._id);

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET || "your-secret-key-here",
      { expiresIn: "1h" }
    );

    // Send success response
    res.status(201).json({
      token,
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Error registering user.",
      error: error.message,
    });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    // Log the request body for debugging
    console.log("Login request body:", req.body);

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide both email and password",
      });
    }

    // Find user by email
    console.log("Before checking if user exists...");
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found. Please register.",
      });
    }
    console.log("After checking if user exists...");

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({
        message: "Invalid email or password.",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET || "your-secret-key-here",
      { expiresIn: "1h" }
    );

    // Send success response
    res.json({
      token,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Error during login.",
      error: error.message,
    });
  }
});

// Test database connection route
router.get("/test-db", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude password field
    res.json({
      message: "Database connection successful",
      userCount: users.length,
    });
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({
      message: "Database connection error.",
      error: error.message,
    });
  }
});

module.exports = router;
