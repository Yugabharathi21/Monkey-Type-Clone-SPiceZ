// Minimal server test - Run this locally to verify basic functionality
const express = require('express');
const app = express();

console.log('🧪 Testing minimal server...');

// Basic middleware
app.use(express.json());

// Test route
app.get('/api/health', (req, res) => {
  console.log('📍 Health endpoint hit');
  res.json({ status: 'OK', message: 'Minimal server working' });
});

// Test user route
app.post('/api/users/login', (req, res) => {
  console.log('📍 Login endpoint hit');
  res.json({ message: 'Login endpoint working' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
  console.log('📋 Available routes:');
  console.log('  GET  /api/health');
  console.log('  POST /api/users/login');
});

// Test the routes locally
setTimeout(() => {
  console.log('\n🧪 Testing local endpoints...');
  
  // Test health
  fetch(`http://localhost:${PORT}/api/health`)
    .then(r => r.json())
    .then(data => console.log('✅ Health test:', data))
    .catch(err => console.log('❌ Health test failed:', err.message));
    
  // Test login
  fetch(`http://localhost:${PORT}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login: 'test', password: 'test' })
  })
    .then(r => r.json())
    .then(data => console.log('✅ Login test:', data))
    .catch(err => console.log('❌ Login test failed:', err.message));
    
}, 2000);
