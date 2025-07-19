// Test if all backend modules can be loaded
console.log('🧪 Testing backend module loading...');

try {
  console.log('📦 Testing core modules...');
  const express = require('express');
  const mongoose = require('mongoose');
  const cors = require('cors');
  const helmet = require('helmet');
  const rateLimit = require('express-rate-limit');
  console.log('✅ Core modules loaded');

  console.log('📦 Testing route modules...');
  const userRoutes = require('./routes/userRoutes');
  console.log('✅ userRoutes loaded');
  
  const testRoutes = require('./routes/testRoutes');
  console.log('✅ testRoutes loaded');
  
  const statsRoutes = require('./routes/statsRoutes');
  console.log('✅ statsRoutes loaded');
  
  const leaderboardRoutes = require('./routes/leaderboardRoutes');
  console.log('✅ leaderboardRoutes loaded');
  
  const adminRoutes = require('./routes/adminRoutes');
  console.log('✅ adminRoutes loaded');

  console.log('📦 Testing models...');
  const User = require('./models/User');
  console.log('✅ User model loaded');

  console.log('📦 Testing middleware...');
  const { auth } = require('./middleware/auth');
  console.log('✅ auth middleware loaded');

  console.log('\n🎉 All modules loaded successfully!');
  console.log('📋 The issue is likely with Render deployment, not the code.');

} catch (error) {
  console.error('❌ Module loading failed:', error);
  console.log('\n🔧 Fix this error and redeploy to Render');
}

// Test environment variables
console.log('\n🔧 Environment Variables Check:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('PORT:', process.env.PORT || 'not set (will use 5000)');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'set' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'set' : 'NOT SET');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'not set');

if (!process.env.MONGODB_URI) {
  console.log('⚠️  WARNING: MONGODB_URI not set - server will fail to start');
}
if (!process.env.JWT_SECRET) {
  console.log('⚠️  WARNING: JWT_SECRET not set - authentication will fail');
}
