const express = require('express');
const router = express.Router();
const Booking = require('../../models/booking');
const Listing = require('../../models/listing');
const { authRequired } = require('../../middleware/auth');
const { validateBody } = require('../../utils/validate');
const { bookingCreateSchema } = require('../../utils/schemas');

// All booking routes require auth
router.use(authRequired);

// GET /api/bookings - list bookings for current user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ user: userId }).populate('listing');
    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list bookings' });
  }
});

// POST /api/bookings - create a booking
router.post('/', validateBody(bookingCreateSchema), async (req, res) => {
  const userId = req.user.id;
  const { listingId, startDate, endDate, totalPrice } = req.body;
  const listing = await Listing.findById(listingId);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  const booking = new Booking({ user: userId, listing: listingId, startDate, endDate, totalPrice });
  await booking.save();
  res.status(201).json({ booking });
});

// GET /api/bookings/:id - get booking if owner
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const booking = await Booking.findById(req.params.id).populate('listing');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.user.toString() !== userId) return res.status(403).json({ error: 'Forbidden' });
    res.json({ booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// DELETE /api/bookings/:id - cancel booking if owner
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.user.toString() !== userId) return res.status(403).json({ error: 'Forbidden' });
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

module.exports = router;
