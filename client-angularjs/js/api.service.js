let AUTH_API = 'http://localhost:3000';
let USER_API = 'http://localhost:3001';

const hostname = window.location.hostname;

// Test Environment on Railway
if (hostname.includes('test') || hostname.includes('dev')) {
  AUTH_API = 'https://auth-service-test.up.railway.app';
  USER_API = 'https://user-service-test.up.railway.app';
}
// Live Environment (Custom domain or non-localhost)
else if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
  AUTH_API = 'https://auth-service-live.up.railway.app';
  USER_API = 'https://user-service-live.up.railway.app';
}