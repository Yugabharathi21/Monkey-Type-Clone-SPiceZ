// Quick test to verify routes are working
const express = require('express');
const app = express();

// Test if the userRoutes can be loaded
try {
  const userRoutes = require('./routes/userRoutes');
  console.log('✅ userRoutes loaded successfully');
  
  // Test if Express can register the routes
  app.use('/api/users', userRoutes);
  console.log('✅ userRoutes registered successfully');
  
  // List all registered routes
  console.log('\n📋 Registered routes:');
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      console.log(`  ${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const route = handler.route;
          const methods = Object.keys(route.methods).join(', ').toUpperCase();
          console.log(`  ${methods} /api/users${route.path}`);
        }
      });
    }
  });
  
} catch (error) {
  console.error('❌ Error loading routes:', error);
}

console.log('\n🧪 Testing individual route endpoints...');

// Test individual route functions
try {
  const userRoutes = require('./routes/userRoutes');
  const routes = [];
  
  // Extract routes from the router
  userRoutes.stack.forEach((layer) => {
    if (layer.route) {
      const route = layer.route;
      const methods = Object.keys(route.methods).join(', ').toUpperCase();
      routes.push(`${methods} /api/users${route.path}`);
    }
  });
  
  console.log('Available user routes:');
  routes.forEach(route => console.log(`  ${route}`));
  
} catch (error) {
  console.error('❌ Error analyzing routes:', error);
}
