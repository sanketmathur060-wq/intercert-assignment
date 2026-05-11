// Fallbacks are handled entirely by generate-env.js in docker now!
const AUTH_API = window.ENV?.AUTH_API || 'http://localhost:3000';
const USER_API = window.ENV?.USER_API || 'http://localhost:3001';