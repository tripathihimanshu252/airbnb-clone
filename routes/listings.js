const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const { upload, uploadToCloudinary } = require('../middleware/upload');
const { data } = require("../data/sampleListings");

// Seed database (optional)
router.get("/seed", async (req, res) => {
  await Listing.deleteMany({});
  await Listing.insertMany(data);
  res.send("Database seeded with sample listings!");
});

// Index - show all listings
router.get("/", async (req, res) => {
  const listings = await Listing.find({});
  res.render("listings/index", { listings });
});

// New form
router.get("/new", (req, res) => {
  res.render("listings/new");
});

// Create listing (supports multiple image uploads)
router.post("/", upload.array('images', 8), async (req, res) => {
  try {
    const listingData = (req.body && req.body.listing) ? req.body.listing : {};
    const newListing = new Listing(listingData);
    if (req.files && req.files.length) {
      for (const f of req.files) {
        if (f && f.buffer) {
          const result = await uploadToCloudinary(f.buffer, 'airbnb_clone/listings');
          newListing.images.push({ filename: f.originalname, url: result.secure_url });
        }
      }
    }
    await newListing.save();
    res.redirect(`/listings/${newListing._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to create listing');
  }
});

// For routes that accept an ID, only match 24-char hex ObjectIds
// Show single listing
router.get("/:id([0-9a-fA-F]{24})", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show", { listing });
});

// Edit form
router.get("/:id([0-9a-fA-F]{24})/edit", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit", { listing });
});

// Update listing
router.put("/:id([0-9a-fA-F]{24})", async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, req.body.listing);
  res.redirect(`/listings/${id}`);
});

// Delete listing
router.delete("/:id([0-9a-fA-F]{24})", async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
});

module.exports = router;
