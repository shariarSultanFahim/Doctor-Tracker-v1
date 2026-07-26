import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { validate } from '../middleware/validate.js';
import { loginSchema } from '../validators/auth.validator.js';
import { updateProfileSchema } from '../validators/user.validator.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.post('/login', validate(loginSchema), async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
    return;
  }

  const secret = process.env.JWT_SECRET || 'super-secret-doctor-tracker-key-change-in-prod';
  const token = jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    secret,
    { expiresIn: '1d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      tablePreferences: user.tablePreferences || {},
      theme: user.theme || 'system',
      createdAt: user.createdAt,
    },
  });
});

router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user?.id).select('-passwordHash');
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }
  res.json({ success: true, data: user });
});

router.patch('/profile', authMiddleware, validate(updateProfileSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user?.id);
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  const { name, email, avatar, currentPassword, newPassword, tablePreferences, theme } = req.body;

  if (newPassword) {
    if (!currentPassword) {
      res.status(400).json({ success: false, error: 'Current password is required to set a new password' });
      return;
    }
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, error: 'Incorrect current password' });
      return;
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (avatar !== undefined) user.avatar = avatar;
  if (tablePreferences !== undefined) user.tablePreferences = tablePreferences;
  if (theme !== undefined) user.theme = theme;

  await user.save();

  const updatedUser = await User.findById(user._id).select('-passwordHash');
  res.json({ success: true, data: updatedUser });
});

export default router;
