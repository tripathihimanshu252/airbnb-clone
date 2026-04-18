const express = require('express');
const router = express.Router();
const Listing = require('../../models/listing');
const { validateBody } = require('../../utils/validate');
const { listingCreateSchema, listingUpdateSchema } = require('../../utils/schemas');
const { upload, uploadToCloudinary } = require('../../middleware/upload');

// GET /api/listings
// Supports query: search, location, country, minPrice, maxPrice, page, limit
router.get('/', async (req, res) => {
  try {
    const {
      search,
      location,
      country,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [{ title: re }, { description: re }, { location: re }];
    }
    if (location) filter.location = location;
    if (country) filter.country = country;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Listing.countDocuments(filter);
    const listings = await Listing.find(filter).skip(skip).limit(Number(limit));

    res.json({ total, page: Number(page), limit: Number(limit), listings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// GET /api/listings/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json({ listing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// POST /api/listings (JSON)
router.post('/', validateBody(listingCreateSchema), async (req, res) => {
  const newListing = new Listing(req.body);
  await newListing.save();
  res.status(201).json({ listing: newListing });
});

// POST /api/listings/upload (multipart/form-data) - with single image file field 'image'
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, location, country } = req.body;
    if (!title || !price) return res.status(400).json({ error: 'Missing required fields' });
    const listing = new Listing({ title, description, price: Number(price), location, country });
    if (req.file && req.file.buffer) {
      const result = await uploadToCloudinary(req.file.buffer, 'airbnb_clone/listings');
      listing.images.push({ filename: req.file.originalname, url: result.secure_url });
    }
    await listing.save();
    res.status(201).json({ listing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
});

// POST /api/listings/upload-multiple (real multi-file Cloudinary upload)
router.post('/upload-multiple', upload.array('images', 8), async (req, res) => {
  try {
    const { title, description, price, location, country } = req.body;
    if (!title || !price) return res.status(400).json({ error: 'Missing required fields' });
    const listing = new Listing({ title, description, price: Number(price), location, country });
    if (req.files && req.files.length) {
      for (const f of req.files) {
        if (f && f.buffer) {
          const result = await uploadToCloudinary(f.buffer, 'airbnb_clone/listings');
          listing.images.push({ filename: f.originalname, url: result.secure_url });
        }
      }
    }
    await listing.save();
    res.status(201).json({ listing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
});

// POST /api/listings/upload-mock - mocked upload for local testing (no Cloudinary)
router.post('/upload-mock', upload.array('images', 8), async (req, res) => {
  try {
    const { title, description, price, location, country } = req.body;
    if (!title || !price) return res.status(400).json({ error: 'Missing required fields' });
    const listing = new Listing({ title, description, price: Number(price), location, country });
    const files = req.files || [];
    // simulate upload delay proportional to files
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    await delay(300 * files.length || 200);
    files.forEach((f, i) => {
      // create predictable placeholder images (picsum) using seed
      const seed = encodeURIComponent((f.originalname || 'img') + '-' + Date.now() + '-' + i);
      const url = `https://picsum.photos/seed/${seed}/800/500`;
      listing.images.push({ filename: f.originalname, url });
    });
    await listing.save();
    res.status(201).json({ listing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Mock upload failed', details: err.message });
  }
});

// PUT /api/listings/:id
router.put('/:id', validateBody(listingUpdateSchema), async (req, res) => {
  const { id } = req.params;
  const updated = await Listing.findByIdAndUpdate(id, req.body, { new: true });
  if (!updated) return res.status(404).json({ error: 'Listing not found' });
  res.json({ listing: updated });
});

// DELETE /api/listings/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await Listing.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ error: 'Listing not found' });
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

module.exports = router;
