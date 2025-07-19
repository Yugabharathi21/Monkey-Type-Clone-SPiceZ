// Quick MongoDB Connection Test
// Run this to verify your MONGODB_URI format

const mongoose = require('mongoose');

// Example MONGODB_URI format (replace with your actual values):
const exampleURI = 'mongodb+srv://username:password@cluster0.abcde.mongodb.net/typemonkey?retryWrites=true&w=majority';

console.log('🔍 MongoDB URI Format Validator');
console.log('================================');

function validateMongoURI(uri) {
    console.log('\n📋 Checking URI format...');
    
    // Basic format check
    if (!uri.startsWith('mongodb+srv://')) {
        console.log('❌ URI should start with mongodb+srv://');
        return false;
    }
    
    // Check for required components
    const components = {
        username: uri.includes('@') && uri.split('@')[0].includes(':'),
        cluster: uri.includes('.mongodb.net'),
        database: uri.includes('/') && uri.split('/').pop().includes('?') ? uri.split('/').pop().split('?')[0] : uri.split('/').pop(),
        retryWrites: uri.includes('retryWrites=true'),
        writeConcern: uri.includes('w=majority')
    };
    
    console.log('\n🔍 URI Components:');
    Object.entries(components).forEach(([key, value]) => {
        console.log(`${value ? '✅' : '❌'} ${key}: ${value || 'missing'}`);
    });
    
    return Object.values(components).every(Boolean);
}

console.log('📝 Example URI format:');
console.log(exampleURI);

console.log('\n🎯 Your URI should look like:');
console.log('mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/typemonkey?retryWrites=true&w=majority');

console.log('\n⚠️  Important notes:');
console.log('1. Replace YOUR_USERNAME with your MongoDB Atlas username');
console.log('2. Replace YOUR_PASSWORD with your MongoDB Atlas password');
console.log('3. Replace YOUR_CLUSTER with your cluster name (found in Atlas dashboard)');
console.log('4. Database name should be "typemonkey"');
console.log('5. URL encode special characters in password (e.g., @ becomes %40)');

// Test example URI
validateMongoURI(exampleURI);

console.log('\n🚀 To test your actual URI in Render:');
console.log('1. Set MONGODB_URI environment variable in Render');
console.log('2. Deploy the service');
console.log('3. Check logs for connection success/failure');
