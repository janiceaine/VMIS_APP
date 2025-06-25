// Configuration for different environments
const CONFIG = {
    development: {
        API_BASE_URL: 'http://localhost:5001',
        CAR_API_BASE_URL: 'https://api.api-ninjas.com/v1/cars',
        CAR_API_KEY: 'ccMkKIb/Hi2DVRxw3jaMUQ==lGqgW96NZkxJKlm5'
    },
    production: {
        // Update this with your deployed backend URL from Render
        // Format: https://your-service-name.onrender.com
        API_BASE_URL: 'https://vmis-backend.onrender.com',
        CAR_API_BASE_URL: 'https://api.api-ninjas.com/v1/cars',
        CAR_API_KEY: 'ccMkKIb/Hi2DVRxw3jaMUQ==lGqgW96NZkxJKlm5'
    }
};

// Check for environment override (useful for testing)
const forceEnvironment = localStorage.getItem('forceEnvironment');

// Auto-detect environment or use override
const ENVIRONMENT = forceEnvironment || (window.location.hostname === 'localhost' ? 'development' : 'production');

// Export the current configuration
const ENV_CONFIG = CONFIG[ENVIRONMENT];

console.log(`Running in ${ENVIRONMENT} mode`);
console.log('API Base URL:', ENV_CONFIG.API_BASE_URL);
