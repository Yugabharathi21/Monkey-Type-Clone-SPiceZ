const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Add logging middleware for debugging
router.use((req, res, next) => {
  console.log(`📨 User route: ${req.method} ${req.path} - Body:`, Object.keys(req.body || {}));
  next();
});

// Register user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'Username or email is already taken',
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      profile: profile || {},
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message,
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  console.log('🔐 Login attempt received:', req.body.login || 'no login provided');
  
  try {
    const { login, password } = req.body; // login can be username or email

    if (!login || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Please provide username/email and password',
      });
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { email: login.toLowerCase() },
        { username: login }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'User not found',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Incorrect password',
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'Login successful',
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error.message,
    });
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found',
      });
    }

    res.json({
      user,
      message: 'Profile retrieved successfully',
    });
  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve profile',
      message: error.message,
    });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { profile, preferences } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found',
      });
    }

    // Update profile fields
    if (profile) {
      Object.keys(profile).forEach(key => {
        if (profile[key] !== undefined) {
          user.profile[key] = profile[key];
        }
      });
    }

    // Update preferences
    if (preferences) {
      Object.keys(preferences).forEach(key => {
        if (preferences[key] !== undefined) {
          user.preferences[key] = preferences[key];
        }
      });
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message,
    });
  }
});

// Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found',
      });
    }

    res.json({
      stats: user.stats,
      achievements: user.achievements,
      message: 'Statistics retrieved successfully',
    });
  } catch (error) {
    console.error('Stats retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve statistics',
      message: error.message,
    });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Missing passwords',
        message: 'Please provide current and new passwords',
      });
    }

    const user = await User.findById(req.userId).select('+password');
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found',
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      error: 'Failed to change password',
      message: error.message,
    });
  }
});

// Delete account
router.delete('/account', auth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        error: 'Password required',
        message: 'Please provide your password to delete account',
      });
    }

    const user = await User.findById(req.userId).select('+password');
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found',
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Password is incorrect',
      });
    }

    // Soft delete - mark as inactive
    user.isActive = false;
    await user.save();

    res.json({
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({
      error: 'Failed to delete account',
      message: error.message,
    });
  }
});

// Verify token
router.get('/verify-token', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'User not found or inactive',
      });
    }

    res.json({
      valid: true,
      user,
      message: 'Token is valid',
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      error: 'Invalid token',
      message: error.message,
    });
  }
});

module.exports = router;
