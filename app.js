const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const app = express();
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost/ecommerce")
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB...", err));
  
// Middleware order is important
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/public", express.static(path.join(__dirname, "public")));

// Routes
app.use("/auth", authRoutes);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});
app.use("/product", productRoutes);
app.use(cors());

// Serve static files
app.use(express.static("views"));

// Listen on port 3000
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
