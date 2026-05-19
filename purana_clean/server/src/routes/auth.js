import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { memory } from '../store/memoryStore.js';
import { isMongoReady, publicUser } from '../utils/mode.js';

export const authRouter = express.Router();

const jwtSecret = () => process.env.JWT_SECRET || 'purana-dev-secret';
const sign = (user) =>
  jwt.sign(publicUser(user), jwtSecret(), { expiresIn: '7d' });

authRouter.post('/signup', async (req, res) => {
  const { name, email, password, role, location, phone } = req.body;
  if (!name || !email || !password || !['buyer', 'seller'].includes(role))
    return res.status(400).json({ message: 'Name, email, password and valid role are required' });

  const normalizedEmail = email.toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);

  if (isMongoReady()) {
    if (await User.findOne({ email: normalizedEmail }))
      return res.status(409).json({ message: 'Email already registered' });
    const user = await User.create({ name, email: normalizedEmail, passwordHash, role, location, phone });
    return res.status(201).json({ token: sign(user), user: publicUser(user) });
  }

  if (memory.users.some((u) => u.email === normalizedEmail))
    return res.status(409).json({ message: 'Email already registered' });
  const user = { _id: `user-${Date.now()}`, name, email: normalizedEmail, passwordHash, role, location, phone };
  memory.users.push(user);
  return res.status(201).json({ token: sign(user), user: publicUser(user) });
});

authRouter.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  const normalizedEmail = email?.toLowerCase();
  const user = isMongoReady()
    ? await User.findOne({ email: normalizedEmail })
    : memory.users.find((u) => u.email === normalizedEmail);

  if (!user || user.role !== role || !(await bcrypt.compare(password || '', user.passwordHash)))
    return res.status(401).json({ message: 'Invalid credentials for selected role' });

  return res.json({ token: sign(user), user: publicUser(user) });
});

authRouter.post('/forgot-password', async (req, res) => {
  const { email, password, role } = req.body;
  const normalizedEmail = email?.toLowerCase();

  if (!normalizedEmail || !password || !['buyer', 'seller'].includes(role)) {
    return res.status(400).json({ message: 'Email, new password and role are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  if (isMongoReady()) {
    const user = await User.findOne({ email: normalizedEmail, role });
    if (!user) return res.status(404).json({ message: 'Account not found. Please register first.' });
    user.passwordHash = passwordHash;
    await user.save();
    return res.json({ message: 'Password updated. Login with your new password.' });
  }

  const user = memory.users.find((u) => u.email === normalizedEmail && u.role === role);
  if (!user) return res.status(404).json({ message: 'Account not found. Please register first.' });
  user.passwordHash = passwordHash;
  return res.json({ message: 'Password updated. Login with your new password.' });
});
