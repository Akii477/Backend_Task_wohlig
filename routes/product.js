const express = require("express");
const router = express.Router();
const multer = require("multer");
const Product = require("../models/product");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Add a new product
router.post("/", [auth, admin, upload.single("image")], async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      image: req.file.path,
    });

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a product
router.put("/:id", [auth, admin, upload.single("image")], async (req, res) => {
  try {
    const productData = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
    };

    if (req.file) {
      productData.image = req.file.path;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a product
router.delete("/:id", [auth, admin], async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id); // Changed from findByIdAndRemove to findByIdAndDelete
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
