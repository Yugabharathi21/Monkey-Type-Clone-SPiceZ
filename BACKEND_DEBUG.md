# Backend Issues Debugging Guide

## 🔧 Issues Fixed:

### 1. Mongoose Warnings ✅
- Removed deprecated `useNewUrlParser` and `useUnifiedTopology` options
- Removed duplicate index definitions for username and email fields

### 2. Enhanced CORS Debugging 🔍
- Made CORS more permissive for debugging
- Added detailed logging for CORS origin checks
- Improved 404 handler with proper CORS headers

### 3. Added Route Debugging 📋
- Added logging for route registration
- Added logging in userRoutes middleware
- Added test endpoint at `/api/test`

## 🧪 Testing Steps:

### Step 1: Test Health Endpoint
```bash
curl -v https://monkey-type-clone-spicez.onrender.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Typing Test API is running",
  "timestamp": "2025-07-19T...",
  "cors": {
    "origin": null,
    "allowedOrigins": [...]
  }
}
```

### Step 2: Test CORS with Browser
Open browser console and run:
```javascript
fetch('https://monkey-type-clone-spicez.onrender.com/api/test', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('Status:', response.status);
  console.log('Headers:', Object.fromEntries(response.headers.entries()));
  return response.json();
})
.then(data => console.log('Data:', data))
.catch(error => console.error('Error:', error));
```

### Step 3: Test Login Endpoint Structure
```javascript
fetch('https://monkey-type-clone-spicez.onrender.com/api/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    login: 'test@example.com',
    password: 'wrongpassword'
  })
})
.then(response => {
  console.log('Login Status:', response.status);
  console.log('CORS Headers:', response.headers.get('Access-Control-Allow-Origin'));
  return response.text();
})
.then(text => console.log('Response:', text))
.catch(error => console.error('Login Error:', error));
```

## 🔍 What to Look For:

### In Render Logs:
1. **Route Registration**: Look for "📋 Registering API routes..." messages
2. **CORS Checks**: Look for "🌐 CORS check - Origin:" messages  
3. **User Route Logs**: Look for "📨 User route:" messages
4. **404 Errors**: Check if routes are actually being found

### Expected Log Pattern:
```
📋 Registering API routes...
✅ Registered: /api/users/*
✅ Registered: /api/tests/*
...
🌐 CORS check - Origin: https://monkey-type-clone-s-pice-z.vercel.app
✅ CORS: Allowing origin: https://monkey-type-clone-s-pice-z.vercel.app
📨 User route: POST /login - Body: ['login', 'password']
🔐 Login attempt received: test@example.com
```

## 🚨 Common Issues:

### Issue 1: Routes Not Registering
**Symptoms**: All API calls return 404
**Check**: Look for route registration logs in Render
**Fix**: Ensure all route files are properly exported

### Issue 2: CORS Headers Missing in 404
**Symptoms**: 404 with missing CORS headers
**Check**: Look at the 404 handler response
**Fix**: Updated 404 handler should now include proper CORS headers

### Issue 3: Route Path Mismatch
**Symptoms**: Specific routes return 404
**Check**: Verify the exact URL being called vs registered routes
**Fix**: Ensure frontend is calling correct endpoints

## 🔄 Next Actions:

1. **Deploy Updated Backend**: Push these changes to Render
2. **Check Render Logs**: Look for the new logging messages
3. **Test Endpoints**: Use the test scripts above
4. **Report Results**: Share what you see in the logs

## 📝 Debug Commands:

```bash
# Test from command line
curl -X POST https://monkey-type-clone-spicez.onrender.com/api/users/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://monkey-type-clone-s-pice-z.vercel.app" \
  -d '{"login":"test","password":"test"}' \
  -v

# Check if service is running
curl https://monkey-type-clone-spicez.onrender.com/api/health

# Test CORS preflight
curl -X OPTIONS https://monkey-type-clone-spicez.onrender.com/api/users/login \
  -H "Origin: https://monkey-type-clone-s-pice-z.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```
