// Simple API Configuration
const API_BASE_URL = 'http://localhost:5001';

// Car API Configuration
const CAR_API_BASE_URL = 'https://api.api-ninjas.com/v1/cars';
const CAR_API_KEY = 'ccMkKIb/Hi2DVRxw3jaMUQ==lGqgW96NZkxJKlm5';

function getApiUrl() {
    console.log('Using API URL:', API_BASE_URL);
    return API_BASE_URL;
}

// Global state
let currentUser = null;
let vehicleRecords = [];

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    initializeApp();
    
    // Set up event listeners after a short delay to ensure DOM is ready
    setTimeout(() => {
        console.log('Setting up event listeners...');
        setupEventListeners();
    }, 200);
});

function initializeApp() {
    console.log('Initializing VMIS app...');
    
    // Always show landing page first to ensure it's visible
    showLandingPage();
    
    // Then check authentication status
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('Auth check:', { 
        hasToken: !!token, 
        hasUser: !!user 
    });
    
    if (token && user) {
        try {
            currentUser = JSON.parse(user);
            console.log('Found valid user session, switching to main app');
            // Small delay to ensure landing page is visible first
            setTimeout(() => {
                updateUIForLoggedInUser();
                showMainApp();
            }, 100);
        } catch (error) {
            console.error('Error parsing stored user data:', error);
            // Clear invalid data and stay on landing page
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            showLandingPage();
        }
    } else {
        console.log('No valid session found, staying on landing page');
        showLandingPage();
    }
}

function showLandingPage() {
    console.log('Showing landing page...');
    
    // Show landing page
    const landingPage = document.getElementById('landingPage');
    if (landingPage) {
        landingPage.style.display = 'block';
        landingPage.style.visibility = 'visible';
        landingPage.style.opacity = '1';
        console.log('Landing page displayed');
    } else {
        console.error('Landing page element not found!');
    }
    
    // Hide main app sections
    const dashboard = document.getElementById('dashboard');
    if (dashboard) dashboard.style.display = 'none';
    
    const vehicleForm = document.getElementById('vehicleForm');
    if (vehicleForm) vehicleForm.style.display = 'none';
    
    const glassContainer = document.querySelector('.glass-container');
    if (glassContainer) glassContainer.style.display = 'none';
    
    // Hide the header home button on landing page
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    if (backToHomeBtn) backToHomeBtn.style.display = 'none';
    
    // Remove user info bar if exists
    const existingBar = document.querySelector('.user-info-bar');
    if (existingBar) existingBar.remove();
    
    // Clear vehicle records
    vehicleRecords = [];
    
    console.log('Landing page setup complete');
}

function showMainApp() {
    console.log('=== SIMPLE showMainApp called ===');
    
    // Hide landing page
    const landingPage = document.getElementById('landingPage');
    if (landingPage) {
        landingPage.style.display = 'none';
        console.log('✓ Landing page hidden');
    }
    
    // Show dashboard
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.style.display = 'block';
        console.log('✓ Dashboard shown');
    }
    
    // Show vehicle form
    const glassContainer = document.querySelector('.glass-container');
    if (glassContainer) {
        glassContainer.style.display = 'block';
        console.log('✓ Vehicle form shown');
    }
    
    // Show navigation
    showUserNavigation();
    console.log('✓ Navigation shown');
    
    // Load data
    loadDashboardData();
    console.log('✓ Data loading...');
    
    console.log('=== showMainApp completed ===');
}

function updateUIForLoggedInUser() {
    showMainApp();
}

function updateUIForLoggedOutUser() {
    showLandingPage();
}

function showUserNavigation() {
    const navBar = document.getElementById('userNavBar');
    if (navBar) {
        navBar.style.display = 'flex';
        
        // Update welcome text
        const welcomeText = document.getElementById('welcomeText');
        if (welcomeText && currentUser) {
            welcomeText.textContent = `Welcome, ${currentUser.username || currentUser.email}!`;
        }
    }
}

function hideUserNavigation() {
    const navBar = document.getElementById('userNavBar');
    if (navBar) {
        navBar.style.display = 'none';
    }
}

function setupEventListeners() {
    console.log('setupEventListeners called');
    // Modal functionality
    setupModalEvents();
    
    // Landing page buttons
    const getStartedBtn = document.getElementById('getStartedBtn');
    console.log('getStartedBtn found:', getStartedBtn);
    if (getStartedBtn) {
        // Remove any existing event listeners
        getStartedBtn.replaceWith(getStartedBtn.cloneNode(true));
        const newGetStartedBtn = document.getElementById('getStartedBtn');
        
        newGetStartedBtn.addEventListener('click', () => {
            console.log('Get Started button clicked, currentUser:', currentUser);
            if (currentUser) {
                // User is already logged in, take them to dashboard
                showMainApp();
            } else {
                // User is not logged in, show login form
                showLogin();
            }
        });
        
        // Update button text based on login status
        updateGetStartedButton();
    }
    
    // Dashboard buttons
    const viewRecordsBtn = document.getElementById('viewRecords');
    if (viewRecordsBtn) {
        viewRecordsBtn.addEventListener('click', showViewRecordsModal);
    }
    
    // Original form (keep existing functionality)
    const vehicleForm = document.getElementById("vehicleForm");
    if (vehicleForm) {
        vehicleForm.addEventListener("submit", handleOriginalFormSubmit);
    }
}

// NAVIGATION SETUP
document.addEventListener('DOMContentLoaded', function() {
    console.log('Setting up navigation...');
    
    // Dashboard button
    const dashboardBtn = document.getElementById('dashboardNavBtn');
    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', function() {
            console.log('DASHBOARD BUTTON CLICKED!');
            showMainApp();
        });
        console.log('✓ Dashboard button listener added');
    }
    
    // Home button  
    const homeBtn = document.getElementById('homeNavBtn');
    if (homeBtn) {
        homeBtn.addEventListener('click', function() {
            console.log('HOME BUTTON CLICKED!');
            goToLandingPage();
        });
        console.log('✓ Home button listener added');
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutNavBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            console.log('LOGOUT BUTTON CLICKED!');
            logout();
        });
        console.log('✓ Logout button listener added');
    }
    
    console.log('Navigation setup complete!');
});

// Modal Management
function showViewRecordsModal() {
    if (!currentUser) {
        alert('Please login to view records');
        showLogin();
        return;
    }
    loadVehicleRecords();
    document.getElementById('viewRecordsModal').style.display = 'block';
}

function showAddRecordModal() {
    if (!currentUser) {
        alert('Please login to add records');
        showLogin();
        return;
    }
    document.getElementById('addRecordModal').style.display = 'block';
}

function closeAllModals() {
    console.log('closeAllModals called');
    const modals = document.querySelectorAll('.modal');
    console.log('Found modals:', modals.length);
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

function showLogin() {
    console.log('showLogin called');
    closeAllModals();
    document.getElementById('loginModal').style.display = 'block';
}

function goToLandingPage() {
    console.log('goToLandingPage called');
    showLandingPage();
}

// Authentication Functions
function doLogin() {
    console.log('doLogin called');
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showError('Please enter both email and password');
        return;
    }
    
    showLoading('Logging in...');
    
    fetch(`${getApiUrl()}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.token) {
            // Store authentication data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            currentUser = data.user;
            
            // Update UI
            updateUIForLoggedInUser();
            closeAllModals();
            showMainApp();
            showSuccess('Login successful!');
        } else {
            showError(data.message || 'Login failed');
        }
    })
    .catch(error => {
        hideLoading();
        console.error('Login error:', error);
        showError('Login failed. Please check your credentials.');
    });
}

function showRegister() {
    console.log('showRegister called');
    closeAllModals();
    document.getElementById('registerModal').style.display = 'block';
}

function doRegister() {
    console.log('doRegister called');
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    if (!username || !email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    showLoading('Registering...');
    
    fetch(`${getApiUrl()}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            email: email,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.success || data.message === 'User registered successfully') {
            showSuccess('Registration successful! Please login.');
            closeAllModals();
            document.getElementById('loginModal').style.display = 'block';
            
            // Pre-fill login form
            document.getElementById('loginEmail').value = email;
        } else {
            showError(data.message || 'Registration failed');
        }
    })
    .catch(error => {
        hideLoading();
        console.error('Registration error:', error);
        showError('Registration failed. Please try again.');
    });
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    hideUserNavigation();
    updateUIForLoggedOutUser();
    showSuccess('Logged out successfully');
}

// Vehicle Records Functions
async function loadVehicleRecords() {
    if (!currentUser) return;
    
    try {
        showLoading('Loading records...');
        const token = localStorage.getItem('token');
        const response = await fetch(`${getApiUrl()}/api/Vehicle/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        hideLoading();
        
        if (response.ok) {
            const data = await response.json();
            vehicleRecords = data.vehicles || [];
            displayVehicleRecords(vehicleRecords);
        } else {
            showError('Failed to load vehicle records');
            vehicleRecords = [];
            displayVehicleRecords([]);
        }
    } catch (error) {
        hideLoading();
        showError('Network error while loading records');
        console.error('Load records error:', error);
        vehicleRecords = [];
        displayVehicleRecords([]);
    }
}

async function loadDashboardData() {
    if (!currentUser) return;
    
    console.log('Loading dashboard data...');
    try {
        const token = localStorage.getItem('token');
        
        // Load vehicles data
        const vehiclesResponse = await fetch(`${getApiUrl()}/api/Vehicle`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (vehiclesResponse.ok) {
            const vehicles = await vehiclesResponse.json();
            console.log('Loaded vehicles:', vehicles);
            vehicleRecords = vehicles || [];
            updateDashboardWithVehicles(vehicles);
        } else {
            console.error('Failed to load vehicles:', vehiclesResponse.status);
            updateDashboardWithVehicles([]);
        }
        
    } catch (error) {
        console.error('Dashboard load error:', error);
        updateDashboardWithVehicles([]);
    }
}

function updateDashboardWithVehicles(vehicles) {
    const vehiclesList = document.getElementById('vehiclesList');
    if (vehiclesList) {
        if (vehicles && vehicles.length > 0) {
            vehiclesList.innerHTML = vehicles.map(vehicle => `
                <div class="vehicle-item">
                    <strong>${vehicle.make} ${vehicle.model}</strong> (${vehicle.year})
                    <br><small>License: ${vehicle.licensePlate}</small>
                </div>
            `).join('');
        } else {
            vehiclesList.innerHTML = '<p>No vehicles added yet.</p>';
        }
    }
}

function displayVehicleRecords(records) {
    const container = document.getElementById('recordsList');
    
    if (!records || records.length === 0) {
        container.innerHTML = '<div class="no-records">No vehicle records found. Add your first vehicle!</div>';
        return;
    }
    
    const recordsHTML = records.map(record => createRecordCard(record)).join('');
    container.innerHTML = recordsHTML;
}

function createRecordCard(record) {
    return `
        <div class="record-card" data-type="${record.vehicleType || record.type}">
            <div class="record-header">
                <div class="record-title">${record.make} ${record.model} (${record.year || 'N/A'})</div>
            </div>
            <div class="record-details">
                <div class="record-detail">
                    <span><strong>Owner:</strong></span>
                    <span>${record.ownerName || 'N/A'}</span>
                </div>
                <div class="record-detail">
                    <span><strong>License Plate:</strong></span>
                    <span>${record.licensePlate || 'N/A'}</span>
                </div>
                <div class="record-detail">
                    <span><strong>Insurance:</strong></span>
                    <span>${record.insuranceProvider || 'N/A'}</span>
                </div>
            </div>
        </div>
    `;
}

// Keep existing form functionality
async function handleOriginalFormSubmit(e) {
    e.preventDefault();
    console.log('Original form submitted');
    // Add your form handling logic here
}

// Utility Functions
function showLoading(message = 'Loading...') {
    console.log('Loading:', message);
    // Add loading indicator logic here
}

function hideLoading() {
    console.log('Hiding loading');
    // Hide loading indicator logic here
}

function showError(message) {
    console.error('Error:', message);
    alert('Error: ' + message);
}

function showSuccess(message) {
    console.log('Success:', message);
    alert('Success: ' + message);
}

function updateGetStartedButton() {
    const btn = document.getElementById('getStartedBtn');
    if (btn && currentUser) {
        btn.textContent = 'Go to Dashboard';
    } else if (btn) {
        btn.textContent = 'Get Started';
    }
}

// Modal Events Setup
function setupModalEvents() {
    // Close modal when clicking X or outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('close') || e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
    
    // ESC key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// Learn More Modal Functions (keep existing functionality)
function showLearnMoreModal() {
    console.log('Learn More modal requested');
    closeAllModals();
    const modal = document.getElementById('learnMoreModal');
    if (modal) {
        modal.style.display = 'block';
    }
}
