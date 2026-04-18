const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const listingRoutes = require("./routes/listings");
require("dotenv").config();
const ejsMate = require("ejs-mate");
require('express-async-errors');
const morgan = require("morgan");
const cors = require("cors");
const apiListingRoutes = require("./routes/api/listings");
const apiAuthRoutes = require("./routes/api/auth");
const apiBookingRoutes = require("./routes/api/bookings");

const app = express();

// Set EJS engine BEFORE using views
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MongoDB Connection
mongoose
  .connect(process.env.DB_URL || "mongodb://127.0.0.1:27017/airbnbClone")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// HTTP request logger
app.use(morgan("dev"));

// Log incoming request bodies for non-GET requests (dev only)
app.use((req, res, next) => {
  if (req.method !== "GET") {
    console.log("[req body]", req.method, req.originalUrl, req.body);
  }
  next();
});

// Allow cross-origin requests for API endpoints (adjust origin in production)
app.use("/api", cors());

// API routes (JSON)
app.use("/api/listings", apiListingRoutes);
app.use("/api/auth", apiAuthRoutes);
app.use("/api/bookings", apiBookingRoutes);

// Routes
app.use("/listings", listingRoutes);

// Home redirect
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// 404 catch-all route
app.use((req, res) => {
  res.status(404).render("error", { message: "Page Not Found" });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  if (req.path && req.path.startsWith('/api')) {
    return res.status(status).json({ error: err.message || 'Internal Server Error' });
  }
  return res.status(status).render('error', { message: err.message || 'Internal Server Error' });
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
