const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/user');
const { validateBody } = require('../../utils/validate');
const { registerSchema, loginSchema } = require('../../utils/schemas');

const jwtSecret = process.env.JWT_SECRET || 'change_this_secret_in_env';

// POST /api/auth/register
router.post('/register', validateBody(registerSchema), async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const user = new User({ name, email, password: hash });
  await user.save();
  const token = jwt.sign({ id: user._id, email: user.email }, jwtSecret, { expiresIn: '2h' });
  res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
});

// POST /api/auth/login
router.post('/login', validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, email: user.email }, jwtSecret, { expiresIn: '2h' });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
});

module.exports = router;
