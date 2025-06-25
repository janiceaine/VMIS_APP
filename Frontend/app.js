// API Configuration - now loaded from config.js
const API_BASE_URL = ENV_CONFIG.API_BASE_URL;

// Car API Configuration
const CAR_API_BASE_URL = ENV_CONFIG.CAR_API_BASE_URL;
const CAR_API_KEY = ENV_CONFIG.CAR_API_KEY;

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
    
    // Hide ALL main app sections
    const dashboard = document.getElementById('dashboard');
    if (dashboard) dashboard.style.display = 'none';
    
    const vehicleForm = document.getElementById('vehicleForm');
    if (vehicleForm) vehicleForm.style.display = 'none';
    
    const glassContainer = document.querySelector('.glass-container');
    if (glassContainer) glassContainer.style.display = 'none';
    
    // Hide maintenance sections
    const maintenanceScheduler = document.getElementById('maintenanceScheduler');
    if (maintenanceScheduler) maintenanceScheduler.style.display = 'none';
    
    const reminderSection = document.getElementById('reminderSection');
    if (reminderSection) reminderSection.style.display = 'none';
    
    const inspectionSection = document.getElementById('inspectionSection');
    if (inspectionSection) inspectionSection.style.display = 'none';
    
    const serviceDirectory = document.getElementById('serviceDirectory');
    if (serviceDirectory) serviceDirectory.style.display = 'none';
    
    // Hide user navigation bar
    const userNavBar = document.getElementById('userNavBar');
    if (userNavBar) userNavBar.style.display = 'none';
    
    // Hide the header home button on landing page
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    if (backToHomeBtn) backToHomeBtn.style.display = 'none';
    
    // Close all modals
    closeAllModals();
    
    // Remove user info bar if exists
    const existingBar = document.querySelector('.user-info-bar');
    if (existingBar) existingBar.remove();
    
    // Clear vehicle records
    vehicleRecords = [];
    
    console.log('Landing page setup complete');
}

function showMainApp() {
    console.log('=== showMainApp called - Showing comprehensive forms ===');
    
    // Hide landing page
    const landingPage = document.getElementById('landingPage');
    if (landingPage) {
        landingPage.style.display = 'none';
        console.log('✓ Landing page hidden');
    }
    
    // Hide dashboard initially - user should fill forms first
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.style.display = 'none';
        console.log('✓ Dashboard hidden (will show after forms completed)');
    }
    
    // Show ALL the main forms and sections
    const glassContainer = document.querySelector('.glass-container');
    if (glassContainer) {
        glassContainer.style.display = 'block';
        console.log('✓ Vehicle/Insurance form shown');
    }
    
    const maintenanceScheduler = document.getElementById('maintenanceScheduler');
    if (maintenanceScheduler) {
        maintenanceScheduler.style.display = 'block';
        console.log('✓ Maintenance Scheduler shown');
    }
    
    const reminderSection = document.getElementById('reminderSection');
    if (reminderSection) {
        reminderSection.style.display = 'block';
        console.log('✓ Maintenance Reminders shown');
    }
    
    const inspectionSection = document.getElementById('inspectionSection');
    if (inspectionSection) {
        inspectionSection.style.display = 'block';
        console.log('✓ Inspection Section shown');
    }
    
    const serviceDirectory = document.getElementById('serviceDirectory');
    if (serviceDirectory) {
        serviceDirectory.style.display = 'block';
        console.log('✓ Service Directory shown');
    }
    
    // Show navigation
    showUserNavigation();
    console.log('✓ Navigation shown');
    
    // Show back to home button since we're in the main app
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    if (backToHomeBtn) {
        backToHomeBtn.style.display = 'block';
        console.log('✓ Back to home button shown');
    }
    
    // Load data
    loadDashboardData();
    console.log('✓ Data loading...');
    
    console.log('=== showMainApp completed - All forms visible ===');
}

function showDashboardView() {
    console.log('=== showDashboardView called ===');
    
    // Hide landing page
    const landingPage = document.getElementById('landingPage');
    if (landingPage) {
        landingPage.style.display = 'none';
    }
    
    // Hide all form sections (old structure)
    const glassContainer = document.querySelector('.glass-container');
    if (glassContainer) {
        glassContainer.style.display = 'none';
    }
    
    const maintenanceScheduler = document.getElementById('maintenanceScheduler');
    if (maintenanceScheduler) {
        maintenanceScheduler.style.display = 'none';
    }
    
    const reminderSection = document.getElementById('reminderSection');
    if (reminderSection) {
        reminderSection.style.display = 'none';
    }
    
    const inspectionSection = document.getElementById('inspectionSection');
    if (inspectionSection) {
        inspectionSection.style.display = 'none';
    }
    
    const serviceDirectory = document.getElementById('serviceDirectory');
    if (serviceDirectory) {
        serviceDirectory.style.display = 'none';
    }
    
    // Show only dashboard
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.style.display = 'block';
        console.log('✓ Dashboard shown');
    }
    
    // Show navigation
    showUserNavigation();
    
    // Hide back to home button (we have home nav in dashboard now)
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    if (backToHomeBtn) {
        backToHomeBtn.style.display = 'none';
    }
    
    // Load dashboard data and show overview tab by default
    showDashboardTab('overview');
    
    console.log('=== showDashboardView completed ===');
}
    if (glassContainer) {
        glassContainer.style.display = 'none';
    }
    
    const maintenanceScheduler = document.getElementById('maintenanceScheduler');
    if (maintenanceScheduler) {
        maintenanceScheduler.style.display = 'none';
    }
    
    const reminderSection = document.getElementById('reminderSection');
    if (reminderSection) {
        reminderSection.style.display = 'none';
    }
    
    const inspectionSection = document.getElementById('inspectionSection');
    if (inspectionSection) {
        inspectionSection.style.display = 'none';
    }
    
    const serviceDirectory = document.getElementById('serviceDirectory');
    if (serviceDirectory) {
        serviceDirectory.style.display = 'none';
    }
    
    // Show only dashboard
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.style.display = 'block';
        console.log('✓ Dashboard shown');
    }
    
    // Show navigation and back button
    showUserNavigation();
    
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    if (backToHomeBtn) {
        backToHomeBtn.style.display = 'block';
    }
    
    // Load dashboard data
    loadDashboardData();
    
    console.log('=== showDashboardView completed ===');
}

function updateUIForLoggedInUser() {
    showDashboardView();
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
    
    // Dashboard form handlers
    setupDashboardFormHandlers();
    
    // Landing page buttons - using more robust approach
    console.log('Setting up landing page buttons...');
    
    // Get Started Button
    const getStartedBtn = document.getElementById('getStartedBtn');
    console.log('getStartedBtn found:', getStartedBtn);
    if (getStartedBtn) {
        // Remove any existing listeners
        getStartedBtn.onclick = null;
        
        getStartedBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Get Started button clicked! currentUser:', currentUser);
            
            try {
                if (currentUser) {
                    console.log('User is logged in, showing dashboard...');
                    showDashboardView();
                } else {
                    console.log('User not logged in, showing login...');
                    showLogin();
                }
            } catch (error) {
                console.error('Error in Get Started click handler:', error);
            }
        });
        
        // Update button text based on login status
        updateGetStartedButton();
        console.log('Get Started button event listener added successfully');
    } else {
        console.error('Get Started button not found!');
    }
    
    // Learn More button
    const learnMoreBtn = document.getElementById('learnMoreBtn');
    console.log('learnMoreBtn found:', learnMoreBtn);
    if (learnMoreBtn) {
        // Remove inline onclick to avoid conflicts
        learnMoreBtn.onclick = null;
        
        learnMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Learn More button clicked!');
            
            try {
                showLearnMoreModal();
            } catch (error) {
                console.error('Error in Learn More click handler:', error);
            }
        });
        console.log('Learn More button event listener added successfully');
    } else {
        console.error('Learn More button not found!');
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

// Backup approach - add event listeners immediately when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM ready - setting up backup event listeners');
    
    // Backup event listener setup
    const setupBackupListeners = () => {
        const getStartedBtn = document.getElementById('getStartedBtn');
        const learnMoreBtn = document.getElementById('learnMoreBtn');
        
        if (getStartedBtn && !getStartedBtn.dataset.listenerAdded) {
            console.log('Adding backup listener to Get Started button');
            getStartedBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Backup: Get Started clicked');
                if (typeof showLogin === 'function') {
                    showLogin();
                } else {
                    console.error('showLogin function not available');
                }
            });
            getStartedBtn.dataset.listenerAdded = 'true';
        }
        
        if (learnMoreBtn && !learnMoreBtn.dataset.listenerAdded) {
            console.log('Adding backup listener to Learn More button');
            learnMoreBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Backup: Learn More clicked');
                if (typeof showLearnMoreModal === 'function') {
                    showLearnMoreModal();
                } else {
                    console.error('showLearnMoreModal function not available');
                }
            });
            learnMoreBtn.dataset.listenerAdded = 'true';
        }
    };
    
    // Try immediately and also after a delay
    setupBackupListeners();
    setTimeout(setupBackupListeners, 500);
    setTimeout(setupBackupListeners, 1000);
});

// NAVIGATION SETUP
document.addEventListener('DOMContentLoaded', function() {
    console.log('Setting up navigation...');
    
    // Dashboard button
    const dashboardBtn = document.getElementById('dashboardNavBtn');
    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', function() {
            console.log('DASHBOARD BUTTON CLICKED!');
            showDashboardView();
        });
        console.log('✓ Dashboard button listener added');
    }
    
    // Forms button - now shows dashboard with forms tab
    const formsBtn = document.getElementById('formsNavBtn');
    if (formsBtn) {
        formsBtn.addEventListener('click', function() {
            console.log('FORMS BUTTON CLICKED!');
            showDashboardView();
            setTimeout(() => showDashboardTab('forms'), 100);
        });
        console.log('✓ Forms button listener added');
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

// Dashboard tab management
function showDashboardTab(tabName) {
    console.log('Switching to dashboard tab:', tabName);
    
    // Hide all tabs
    const tabs = document.querySelectorAll('.dashboard-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const targetTab = document.getElementById(tabName + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Activate corresponding tab button
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach((btn, index) => {
        const tabNames = ['overview', 'forms', 'maintenance', 'inspection'];
        if (tabNames[index] === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Load specific data based on tab
    if (tabName === 'overview') {
        loadDashboardData();
    } else if (tabName === 'maintenance') {
        loadMaintenanceData();
    } else if (tabName === 'inspection') {
        loadInspectionData();
    }
}

function loadMaintenanceData() {
    // Load vehicle options for maintenance scheduler
    const scheduleVehicleSelect = document.getElementById('dashScheduleVehicle');
    if (scheduleVehicleSelect && vehicleRecords.length > 0) {
        scheduleVehicleSelect.innerHTML = '<option value="">Select a vehicle</option>';
        vehicleRecords.forEach(vehicle => {
            const option = document.createElement('option');
            option.value = vehicle.id || vehicle.licensePlate;
            option.textContent = `${vehicle.vehicleMake} ${vehicle.vehicleModel} (${vehicle.licensePlate})`;
            scheduleVehicleSelect.appendChild(option);
        });
    }
    
    // Load reminders
    const remindersList = document.getElementById('dashboardRemindersList');
    if (remindersList) {
        remindersList.innerHTML = '<p>No upcoming maintenance scheduled.</p>';
    }
}

function loadInspectionData() {
    // Load service providers
    const providersList = document.getElementById('dashboardProvidersList');
    if (providersList) {
        providersList.innerHTML = '<p>No service providers added yet.</p>';
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

// Dashboard form submission handlers
function setupDashboardFormHandlers() {
    // Vehicle form handler
    const dashVehicleForm = document.getElementById('dashboardVehicleForm');
    if (dashVehicleForm) {
        dashVehicleForm.addEventListener('submit', handleDashboardVehicleSubmit);
        console.log('✓ Dashboard vehicle form handler added');
    }
    
    // Insurance form handler
    const dashInsuranceForm = document.getElementById('dashboardInsuranceForm');
    if (dashInsuranceForm) {
        dashInsuranceForm.addEventListener('submit', handleDashboardInsuranceSubmit);
        console.log('✓ Dashboard insurance form handler added');
    }
    
    // Maintenance form handler
    const dashMaintenanceForm = document.getElementById('dashboardMaintenanceForm');
    if (dashMaintenanceForm) {
        dashMaintenanceForm.addEventListener('submit', handleDashboardMaintenanceSubmit);
        console.log('✓ Dashboard maintenance form handler added');
    }
    
    // Schedule form handler
    const dashScheduleForm = document.getElementById('dashboardScheduleForm');
    if (dashScheduleForm) {
        dashScheduleForm.addEventListener('submit', handleDashboardScheduleSubmit);
        console.log('✓ Dashboard schedule form handler added');
    }
}

async function handleDashboardVehicleSubmit(e) {
    e.preventDefault();
    console.log('Dashboard vehicle form submitted');
    
    const formData = new FormData(e.target);
    const vehicleData = Object.fromEntries(formData);
    
    try {
        const response = await fetch(`${getApiUrl()}/api/vehicles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(vehicleData)
        });
        
        if (response.ok) {
            showNotification('Vehicle added successfully!', 'success');
            e.target.reset();
            loadDashboardData();
            showDashboardTab('overview'); // Switch back to overview
        } else {
            throw new Error('Failed to add vehicle');
        }
    } catch (error) {
        console.error('Error adding vehicle:', error);
        showNotification('Error adding vehicle. Please try again.', 'error');
    }
}

async function handleDashboardInsuranceSubmit(e) {
    e.preventDefault();
    console.log('Dashboard insurance form submitted');
    
    const formData = new FormData(e.target);
    const insuranceData = Object.fromEntries(formData);
    
    try {
        const response = await fetch(`${getApiUrl()}/api/insurance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(insuranceData)
        });
        
        if (response.ok) {
            showNotification('Insurance information saved successfully!', 'success');
            e.target.reset();
        } else {
            throw new Error('Failed to save insurance information');
        }
    } catch (error) {
        console.error('Error saving insurance:', error);
        showNotification('Error saving insurance information. Please try again.', 'error');
    }
}

async function handleDashboardMaintenanceSubmit(e) {
    e.preventDefault();
    console.log('Dashboard maintenance form submitted');
    
    const formData = new FormData(e.target);
    const maintenanceData = Object.fromEntries(formData);
    
    try {
        const response = await fetch(`${getApiUrl()}/api/maintenance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(maintenanceData)
        });
        
        if (response.ok) {
            showNotification('Maintenance record saved successfully!', 'success');
            e.target.reset();
            loadDashboardData();
        } else {
            throw new Error('Failed to save maintenance record');
        }
    } catch (error) {
        console.error('Error saving maintenance record:', error);
        showNotification('Error saving maintenance record. Please try again.', 'error');
    }
}

async function handleDashboardScheduleSubmit(e) {
    e.preventDefault();
    console.log('Dashboard schedule form submitted');
    
    const formData = new FormData(e.target);
    const scheduleData = Object.fromEntries(formData);
    
    try {
        const response = await fetch(`${getApiUrl()}/api/schedules`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(scheduleData)
        });
        
        if (response.ok) {
            showNotification('Maintenance schedule created successfully!', 'success');
            e.target.reset();
            loadMaintenanceData();
        } else {
            throw new Error('Failed to create maintenance schedule');
        }
    } catch (error) {
        console.error('Error creating schedule:', error);
        showNotification('Error creating maintenance schedule. Please try again.', 'error');
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
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

function startQuickTour() {
    console.log('Starting quick tour');
    closeAllModals();
    const modal = document.getElementById('quickTourModal');
    if (modal) {
        modal.style.display = 'block';
        // Initialize tour
        currentTourStep = 1;
        showTourStep(1);
    }
}

function showGettingStarted() {
    console.log('Showing getting started guide');
    closeAllModals();
    const modal = document.getElementById('gettingStartedModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function showFeatureOverview() {
    console.log('Showing feature overview');
    closeAllModals();
    const modal = document.getElementById('featureOverviewModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function showVehicleLookupDemo() {
    console.log('Showing vehicle lookup demo');
    closeAllModals();
    const modal = document.getElementById('vehicleLookupModal');
    if (modal) {
        modal.style.display = 'block';
        // Pre-populate with demo data
        document.getElementById('lookupMake').value = 'toyota';
        document.getElementById('lookupModel').value = 'Camry';
        document.getElementById('lookupYear').value = '2023';
    }
}

// Tour functionality
let currentTourStep = 1;
const totalTourSteps = 4;

function nextTourStep() {
    if (currentTourStep < totalTourSteps) {
        document.getElementById(`tourStep${currentTourStep}`).style.display = 'none';
        currentTourStep++;
        document.getElementById(`tourStep${currentTourStep}`).style.display = 'block';
        updateTourNavigation();
    }
}

function previousTourStep() {
    if (currentTourStep > 1) {
        document.getElementById(`tourStep${currentTourStep}`).style.display = 'none';
        currentTourStep--;
        document.getElementById(`tourStep${currentTourStep}`).style.display = 'block';
        updateTourNavigation();
    }
}

function showTourStep(stepNumber) {
    // Hide all steps
    for (let i = 1; i <= totalTourSteps; i++) {
        const step = document.getElementById(`tourStep${i}`);
        if (step) step.style.display = 'none';
    }
    
    // Show current step
    const currentStep = document.getElementById(`tourStep${stepNumber}`);
    if (currentStep) {
        currentStep.style.display = 'block';
        currentTourStep = stepNumber;
        updateTourNavigation();
    }
}

function updateTourNavigation() {
    const prevBtn = document.getElementById('tourPrevBtn');
    const nextBtn = document.getElementById('tourNextBtn');
    const progress = document.getElementById('tourProgress');
    
    if (prevBtn) prevBtn.disabled = currentTourStep === 1;
    if (nextBtn) {
        nextBtn.disabled = currentTourStep === totalTourSteps;
        nextBtn.textContent = currentTourStep === totalTourSteps ? 'Finish' : 'Next';
        if (currentTourStep === totalTourSteps) {
            nextBtn.onclick = () => showLogin();
        } else {
            nextBtn.onclick = nextTourStep;
        }
    }
    if (progress) progress.textContent = `${currentTourStep} of ${totalTourSteps}`;
}

// Event listeners for tour navigation
document.addEventListener('DOMContentLoaded', function() {
    // Tour navigation setup
    const tourSkipBtn = document.getElementById('tourSkip');
    if (tourSkipBtn) {
        tourSkipBtn.addEventListener('click', () => closeAllModals());
    }
    
    // Populate year dropdown for vehicle lookup
    const yearSelect = document.getElementById('lookupYear');
    if (yearSelect) {
        const currentYear = new Date().getFullYear();
        for (let year = currentYear + 1; year >= 1990; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
    }
});

// Make functions globally available for debugging and backup access
window.showLogin = showLogin;
window.showLearnMoreModal = showLearnMoreModal;
window.showRegister = showRegister;
window.closeAllModals = closeAllModals;

// Debug helper
window.debugVMIS = function() {
    console.log('=== VMIS Debug Info ===');
    console.log('Current user:', currentUser);
    console.log('Get Started Button:', document.getElementById('getStartedBtn'));
    console.log('Learn More Button:', document.getElementById('learnMoreBtn'));
    console.log('Available functions:', {
        showLogin: typeof showLogin,
        showLearnMoreModal: typeof showLearnMoreModal,
        showRegister: typeof showRegister
    });
    console.log('======================');
};

console.log('VMIS app.js loaded successfully');
