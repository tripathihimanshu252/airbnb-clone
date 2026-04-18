const mongoose = require("mongoose");
const Listing = require("../models/listing");
const { data } = require("../data/sampleListings");
require("dotenv").config();

mongoose.connect(process.env.DB_URL || "mongodb://127.0.0.1:27017/airbnbClone", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

const seedDB = async () => {
  await Listing.deleteMany({});
  await Listing.insertMany(data);
  console.log("Database seeded!");
};

seedDB().then(() => mongoose.connection.close());
