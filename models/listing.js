const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  images: [
    {
      filename: String,
      url: String
    }
  ],
  rating: { type: Number, default: 0 },
  price: { type: Number, required: true },
  location: { type: String, default: '' },
  country: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Listing", ListingSchema);
