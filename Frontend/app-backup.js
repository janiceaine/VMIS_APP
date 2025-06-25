// Simple API Configuration
const API_BASE_URL = 'http://localhost:5001';

// Car API Configuration
const CAR_API_BASE_URL = 'https://api.api-ninjas.com/v1/cars';
const CAR_API_KEY = 'ccMkKIb/Hi2DVRxw3jaMUQ==lGqgW96NZkxJKlm5';

// For cloud deployment, simply change this to your cloud API URL:
// const API_BASE_URL = 'https://your-api.herokuapp.com';
// const API_BASE_URL = 'https://your-api.vercel.app';
// const API_BASE_URL = 'https://your-api.railway.app';

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
    // Remove user info bar
    const existingBar = document.querySelector('.user-info-bar');
    if (existingBar) existingBar.remove();
    
    showLandingPage();
}

function showUserNavigation() {
    console.log('Showing user navigation');
    const navBar = document.getElementById('userNavBar');
    const welcomeText = document.getElementById('welcomeText');
    
    if (navBar) {
        navBar.style.display = 'flex';
        document.body.classList.add('nav-visible');
    }
    
    if (welcomeText && currentUser) {
        welcomeText.textContent = `Welcome, ${currentUser.username}!`;
    }
}

function hideUserNavigation() {
    console.log('Hiding user navigation');
    const navBar = document.getElementById('userNavBar');
    
    if (navBar) {
        navBar.style.display = 'none';
        document.body.classList.remove('nav-visible');
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
    
    // Try multiple times to find the learn more button
    let learnMoreBtn = document.getElementById('learnMoreBtn');
    console.log('Initial learnMoreBtn search:', learnMoreBtn);
    
    if (!learnMoreBtn) {
        // Try again with a slight delay
        setTimeout(() => {
            learnMoreBtn = document.getElementById('learnMoreBtn');
            console.log('Second learnMoreBtn search:', learnMoreBtn);
            if (learnMoreBtn) {
                setupLearnMoreButton(learnMoreBtn);
            }
        }, 500);
    } else {
        setupLearnMoreButton(learnMoreBtn);
    }
    
    // Dashboard buttons
    const viewRecordsBtn = document.getElementById('viewRecords');
    if (viewRecordsBtn) {
        viewRecordsBtn.addEventListener('click', showViewRecordsModal);
    }
    
    const addRecordBtn = document.getElementById('addRecord');
    if (addRecordBtn) {
        addRecordBtn.addEventListener('click', showAddRecordModal);
    }
    
    // Login and register are now handled via onclick in HTML
    
    const addRecordForm = document.getElementById('addRecordForm');
    if (addRecordForm) {
        addRecordForm.addEventListener('submit', handleAddRecord);
    }
    
    // Schedule form submission
    const scheduleForm = document.getElementById('scheduleForm');
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', handleScheduleSubmission);
    }
    
    // Vehicle type selection
    setupVehicleTypeSelection();
    
    // Filter functionality
    const vehicleTypeFilter = document.getElementById('vehicleTypeFilter');
    if (vehicleTypeFilter) {
        vehicleTypeFilter.addEventListener('change', filterRecords);
    }
    
    // Original form (keep existing functionality)
    const vehicleForm = document.getElementById("vehicleForm");
    if (vehicleForm) {
        vehicleForm.addEventListener("submit", handleOriginalFormSubmit);
    }
}

// SIMPLE NAVIGATION SETUP
document.addEventListener('DOMContentLoaded', function() {
    console.log('Setting up SIMPLE navigation...');
    
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

// Modal Management - Updated with logging
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

// Add missing showLogin function
function showLogin() {
    console.log('showLogin called');
    closeAllModals();
    document.getElementById('loginModal').style.display = 'block';
}

// Add missing goToLandingPage function
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
            email: email, // Backend expects email field
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
    
    showLoading('Creating account...');
    
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
        if (data.success || data.token) {
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
        
        // Try to load dashboard summary data (optional)
        try {
            const dashboardResponse = await fetch(`${getApiUrl()}/api/Vehicle/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (dashboardResponse.ok) {
                const dashboardData = await dashboardResponse.json();
                console.log('Dashboard data:', dashboardData);
                updateDashboardSummary(dashboardData);
            }
        } catch (dashError) {
            console.log('Dashboard endpoint not available, using basic data');
        }
        
    } catch (error) {
        console.error('Dashboard load error:', error);
        updateDashboardWithVehicles([]);
    }
}

function updateDashboardWithVehicles(vehicles) {
    console.log('Updating dashboard with vehicles:', vehicles);
    
    // Update vehicles list in dashboard
    const vehiclesList = document.getElementById('vehiclesList');
    if (vehiclesList) {
        if (!vehicles || vehicles.length === 0) {
            vehiclesList.innerHTML = '<div class="no-vehicles">No vehicles found. Add your first vehicle!</div>';
        } else {
            const vehiclesHTML = vehicles.map(vehicle => `
                <div class="vehicle-card">
                    <div class="vehicle-info">
                        <h4>${vehicle.vehicleMake} ${vehicle.vehicleModel} (${vehicle.year || 'N/A'})</h4>
                        <p>📋 License: ${vehicle.licensePlate || 'N/A'}</p>
                        <p>👤 Owner: ${vehicle.ownerName || 'N/A'}</p>
                        <p>🛡️ Insurance: ${vehicle.insuranceProvider || 'N/A'}</p>
                    </div>
                    <div class="vehicle-actions">
                        <button onclick="showEditVehicleModal(${vehicle.id})" class="edit-btn">✏️ Edit</button>
                        <button onclick="deleteVehicle(${vehicle.id})" class="delete-btn">🗑️ Delete</button>
                    </div>
                </div>
            `).join('');
            vehiclesList.innerHTML = vehiclesHTML;
        }
    }
    
    // Update active reminders
    const activeReminders = document.getElementById('activeReminders');
    if (activeReminders) {
        const remindersCount = vehicles.length > 0 ? Math.floor(Math.random() * 3) + 1 : 0;
        if (remindersCount === 0) {
            activeReminders.innerHTML = '<div class="no-reminders">No active reminders</div>';
        } else {
            activeReminders.innerHTML = `
                <div class="reminder">🔧 Oil change due for ${vehicles[0]?.vehicleMake || 'Vehicle'}</div>
                ${remindersCount > 1 ? '<div class="reminder">📅 Insurance renewal in 30 days</div>' : ''}
                ${remindersCount > 2 ? '<div class="reminder">🔍 Annual inspection due</div>' : ''}
            `;
        }
    }
    
    // Update recent activity
    const recentActivity = document.getElementById('recentActivity');
    if (recentActivity) {
        if (vehicles.length === 0) {
            recentActivity.innerHTML = '<div class="no-activity">No recent activity</div>';
        } else {
            recentActivity.innerHTML = `
                <div class="activity">✅ Added ${vehicles[vehicles.length - 1]?.vehicleMake || 'vehicle'}</div>
                <div class="activity">📝 Updated maintenance record</div>
                <div class="activity">🔔 Set reminder for inspection</div>
            `;
        }
    }
    
    // Update the maintenance scheduler vehicle dropdown
    populateVehicleDropdown();
}

function updateDashboardSummary(data) {
    // This function can be used for additional dashboard data if needed
    console.log('Dashboard summary data:', data);
}

function displayVehicleRecords(records) {
    const container = document.getElementById('recordsList');
    
    if (!records || records.length === 0) {
        container.innerHTML = '<div class="no-records">No vehicle records found. Add your first vehicle!</div>';
        populateVehicleDropdown(); // Update dropdown even when no records
        return;
    }
    
    const recordsHTML = records.map(record => createRecordCard(record)).join('');
    container.innerHTML = recordsHTML;
    
    // Update the maintenance scheduler vehicle dropdown
    populateVehicleDropdown();
}

function createRecordCard(record) {
    const vehicleImageSrc = getVehicleImageSrc(record.vehicleType || record.type);
    
    return `
        <div class="record-card" data-type="${record.vehicleType || record.type}">
            <div class="record-header">
                <img src="${vehicleImageSrc}" alt="${record.vehicleType || record.type}" class="record-vehicle-image">
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
                <div class="record-detail">
                    <span><strong>Policy:</strong></span>
                    <span>${record.policyNumber || 'N/A'}</span>
                </div>
                <div class="record-detail">
                    <span><strong>Expiration:</strong></span>
                    <span>${record.expirationDate ? new Date(record.expirationDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div class="record-detail">
                    <span><strong>Last Maintenance:</strong></span>
                    <span>${record.lastMaintenanceDate ? new Date(record.lastMaintenanceDate).toLocaleDateString() : 'N/A'}</span>
                </div>
            </div>
        </div>
    `;
}

function getVehicleImageSrc(vehicleType) {
    const imageMap = {
        'car': 'images/car.png',
        'truck': 'images/truck.png',
        'motorcycle': 'images/motocycle.png'
    };
    return imageMap[vehicleType] || 'images/car.png';
}

function filterRecords() {
    const filterValue = document.getElementById('vehicleTypeFilter').value;
    const filteredRecords = filterValue 
        ? vehicleRecords.filter(record => (record.vehicleType || record.type) === filterValue)
        : vehicleRecords;
    
    displayVehicleRecords(filteredRecords);
}

// Add Record Function
async function handleAddRecord(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showError('Please login to add records');
        return;
    }
    
    const formData = new FormData(e.target);
    const vehicleData = {
        ownerName: formData.get('ownerName'),
        make: formData.get('vehicleMake'),
        model: formData.get('vehicleModel'),
        year: parseInt(formData.get('vehicleYear')),
        licensePlate: formData.get('licensePlate'),
        vehicleType: formData.get('vehicleType'),
        insuranceProvider: formData.get('insuranceProvider'),
        policyNumber: formData.get('policyNumber'),
        expirationDate: formData.get('expirationDate'),
        maintenanceTask: formData.get('maintenanceTask'),
        inspectionDate: formData.get('inspectionDate'),
        mileage: parseInt(formData.get('mileage'))
    };
    
    try {
        showLoading('Adding vehicle record...');
        const token = localStorage.getItem('token');
        
        // Add vehicle first
        const vehicleResponse = await fetch(`${getApiUrl()}/api/vehicle`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ownerName: vehicleData.ownerName,
                make: vehicleData.make,
                model: vehicleData.model,
                year: vehicleData.year,
                licensePlate: vehicleData.licensePlate,
                vehicleType: vehicleData.vehicleType,
                insuranceProvider: vehicleData.insuranceProvider,
                policyNumber: vehicleData.policyNumber,
                expirationDate: vehicleData.expirationDate
            })
        });
        
        if (!vehicleResponse.ok) {
            throw new Error('Failed to add vehicle');
        }
        
        const vehicleResult = await vehicleResponse.json();
        
        // Add maintenance record
        const maintenanceResponse = await fetch(`${getApiUrl()}/api/Vehicle/maintenance`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vehicleId: vehicleResult.vehicleId,
                maintenanceTask: vehicleData.maintenanceTask,
                maintenanceDate: vehicleData.inspectionDate,
                mileage: vehicleData.mileage,
                policyExpiration: vehicleData.expirationDate
            })
        });
        
        hideLoading();
        
        if (maintenanceResponse.ok) {
            closeAllModals();
            showSuccess('Vehicle record added successfully!');
            loadDashboardData(); // Refresh dashboard
            e.target.reset(); // Reset form
            
            // Reset vehicle type selection
            document.querySelectorAll('.vehicle-option').forEach(opt => opt.classList.remove('selected'));
        } else {
            showError('Vehicle added but maintenance record failed');
        }
        
    } catch (error) {
        hideLoading();
        showError('Failed to add vehicle record');
        console.error('Add record error:', error);
    }
}

// Keep existing form functionality
async function handleOriginalFormSubmit(e) {
    e.preventDefault();
    
    // Check if user is logged in
    if (!currentUser) {
        showError('Please login first to add a vehicle');
        showLogin();
        return;
    }
    
    const form = e.target;
    const formData = new FormData(form);
    const isEditMode = form.dataset.mode === 'edit';
    const vehicleId = form.dataset.vehicleId;
    
    // Prepare vehicle data
    const vehicleData = {
        ownerName: formData.get('ownerName'),
        make: formData.get('vehicleMake') || formData.get('make'),
        model: formData.get('vehicleModel') || formData.get('model'),
        year: parseInt(formData.get('year')) || new Date().getFullYear(),
        licensePlate: formData.get('licensePlate'),
        vehicleType: formData.get('vehicleType'),
        vin: formData.get('vin'),
        insuranceProvider: formData.get('insuranceProvider'),
        policyNumber: formData.get('policyNumber'),
        expirationDate: formData.get('expirationDate')
    };
    
    try {
        const apiUrl = getApiUrl();
        console.log(isEditMode ? 'Updating vehicle:' : 'Creating vehicle:', vehicleData);
        
        showLoading(isEditMode ? 'Updating vehicle...' : 'Creating vehicle...');
        
        let vehicleResult;
        
        if (isEditMode) {
            // Update existing vehicle
            vehicleResult = await updateVehicle(vehicleId, vehicleData);
        } else {
            // Create new vehicle
            const vehicleResponse = await fetch(`${apiUrl}/api/Vehicle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(vehicleData)
            });
            
            vehicleResult = await vehicleResponse.json();
            
            if (!vehicleResponse.ok) {
                throw new Error(vehicleResult.error || vehicleResult.details || 'Failed to create vehicle');
            }
        }
        
        console.log(`Vehicle ${isEditMode ? 'updated' : 'created'} successfully:`, vehicleResult);
        
        // If maintenance data is provided, add maintenance record
        const maintenanceTask = formData.get('maintenanceTask');
        const maintenanceDate = formData.get('inspectionDate');
        const mileage = formData.get('mileage');
        
        if (maintenanceTask && maintenanceDate) {
            console.log('Adding maintenance record...');
            
            const maintenanceData = {
                vehicleId: vehicleResult.vehicleId,
                maintenanceTask: maintenanceTask,
                maintenanceDate: maintenanceDate,
                mileage: parseInt(mileage) || null
            };
            
            const maintenanceResponse = await fetch(`${apiUrl}/api/Vehicle/maintenance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(maintenanceData)
            });
            
            if (!maintenanceResponse.ok) {
                const maintenanceError = await maintenanceResponse.json();
                console.warn('Maintenance record failed:', maintenanceError);
                // Don't fail the whole operation if maintenance fails
            } else {
                console.log('Maintenance record added successfully');
            }
        }
        
        hideLoading();
        showSuccess('Vehicle added successfully!');
        
        // Reset form
        e.target.reset();
        
        // Refresh dashboard if it's visible
        if (document.getElementById('dashboard').style.display !== 'none') {
            loadDashboardData();
        }
        
    } catch (error) {
        hideLoading();
        console.error('Error submitting form:', error);
        showError(`Error: ${error.message}`);
    }
}

// Enhanced vehicle data saving with API details
async function saveVehicleWithApiData(vehicleData, apiData) {
    try {
        // Combine our form data with API data
        const enhancedVehicleData = {
            ...vehicleData,
            // Add API data as additional fields
            engineSize: apiData.displacement ? `${apiData.displacement}L` : null,
            cylinders: apiData.cylinders || null,
            fuelType: apiData.fuel_type || null,
            transmission: apiData.transmission || null,
            driveType: apiData.drive || null,
            cityMpg: apiData.city_mpg || null,
            highwayMpg: apiData.highway_mpg || null,
            combinedMpg: apiData.combination_mpg || null,
            vehicleClass: apiData.class || null,
            // Store recommended maintenance intervals
            maintenanceData: getMaintenanceIntervals(apiData),
            // Timestamp when data was fetched
            apiDataFetched: new Date().toISOString()
        };

        const response = await fetch(`${getApiUrl()}/api/vehicle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(enhancedVehicleData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Vehicle saved with API data:', result);
            return result;
        } else {
            throw new Error('Failed to save vehicle data');
        }
    } catch (error) {
        console.error('Error saving enhanced vehicle data:', error);
        throw error;
    }
}

// Update vehicle function
async function updateVehicle(vehicleId, vehicleData) {
    try {
        showLoading();
        
        const response = await fetch(`${getApiUrl()}/api/vehicle/${vehicleId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(vehicleData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Vehicle updated successfully:', result);
            showSuccess('Vehicle updated successfully');
            
            // Refresh dashboard and vehicle list
            if (document.getElementById('dashboard').style.display !== 'none') {
                loadDashboardData();
            }
            return result;
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update vehicle');
        }
    } catch (error) {
        console.error('Error updating vehicle:', error);
        showError(`Error updating vehicle: ${error.message}`);
        throw error;
    } finally {
        hideLoading();
    }
}

// Vehicle management functions
async function deleteVehicle(vehicleId) {
    if (!confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${getApiUrl()}/api/Vehicle/${vehicleId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            showSuccess('Vehicle deleted successfully!');
            loadDashboardData(); // Refresh the dashboard
        } else {
            const error = await response.text();
            showError('Failed to delete vehicle: ' + error);
        }
    } catch (error) {
        console.error('Delete vehicle error:', error);
        showError('Error deleting vehicle. Please try again.');
    }
}

// Get single vehicle for editing
async function getVehicle(vehicleId) {
    try {
        const response = await fetch(`${getApiUrl()}/api/vehicle/${vehicleId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const vehicle = await response.json();
            return vehicle;
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch vehicle');
        }
    } catch (error) {
        console.error('Error fetching vehicle:', error);
        showError(`Error fetching vehicle: ${error.message}`);
        throw error;
    }
}

// Show edit vehicle modal
function showEditVehicleModal(vehicleId) {
    // Get vehicle data and populate form for editing
    getVehicle(vehicleId).then(vehicle => {
        // Populate form with existing vehicle data
        document.getElementById('vehicleType').value = vehicle.vehicleType || '';
        document.getElementById('make').value = vehicle.make || '';
        document.getElementById('model').value = vehicle.model || '';
        document.getElementById('year').value = vehicle.year || '';
        document.getElementById('licensePlate').value = vehicle.licensePlate || '';
        document.getElementById('vin').value = vehicle.vin || '';
        
        // Store vehicle ID for update
        const form = document.getElementById('vehicleForm');
        form.dataset.vehicleId = vehicleId;
        form.dataset.mode = 'edit';
        
        // Update form title
        const modalTitle = document.querySelector('#vehicleModal h2');
        if (modalTitle) modalTitle.textContent = 'Edit Vehicle';
        
        // Show modal
        document.getElementById('vehicleModal').style.display = 'block';
    }).catch(error => {
        console.error('Error loading vehicle for edit:', error);
    });
}

// Reset form to create mode
function resetVehicleForm() {
    const form = document.getElementById('vehicleForm');
    if (form) {
        form.reset();
        delete form.dataset.vehicleId;
        delete form.dataset.mode;
        
        // Update form title back to create mode
        const modalTitle = document.querySelector('#vehicleModal h2');
        if (modalTitle) modalTitle.textContent = 'Add Vehicle';
    }
}

// Vehicle form management
function showVehicleForm() {
    console.log('Showing vehicle form');
    const glassContainer = document.querySelector('.glass-container');
    if (glassContainer) {
        glassContainer.style.display = 'block';
        // Scroll to the form
        glassContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

function hideVehicleForm() {
    console.log('Hiding vehicle form');
    const glassContainer = document.querySelector('.glass-container');
    if (glassContainer) {
        glassContainer.style.display = 'none';
    }
}

// Helper function to set up the Learn More button event listener
function setupLearnMoreButton(button) {
    console.log('Setting up learnMoreBtn event listener on:', button);
    button.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Learn More button clicked!');
        showLearnMoreModal();
    });
    console.log('Event listener added to learn more button');
}

// Learn More Modal Functions
function showLearnMoreModal() {
    console.log('Showing enhanced Learn More modal');
    closeAllModals();
    const modal = document.getElementById('learnMoreModal');
    if (modal) {
        modal.style.display = 'block';
        
        // Add entrance animation
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.transform = 'scale(0.8) translateY(-50px)';
            modalContent.style.opacity = '0';
            
            setTimeout(() => {
                modalContent.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                modalContent.style.transform = 'scale(1) translateY(0)';
                modalContent.style.opacity = '1';
            }, 50);
        }
        
        // Animate learning cards
        setTimeout(() => {
            const cards = modal.querySelectorAll('.learning-card');
            cards.forEach((card, index) => {
                card.style.transform = 'translateY(30px)';
                card.style.opacity = '0';
                
                setTimeout(() => {
                    card.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    card.style.transform = 'translateY(0)';
                    card.style.opacity = '1';
                }, index * 150);
            });
        }, 200);
    }
}

function startQuickTour() {
    console.log('Starting enhanced quick tour');
    closeAllModals();
    const modal = document.getElementById('quickTourModal');
    if (modal) {
        modal.style.display = 'block';
        currentTourStep = 1;
        updateTourProgress();
        showTourStep(1);
        
        // Add entrance animation
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.transform = 'scale(0.9) rotateY(-15deg)';
            modalContent.style.opacity = '0';
            
            setTimeout(() => {
                modalContent.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                modalContent.style.transform = 'scale(1) rotateY(0deg)';
                modalContent.style.opacity = '1';
            }, 50);
        }
    }
}

function showGettingStarted() {
    console.log('Showing enhanced getting started guide');
    closeAllModals();
    const modal = document.getElementById('gettingStartedModal');
    if (modal) {
        modal.style.display = 'block';
        
        // Add entrance animation
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.transform = 'scale(0.95) translateX(-30px)';
            modalContent.style.opacity = '0';
            
            setTimeout(() => {
                modalContent.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                modalContent.style.transform = 'scale(1) translateX(0)';
                modalContent.style.opacity = '1';
            }, 50);
        }
        
        // Animate guide steps
        setTimeout(() => {
            const steps = modal.querySelectorAll('.guide-step');
            steps.forEach((step, index) => {
                step.style.transform = 'translateX(-50px)';
                step.style.opacity = '0';
                
                setTimeout(() => {
                    step.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    step.style.transform = 'translateX(0)';
                    step.style.opacity = '1';
                }, index * 200);
            });
        }, 300);
    }
}

function showFeatureOverview() {
    console.log('Showing enhanced feature overview');
    closeAllModals();
    const modal = document.getElementById('featureOverviewModal');
    if (modal) {
        modal.style.display = 'block';
        
        // Add entrance animation
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.transform = 'scale(0.9) translateY(50px)';
            modalContent.style.opacity = '0';
            
            setTimeout(() => {
                modalContent.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                modalContent.style.transform = 'scale(1) translateY(0)';
                modalContent.style.opacity = '1';
            }, 50);
        }
        
        // Animate feature cards in a staggered way
        setTimeout(() => {
            const cards = modal.querySelectorAll('.feature-card');
            cards.forEach((card, index) => {
                card.style.transform = 'scale(0.8) rotateY(20deg)';
                card.style.opacity = '0';
                
                setTimeout(() => {
                    card.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    card.style.transform = 'scale(1) rotateY(0deg)';
                    card.style.opacity = '1';
                }, index * 100);
            });
        }, 400);
    }
}

// Enhanced Tour Progress and Step Management
let currentTourStep = 1;
const totalTourSteps = 4;

function updateTourProgress() {
    const progressFill = document.getElementById('tourProgress');
    const tourTitle = document.getElementById('tourTitle');
    
    if (progressFill) {
        const percentage = (currentTourStep / totalTourSteps) * 100;
        progressFill.style.width = `${percentage}%`;
    }
    
    if (tourTitle) {
        tourTitle.textContent = `🎯 Quick Tour - Step ${currentTourStep} of ${totalTourSteps}`;
    }
    
    // Update navigation buttons
    const prevBtn = document.getElementById('tourPrev');
    const nextBtn = document.getElementById('tourNext');
    
    if (prevBtn) {
        prevBtn.disabled = currentTourStep === 1;
    }
    
    if (nextBtn) {
        nextBtn.textContent = currentTourStep === totalTourSteps ? 'Finish ✨' : 'Next ➡️';
    }
}

function showTourStep(step) {
    const tourStep = document.getElementById('tourStep');
    if (!tourStep) return;
    
    const steps = {
        1: {
            title: "🚗 Welcome to VMIS",
            content: `
                <div style="text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">🎉</div>
                    <h3 style="color: #FFD700; font-size: 2rem; margin-bottom: 20px;">Welcome to Your Vehicle Management Journey!</h3>
                    <p style="font-size: 1.2rem; line-height: 1.6; color: rgba(255,255,255,0.9);">
                        VMIS helps you track maintenance, manage insurance, and keep your vehicles running smoothly. 
                        Let's take a quick tour of the amazing features waiting for you!
                    </p>
                </div>
            `
        },
        2: {
            title: "📊 Dashboard Overview",
            content: `
                <div style="text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">📊</div>
                    <h3 style="color: #FFD700; font-size: 2rem; margin-bottom: 20px;">Your Personal Dashboard</h3>
                    <p style="font-size: 1.2rem; line-height: 1.6; color: rgba(255,255,255,0.9);">
                        View all your vehicles at a glance, track maintenance reminders, and see recent activity. 
                        Your dashboard is the command center for all your vehicle management needs.
                    </p>
                </div>
            `
        },
        3: {
            title: "🔍 Vehicle Lookup",
            content: `
                <div style="text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">🔍</div>
                    <h3 style="color: #FFD700; font-size: 2rem; margin-bottom: 20px;">Smart Vehicle Lookup</h3>
                    <p style="font-size: 1.2rem; line-height: 1.6; color: rgba(255,255,255,0.9);">
                        Get detailed specifications, maintenance schedules, and recommendations for any vehicle. 
                        Our database contains information for thousands of makes and models!
                    </p>
                </div>
            `
        },
        4: {
            title: "🎯 Ready to Start!",
            content: `
                <div style="text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">🚀</div>
                    <h3 style="color: #FFD700; font-size: 2rem; margin-bottom: 20px;">You're All Set!</h3>
                    <p style="font-size: 1.2rem; line-height: 1.6; color: rgba(255,255,255,0.9);">
                        You now know the basics of VMIS. Ready to add your first vehicle and start managing 
                        your fleet like a pro? Let's get started!
                    </p>
                </div>
            `
        }
    };
    
    const stepData = steps[step];
    if (stepData) {
        // Animate step transition
        tourStep.style.transform = 'translateX(30px)';
        tourStep.style.opacity = '0';
        
        setTimeout(() => {
            tourStep.innerHTML = stepData.content;
            tourStep.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            tourStep.style.transform = 'translateX(0)';
            tourStep.style.opacity = '1';
        }, 200);
    }
}

// Enhanced Modal Closing with Animation
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (modal.style.display === 'block') {
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.transition = 'all 0.3s ease';
                modalContent.style.transform = 'scale(0.95)';
                modalContent.style.opacity = '0';
                
                setTimeout(() => {
                    modal.style.display = 'none';
                    // Reset transform for next time
                    modalContent.style.transform = '';
                    modalContent.style.opacity = '';
                    modalContent.style.transition = '';
                }, 300);
            } else {
                modal.style.display = 'none';
            }
        }
    });
}

// Simple API Configuration
const API_BASE_URL = 'http://localhost:5001';

// Car API Configuration
const CAR_API_BASE_URL = 'https://api.api-ninjas.com/v1/cars';
const CAR_API_KEY = 'ccMkKIb/Hi2DVRxw3jaMUQ==lGqgW96NZkxJKlm5';

// For cloud deployment, simply change this to your cloud API URL:
// const API_BASE_URL = 'https://your-api.herokuapp.com';
// const API_BASE_URL = 'https://your-api.vercel.app';
// const API_BASE_URL = 'https://your-api.railway.app';

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
    // Remove user info bar
    const existingBar = document.querySelector('.user-info-bar');
    if (existingBar) existingBar.remove();
    
    showLandingPage();
}

function showUserNavigation() {
    console.log('Showing user navigation');
    const navBar = document.getElementById('userNavBar');
    const welcomeText = document.getElementById('welcomeText');
    
    if (navBar) {
        navBar.style.display = 'flex';
        document.body.classList.add('nav-visible');
    }
    
    if (welcomeText && currentUser) {
        welcomeText.textContent = `Welcome, ${currentUser.username}!`;
    }
}

function hideUserNavigation() {
    console.log('Hiding user navigation');
    const navBar = document.getElementById('userNavBar');
    
    if (navBar) {
        navBar.style.display = 'none';
        document.body.classList.remove('nav-visible');
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
    
    // Try multiple times to find the learn more button
    let learnMoreBtn = document.getElementById('learnMoreBtn');
    console.log('Initial learnMoreBtn search:', learnMoreBtn);
    
    if (!learnMoreBtn) {
        // Try again with a slight delay
        setTimeout(() => {
            learnMoreBtn = document.getElementById('learnMoreBtn');
            console.log('Second learnMoreBtn search:', learnMoreBtn);
            if (learnMoreBtn) {
                setupLearnMoreButton(learnMoreBtn);
            }
        }, 500);
    } else {
        setupLearnMoreButton(learnMoreBtn);
    }
    
    // Dashboard buttons
    const viewRecordsBtn = document.getElementById('viewRecords');
    if (viewRecordsBtn) {
        viewRecordsBtn.addEventListener('click', showViewRecordsModal);
    }
    
    const addRecordBtn = document.getElementById('addRecord');
    if (addRecordBtn) {
        addRecordBtn.addEventListener('click', showAddRecordModal);
    }
    
    // Login and register are now handled via onclick in HTML
    
    const addRecordForm = document.getElementById('addRecordForm');
    if (addRecordForm) {
        addRecordForm.addEventListener('submit', handleAddRecord);
    }
    
    // Schedule form submission
    const scheduleForm = document.getElementById('scheduleForm');
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', handleScheduleSubmission);
    }
    
    // Vehicle type selection
    setupVehicleTypeSelection();
    
    // Filter functionality
    const vehicleTypeFilter = document.getElementById('vehicleTypeFilter');
    if (vehicleTypeFilter) {
        vehicleTypeFilter.addEventListener('change', filterRecords);
    }
    
    // Original form (keep existing functionality)
    const vehicleForm = document.getElementById("vehicleForm");
    if (vehicleForm) {
        vehicleForm.addEventListener("submit", handleOriginalFormSubmit);
    }
}

// SIMPLE NAVIGATION SETUP
document.addEventListener('DOMContentLoaded', function() {
    console.log('Setting up SIMPLE navigation...');
    
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

// Modal Management - Updated with logging
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

// Add missing showLogin function
function showLogin() {
    console.log('showLogin called');
    closeAllModals();
    document.getElementById('loginModal').style.display = 'block';
}

// Add missing goToLandingPage function
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
            email: email, // Backend expects email field
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
    
    showLoading('Creating account...');
    
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
        if (data.success || data.token) {
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
        
        // Try to load dashboard summary data (optional)
        try {
            const dashboardResponse = await fetch(`${getApiUrl()}/api/Vehicle/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (dashboardResponse.ok) {
                const dashboardData = await dashboardResponse.json();
                console.log('Dashboard data:', dashboardData);
                updateDashboardSummary(dashboardData);
            }
        } catch (dashError) {
            console.log('Dashboard endpoint not available, using basic data');
        }
        
    } catch (error) {
        console.error('Dashboard load error:', error);
        updateDashboardWithVehicles([]);
    }
}

function updateDashboardWithVehicles(vehicles) {
    console.log('Updating dashboard with vehicles:', vehicles);
    
    // Update vehicles list in dashboard
    const vehiclesList = document.getElementById('vehiclesList');
    if (vehiclesList) {
        if (!vehicles || vehicles.length === 0) {
            vehiclesList.innerHTML = '<div class="no-vehicles">No vehicles found. Add your first vehicle!</div>';
        } else {
            const vehiclesHTML = vehicles.map(vehicle => `
                <div class="vehicle-card">
                    <div class="vehicle-info">
                        <h4>${vehicle.vehicleMake} ${vehicle.vehicleModel} (${vehicle.year || 'N/A'})</h4>
                        <p>📋 License: ${vehicle.licensePlate || 'N/A'}</p>
                        <p>👤 Owner: ${vehicle.ownerName || 'N/A'}</p>
                        <p>🛡️ Insurance: ${vehicle.insuranceProvider || 'N/A'}</p>
                    </div>
                    <div class="vehicle-actions">
                        <button onclick="showEditVehicleModal(${vehicle.id})" class="edit-btn">✏️ Edit</button>
                        <button onclick="deleteVehicle(${vehicle.id})" class="delete-btn">🗑️ Delete</button>
                    </div>
                </div>
            `).join('');
            vehiclesList.innerHTML = vehiclesHTML;
        }
    }
    
    // Update active reminders
    const activeReminders = document.getElementById('activeReminders');
    if (activeReminders) {
        const remindersCount = vehicles.length > 0 ? Math.floor(Math.random() * 3) + 1 : 0;
        if (remindersCount === 0) {
            activeReminders.innerHTML = '<div class="no-reminders">No active reminders</div>';
        } else {
            activeReminders.innerHTML = `
                <div class="reminder">🔧 Oil change due for ${vehicles[0]?.vehicleMake || 'Vehicle'}</div>
                ${remindersCount > 1 ? '<div class="reminder">📅 Insurance renewal in 30 days</div>' : ''}
                ${remindersCount > 2 ? '<div class="reminder">🔍 Annual inspection due</div>' : ''}
            `;
        }
    }
    
    // Update recent activity
    const recentActivity = document.getElementById('recentActivity');
    if (recentActivity) {
        if (vehicles.length === 0) {
            recentActivity.innerHTML = '<div class="no-activity">No recent activity</div>';
        } else {
            recentActivity.innerHTML = `
                <div class="activity">✅ Added ${vehicles[vehicles.length - 1]?.vehicleMake || 'vehicle'}</div>
                <div class="activity">📝 Updated maintenance record</div>
                <div class="activity">🔔 Set reminder for inspection</div>
            `;
        }
    }
    
    // Update the maintenance scheduler vehicle dropdown
    populateVehicleDropdown();
}

function updateDashboardSummary(data) {
    // This function can be used for additional dashboard data if needed
    console.log('Dashboard summary data:', data);
}

function displayVehicleRecords(records) {
    const container = document.getElementById('recordsList');
    
    if (!records || records.length === 0) {
        container.innerHTML = '<div class="no-records">No vehicle records found. Add your first vehicle!</div>';
        populateVehicleDropdown(); // Update dropdown even when no records
        return;
    }
    
    const recordsHTML = records.map(record => createRecordCard(record)).join('');
    container.innerHTML = recordsHTML;
    
    // Update the maintenance scheduler vehicle dropdown
    populateVehicleDropdown();
}

function createRecordCard(record) {
    const vehicleImageSrc = getVehicleImageSrc(record.vehicleType || record.type);
    
    return `
        <div class="record-card" data-type="${record.vehicleType || record.type}">
            <div class="record-header">
                <img src="${vehicleImageSrc}" alt="${record.vehicleType || record.type}" class="record-vehicle-image">
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
                <div class="record-detail">
                    <span><strong>Policy:</strong></span>
                    <span>${record.policyNumber || 'N/A'}</span>
                </div>
                <div class="record-detail">
                    <span><strong>Expiration:</strong></span>
                    <span>${record.expirationDate ? new Date(record.expirationDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div class="record-detail">
                    <span><strong>Last Maintenance:</strong></span>
                    <span>${record.lastMaintenanceDate ? new Date(record.lastMaintenanceDate).toLocaleDateString() : 'N/A'}</span>
                </div>
            </div>
        </div>
    `;
}

function getVehicleImageSrc(vehicleType) {
    const imageMap = {
        'car': 'images/car.png',
        'truck': 'images/truck.png',
        'motorcycle': 'images/motocycle.png'
    };
    return imageMap[vehicleType] || 'images/car.png';
}

function filterRecords() {
    const filterValue = document.getElementById('vehicleTypeFilter').value;
    const filteredRecords = filterValue 
        ? vehicleRecords.filter(record => (record.vehicleType || record.type) === filterValue)
        : vehicleRecords;
    
    displayVehicleRecords(filteredRecords);
}

// Add Record Function
async function handleAddRecord(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showError('Please login to add records');
        return;
    }
    
    const formData = new FormData(e.target);
    const vehicleData = {
        ownerName: formData.get('ownerName'),
        make: formData.get('vehicleMake'),
        model: formData.get('vehicleModel'),
        year: parseInt(formData.get('vehicleYear')),
        licensePlate: formData.get('licensePlate'),
        vehicleType: formData.get('vehicleType'),
        insuranceProvider: formData.get('insuranceProvider'),
        policyNumber: formData.get('policyNumber'),
        expirationDate: formData.get('expirationDate'),
        maintenanceTask: formData.get('maintenanceTask'),
        inspectionDate: formData.get('inspectionDate'),
        mileage: parseInt(formData.get('mileage'))
    };
    
    try {
        showLoading('Adding vehicle record...');
        const token = localStorage.getItem('token');
        
        // Add vehicle first
        const vehicleResponse = await fetch(`${getApiUrl()}/api/vehicle`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ownerName: vehicleData.ownerName,
                make: vehicleData.make,
                model: vehicleData.model,
                year: vehicleData.year,
                licensePlate: vehicleData.licensePlate,
                vehicleType: vehicleData.vehicleType,
                insuranceProvider: vehicleData.insuranceProvider,
                policyNumber: vehicleData.policyNumber,
                expirationDate: vehicleData.expirationDate
            })
        });
        
        if (!vehicleResponse.ok) {
            throw new Error('Failed to add vehicle');
        }
        
        const vehicleResult = await vehicleResponse.json();
        
        // Add maintenance record
        const maintenanceResponse = await fetch(`${getApiUrl()}/api/Vehicle/maintenance`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vehicleId: vehicleResult.vehicleId,
                maintenanceTask: vehicleData.maintenanceTask,
                maintenanceDate: vehicleData.inspectionDate,
                mileage: vehicleData.mileage,
                policyExpiration: vehicleData.expirationDate
            })
        });
        
        hideLoading();
        
        if (maintenanceResponse.ok) {
            closeAllModals();
            showSuccess('Vehicle record added successfully!');
            loadDashboardData(); // Refresh dashboard
            e.target.reset(); // Reset form
            
            // Reset vehicle type selection
            document.querySelectorAll('.vehicle-option').forEach(opt => opt.classList.remove('selected'));
        } else {
            showError('Vehicle added but maintenance record failed');
        }
        
    } catch (error) {
        hideLoading();
        showError('Failed to add vehicle record');
        console.error('Add record error:', error);
    }
}

// Keep existing form functionality
async function handleOriginalFormSubmit(e) {
    e.preventDefault();
    
    // Check if user is logged in
    if (!currentUser) {
        showError('Please login first to add a vehicle');
        showLogin();
        return;
    }
    
    const form = e.target;
    const formData = new FormData(form);
    const isEditMode = form.dataset.mode === 'edit';
    const vehicleId = form.dataset.vehicleId;
    
    // Prepare vehicle data
    const vehicleData = {
        ownerName: formData.get('ownerName'),
        make: formData.get('vehicleMake') || formData.get('make'),
        model: formData.get('vehicleModel') || formData.get('model'),
        year: parseInt(formData.get('year')) || new Date().getFullYear(),
        licensePlate: formData.get('licensePlate'),
        vehicleType: formData.get('vehicleType'),
        vin: formData.get('vin'),
        insuranceProvider: formData.get('insuranceProvider'),
        policyNumber: formData.get('policyNumber'),
        expirationDate: formData.get('expirationDate')
    };
    
    try {
        const apiUrl = getApiUrl();
        console.log(isEditMode ? 'Updating vehicle:' : 'Creating vehicle:', vehicleData);
        
        showLoading(isEditMode ? 'Updating vehicle...' : 'Creating vehicle...');
        
        let vehicleResult;
        
        if (isEditMode) {
            // Update existing vehicle
            vehicleResult = await updateVehicle(vehicleId, vehicleData);
        } else {
            // Create new vehicle
            const vehicleResponse = await fetch(`${apiUrl}/api/Vehicle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(vehicleData)
            });
            
            vehicleResult = await vehicleResponse.json();
            
            if (!vehicleResponse.ok) {
                throw new Error(vehicleResult.error || vehicleResult.details || 'Failed to create vehicle');
            }
        }
        
        console.log(`Vehicle ${isEditMode ? 'updated' : 'created'} successfully:`, vehicleResult);
        
        // If maintenance data is provided, add maintenance record
        const maintenanceTask = formData.get('maintenanceTask');
        const maintenanceDate = formData.get('inspectionDate');
        const mileage = formData.get('mileage');
        
        if (maintenanceTask && maintenanceDate) {
            console.log('Adding maintenance record...');
            
            const maintenanceData = {
                vehicleId: vehicleResult.vehicleId,
                maintenanceTask: maintenanceTask,
                maintenanceDate: maintenanceDate,
                mileage: parseInt(mileage) || null
            };
            
            const maintenanceResponse = await fetch(`${apiUrl}/api/Vehicle/maintenance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(maintenanceData)
            });
            
            if (!maintenanceResponse.ok) {
                const maintenanceError = await maintenanceResponse.json();
                console.warn('Maintenance record failed:', maintenanceError);
                // Don't fail the whole operation if maintenance fails
            } else {
                console.log('Maintenance record added successfully');
            }
        }
        
        hideLoading();
        showSuccess('Vehicle added successfully!');
        
        // Reset form
        e.target.reset();
        
        // Refresh dashboard if it's visible
        if (document.getElementById('dashboard').style.display !== 'none') {
            loadDashboardData();
        }
        
    } catch (error) {
        hideLoading();
        console.error('Error submitting form:', error);
        showError(`Error: ${error.message}`);
    }
}

// Enhanced vehicle data saving with API details
async function saveVehicleWithApiData(vehicleData, apiData) {
    try {
        // Combine our form data with API data
        const enhancedVehicleData = {
            ...vehicleData,
            // Add API data as additional fields
            engineSize: apiData.displacement ? `${apiData.displacement}L` : null,
            cylinders: apiData.cylinders || null,
            fuelType: apiData.fuel_type || null,
            transmission: apiData.transmission || null,
            driveType: apiData.drive || null,
            cityMpg: apiData.city_mpg || null,
            highwayMpg: apiData.highway_mpg || null,
            combinedMpg: apiData.combination_mpg || null,
            vehicleClass: apiData.class || null,
            // Store recommended maintenance intervals
            maintenanceData: getMaintenanceIntervals(apiData),
            // Timestamp when data was fetched
            apiDataFetched: new Date().toISOString()
        };

        const response = await fetch(`${getApiUrl()}/api/vehicle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(enhancedVehicleData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Vehicle saved with API data:', result);
            return result;
        } else {
            throw new Error('Failed to save vehicle data');
        }
    } catch (error) {
        console.error('Error saving enhanced vehicle data:', error);
        throw error;
    }
}

// Update vehicle function
async function updateVehicle(vehicleId, vehicleData) {
    try {
        showLoading();
        
        const response = await fetch(`${getApiUrl()}/api/vehicle/${vehicleId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(vehicleData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Vehicle updated successfully:', result);
            showSuccess('Vehicle updated successfully');
            
            // Refresh dashboard and vehicle list
            if (document.getElementById('dashboard').style.display !== 'none') {
                loadDashboardData();
            }
            return result;
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update vehicle');
        }
    } catch (error) {
        console.error('Error updating vehicle:', error);
        showError(`Error updating vehicle: ${error.message}`);
        throw error;
    } finally {
        hideLoading();
    }
}

// Vehicle management functions
async function deleteVehicle(vehicleId) {
    if (!confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${getApiUrl()}/api/Vehicle/${vehicleId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            showSuccess('Vehicle deleted successfully!');
            loadDashboardData(); // Refresh the dashboard
        } else {
            const error = await response.text();
            showError('Failed to delete vehicle: ' + error);
        }
    } catch (error) {
        console.error('Delete vehicle error:', error);
        showError('Error deleting vehicle. Please try again.');
    }
}

// Get single vehicle for editing
async function getVehicle(vehicleId) {
    try {
        const response = await fetch(`${getApiUrl()}/api/vehicle/${vehicleId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const vehicle = await response.json();
            return vehicle;
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch vehicle');
        }
    } catch (error) {
        console.error('Error fetching vehicle:', error);
        showError(`Error fetching vehicle: ${error.message}`);
        throw error;
    }
}

// Show edit vehicle modal
function showEditVehicleModal(vehicleId) {
    // Get vehicle data and populate form for editing
    getVehicle(vehicleId).then(vehicle => {
        // Populate form with existing vehicle data
        document.getElementById('vehicleType').value = vehicle.vehicleType || '';
        document.getElementById('make').value = vehicle.make || '';
        document.getElementById('model').value = vehicle.model || '';
        document.getElementById('year').value = vehicle.year || '';
        document.getElementById('licensePlate').value = vehicle.licensePlate || '';
        document.getElementById('vin').value = vehicle.vin || '';
        
        // Store vehicle ID for update
        const form = document.getElementById('vehicleForm');
        form.dataset.vehicleId = vehicleId;
        form.dataset.mode = 'edit';
        
        // Update form title
        const modalTitle = document.querySelector('#vehicleModal h2');
        if (modalTitle) modalTitle.textContent = 'Edit Vehicle';
        
        // Show modal
        document.getElementById('vehicleModal').style.display = 'block';
    }).catch(error => {
        console.error('Error loading vehicle for edit:', error);
    });
}

// Reset form to create mode
function resetVehicleForm() {
    const form = document.getElementById('vehicleForm');
    if (form) {
        form.reset();
        delete form.dataset.vehicleId;
        delete form.dataset.mode;
        
        // Update form title back to create mode
        const modalTitle = document.querySelector('#vehicleModal h2');
        if (modalTitle) modalTitle.textContent = 'Add Vehicle';
    }
}

// Vehicle form management
function showVehicleForm() {
    console.log('Showing vehicle form');
    const glassContainer = document.querySelector('.glass-container');
    if (glassContainer) {
        glassContainer.style.display = 'block';
        // Scroll to the form
        glassContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

function hideVehicleForm() {
    console.log('Hiding vehicle form');
    const glassContainer = document.querySelector('.glass-container');
    if (glassContainer) {
        glassContainer.style.display = 'none';
    }
}

// Helper function to set up the Learn More button event listener
function setupLearnMoreButton(button) {
    console.log('Setting up learnMoreBtn event listener on:', button);
    button.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Learn More button clicked!');
        showLearnMoreModal();
    });
    console.log('Event listener added to learn more button');
}

// Learn More Modal Functions
function showLearnMoreModal() {
    console.log('Showing enhanced Learn More modal');
    closeAllModals();
    const modal = document.getElementById('learnMoreModal');
    if (modal) {
        modal.style.display = 'block';
        
        // Add entrance animation
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.transform = 'scale(0.8) translateY(-50px)';
            modalContent.style.opacity = '0';
            
            setTimeout(() => {
                modalContent.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                modalContent.style.transform = 'scale(1) translateY(0)';
                modalContent.style.opacity = '1';
            }, 50);
        }
        
        // Animate learning cards
        setTimeout(() => {
            const cards = modal.querySelectorAll('.learning-card');
            cards.forEach((card, index) => {
                card.style.transform = 'translateY(30px)';
                card.style.opacity = '0';
                
                setTimeout(() => {
                    card.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    card.style.transform = 'translateY(0)';
                    card.style.opacity = '1';
                }, index * 150);
            });
        }, 200);
    }
}

function startQuickTour() {
    console.log('Starting enhanced quick tour');
    closeAllModals();
    const modal = document.getElementById('quickTourModal');
    if (modal) {
        modal.style.display = 'block';
        currentTourStep = 1;
        updateTourProgress();
        showTourStep(1);
        
        // Add entrance animation
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.transform = 'scale(0.9) rotateY(-15deg)';
            modalContent.style.opacity = '0';
            
            setTimeout(() => {
                modalContent.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                modalContent.style.transform = 'scale(1) rotateY(0deg)';
                modalContent.style.opacity = '1';
            }, 50);
        }
    }
}

function showGettingStarted() {
    console.log('Showing enhanced getting started guide');
    closeAllModals();
    const modal = document.getElementById('gettingStartedModal');
    if (modal) {
        modal.style.display = 'block';
        
        // Add entrance animation
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.transform = 'scale(0.95) translateX(-30px)';
            modalContent.style.opacity = '0';
            
            setTimeout(() => {
                modalContent.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                modalContent.style.transform = 'scale(1) translateX(0)';
                modalContent.style.opacity = '1';
            }, 50);
        }
        
        // Animate guide steps
        setTimeout(() => {
            const steps = modal.querySelectorAll('.guide-step');
            steps.forEach((step, index) => {
                step.style.transform = 'translateX(-50px)';
                step.style.opacity = '0';
                
                setTimeout(() => {
                    step.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    step.style.transform = 'translateX(0)';
                    step.style.opacity = '1';
                }, index * 200);
            });
        }, 300);
    }
}

function showFeatureOverview() {
    console.log('Showing enhanced feature overview');
    closeAllModals();
    const modal = document.getElementById('featureOverviewModal');
    if (modal) {
        modal.style.display = 'block';
        
        // Add entrance animation
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.transform = 'scale(0.9) translateY(50px)';
            modalContent.style.opacity = '0';
            
            setTimeout(() => {
                modalContent.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                modalContent.style.transform = 'scale(1) translateY(0)';
                modalContent.style.opacity = '1';
            }, 50);
        }
        
        // Animate feature cards in a staggered way
        setTimeout(() => {
            const cards = modal.querySelectorAll('.feature-card');
            cards.forEach((card, index) => {
                card.style.transform = 'scale(0.8) rotateY(20deg)';
                card.style.opacity = '0';
                
                setTimeout(() => {
                    card.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    card.style.transform = 'scale(1) rotateY(0deg)';
                    card.style.opacity = '1';
                }, index * 100);
            });
        }, 400);
    }
}

// Enhanced Tour Progress and Step Management
let currentTourStep = 1;
const totalTourSteps = 4;

function updateTourProgress() {
    const progressFill = document.getElementById('tourProgress');
    const tourTitle = document.getElementById('tourTitle');
    
    if (progressFill) {
        const percentage = (currentTourStep / totalTourSteps) * 100;
        progressFill.style.width = `${percentage}%`;
    }
    
    if (tourTitle) {
        tourTitle.textContent = `🎯 Quick Tour - Step ${currentTourStep} of ${totalTourSteps}`;
    }
    
    // Update navigation buttons
    const prevBtn = document.getElementById('tourPrev');
    const nextBtn = document.getElementById('tourNext');
    
    if (prevBtn) {
        prevBtn.disabled = currentTourStep === 1;
    }
    
    if (nextBtn) {
        nextBtn.textContent = currentTourStep === totalTourSteps ? 'Finish ✨' : 'Next ➡️';
    }
}

function showTourStep(step) {
    const tourStep = document.getElementById('tourStep');
    if (!tourStep) return;
    
    const steps = {
        1: {
            title: "🚗 Welcome to VMIS",
            content: `
                <div style="text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">🎉</div>
                    <h3 style="color: #FFD700; font-size: 2rem; margin-bottom: 20px;">Welcome to Your Vehicle Management Journey!</h3>
                    <p style="font-size: 1.2rem; line-height: 1.6; color: rgba(255,255,255,0.9);">
                        VMIS helps you track maintenance, manage insurance, and keep your vehicles running smoothly. 
                        Let's take a quick tour of the amazing features waiting for you!
                    </p>
                </div>
            `
        },
        2: {
            title: "📊 Dashboard Overview",
            content: `
                <div style="text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">📊</div>
                    <h3 style="color: #FFD700; font-size: 2rem; margin-bottom: 20px;">Your Personal Dashboard</h3>
                    <p style="font-size: 1.2rem; line-height: 1.6; color: rgba(255,255,255,0.9);">
                        View all your vehicles at a glance, track maintenance reminders, and see recent activity. 
                        Your dashboard is the command center for all your vehicle management needs.
                    </p>
                </div>
            `
        },
        3: {
            title: "🔍 Vehicle Lookup",
            content: `
                <div style="text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">🔍</div>
                    <h3 style="color: #FFD700; font-size: 2rem; margin-bottom: 20px;">Smart Vehicle Lookup</h3>
                    <p style="font-size: 1.2rem; line-height: 1.6; color: rgba(255,255,255,0.9);">
                        Get detailed specifications, maintenance schedules, and recommendations for any vehicle. 
                        Our database contains information for thousands of makes and models!
                    </p>
                </div>
            `
        },
        4: {
            title: "🎯 Ready to Start!",
            content: `
                <div style="text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">🚀</div>
                    <h3 style="color: #FFD700; font-size: 2rem; margin-bottom: 20px;">You're All Set!</h3>
                    <p style="font-size: 1.2rem; line-height: 1.6; color: rgba(255,255,255,0.9);">
                        You now know the basics of VMIS. Ready to add your first vehicle and start managing 
                        your fleet like a pro? Let's get started!
                    </p>
                </div>
            `
        }
    };
    
    const stepData = steps[step];
    if (stepData) {
        // Animate step transition
        tourStep.style.transform = 'translateX(30px)';
        tourStep.style.opacity = '0';
        
        setTimeout(() => {
            tourStep.innerHTML = stepData.content;
            tourStep.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            tourStep.style.transform = 'translateX(0)';
            tourStep.style.opacity = '1';
        }, 200);
    }
}

// Enhanced Modal Closing with Animation
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (modal.style.display === 'block') {
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.transition = 'all 0.3s ease';
                modalContent.style.transform = 'scale(0.95)';
                modalContent.style.opacity = '0';
                
                setTimeout(() => {
                    modal.style.display = 'none';
                    // Reset transform for next time
                    modalContent.style.transform = '';
                    modalContent.style.opacity = '';
                    modalContent.style.transition = '';
                }, 300);
            } else {
                modal.style.display = 'none';
            }
        }
    });
}