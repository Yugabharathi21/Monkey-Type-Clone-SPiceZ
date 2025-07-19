// Environment variables verification script
// Add this to your main.tsx temporarily to debug environment variables

console.log('🔧 Environment Variables Check:');
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('VITE_APP_NAME:', import.meta.env.VITE_APP_NAME);
console.log('VITE_APP_VERSION:', import.meta.env.VITE_APP_VERSION);
console.log('VITE_NODE_ENV:', import.meta.env.VITE_NODE_ENV);
console.log('MODE:', import.meta.env.MODE);
console.log('DEV:', import.meta.env.DEV);
console.log('PROD:', import.meta.env.PROD);

// Test API endpoint accessibility
if (import.meta.env.VITE_API_BASE_URL) {
  fetch(`${import.meta.env.VITE_API_BASE_URL}/health`)
    .then(response => {
      if (response.ok) {
        console.log('✅ Backend API is accessible');
        return response.json();
      } else {
        console.log('❌ Backend API responded with error:', response.status);
      }
    })
    .then(data => {
      if (data) {
        console.log('📊 Backend health check:', data);
      }
    })
    .catch(error => {
      console.log('❌ Backend API is not accessible:', error.message);
      console.log('🔍 Check your CORS settings and API URL');
    });
} else {
  console.log('❌ VITE_API_BASE_URL is not defined');
}

export {}; // Make this a module
