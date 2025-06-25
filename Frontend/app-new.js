// Configuration for different environments
const API_CONFIG = {
    development: 'https://localhost:5001',
    docker: 'http://localhost:5001',
    production: 'http://backend:80'
};

// Determine which API URL to use
function getApiUrl() {
    if (window.location.hostname === 'localhost' && window.location.port === '3000') {
        // Running in Docker (frontend on port 3000)
        return API_CONFIG.docker;
    } else if (window.location.hostname === 'localhost') {
        // Local development
        return API_CONFIG.development;
    } else {
        // Production (containers communicating internally)
        return API_CONFIG.production;
    }
}

// Global state
let currentUser = null;
let vehicleRecords = [];

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        currentUser = JSON.parse(user);
        updateUIForLoggedInUser();
    } else {
        updateUIForLoggedOutUser();
    }
}

function updateUIForLoggedInUser() {
    // Create user info bar
    createUserInfoBar();
    // Hide login button, show logout in user bar
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) loginBtn.style.display = 'none';
    
    // Load dashboard data
    loadDashboardData();
}

function updateUIForLoggedOutUser() {
    // Remove user info bar if exists
    const existingBar = document.querySelector('.user-info-bar');
    if (existingBar) existingBar.remove();
    
    // Show login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) loginBtn.style.display = 'inline-block';
    
    // Clear vehicle records
    vehicleRecords = [];
}

function createUserInfoBar() {
    // Remove existing bar if present
    const existingBar = document.querySelector('.user-info-bar');
    if (existingBar) existingBar.remove();
    
    const userBar = document.createElement('div');
    userBar.className = 'user-info-bar';
    userBar.innerHTML = `
        <div class="welcome-text">Welcome, ${currentUser ? currentUser.username : 'User'}!</div>
        <button class="logout-btn" onclick="logout()">Logout</button>
    `;
    document.body.insertBefore(userBar, document.body.firstChild);
}

function setupEventListeners() {
    // Modal functionality
    setupModalEvents();
    
    // Dashboard buttons
    document.getElementById('viewRecords').addEventListener('click', showViewRecordsModal);
    document.getElementById('addRecord').addEventListener('click', showAddRecordModal);
    document.getElementById('loginBtn').addEventListener('click', showLoginModal);
    
    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('addRecordForm').addEventListener('submit', handleAddRecord);
    
    // Vehicle type selection
    setupVehicleTypeSelection();
    
    // Filter functionality
    document.getElementById('vehicleTypeFilter').addEventListener('change', filterRecords);
    
    // Original form (keep existing functionality)
    document.getElementById("vehicleForm").addEventListener("submit", handleOriginalFormSubmit);
}

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

function setupVehicleTypeSelection() {
    const vehicleOptions = document.querySelectorAll('.vehicle-option');
    vehicleOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            vehicleOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            option.classList.add('selected');
            // Check the radio button
            const radio = option.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
        });
    });
}

// Modal Management
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function showRegisterModal() {
    closeAllModals();
    document.getElementById('registerModal').style.display = 'block';
}

function showViewRecordsModal() {
    if (!currentUser) {
        alert('Please login to view records');
        showLoginModal();
        return;
    }
    loadVehicleRecords();
    document.getElementById('viewRecordsModal').style.display = 'block';
}

function showAddRecordModal() {
    if (!currentUser) {
        alert('Please login to add records');
        showLoginModal();
        return;
    }
    document.getElementById('addRecordModal').style.display = 'block';
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.style.display = 'none');
}

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    try {
        showLoading('Logging in...');
        const response = await fetch(`${getApiUrl()}/api/Auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });
        
        const result = await response.json();
        hideLoading();
        
        if (response.ok) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            currentUser = result.user;
            closeAllModals();
            updateUIForLoggedInUser();
            showSuccess('Login successful!');
        } else {
            showError(result.error || 'Login failed');
        }
    } catch (error) {
        hideLoading();
        showError('Network error. Please try again.');
        console.error('Login error:', error);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const registerData = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    try {
        showLoading('Creating account...');
        const response = await fetch(`${getApiUrl()}/api/Auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData)
        });
        
        const result = await response.json();
        hideLoading();
        
        if (response.ok) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            currentUser = result.user;
            closeAllModals();
            updateUIForLoggedInUser();
            showSuccess('Registration successful!');
        } else {
            showError(result.error || 'Registration failed');
        }
    } catch (error) {
        hideLoading();
        showError('Network error. Please try again.');
        console.error('Registration error:', error);
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
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
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${getApiUrl()}/api/Vehicle/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            vehicleRecords = data.vehicles || [];
            updateDashboardSummary(data);
        }
    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}

function updateDashboardSummary(data) {
    const dashboard = document.getElementById('dashboard');
    const summaryHTML = `
        <h2>Dashboard</h2>
        <div class="dashboard-summary">
            <p><strong>Total Vehicles:</strong> ${data.vehicles ? data.vehicles.length : 0}</p>
            <p><strong>Upcoming Maintenance:</strong> ${data.upcomingMaintenance || 0}</p>
            <p><strong>Expired Insurance:</strong> ${data.expiredInsurance || 0}</p>
        </div>
        <p>View and manage your vehicle's maintenance and inspection records.</p>
        <button id="viewRecords">View Records</button>
        <button id="addRecord">Add Record</button>
        <button id="loginBtn">Login</button>
    `;
    dashboard.innerHTML = summaryHTML;
    
    // Re-attach event listeners for new buttons
    document.getElementById('viewRecords').addEventListener('click', showViewRecordsModal);
    document.getElementById('addRecord').addEventListener('click', showAddRecordModal);
    document.getElementById('loginBtn').addEventListener('click', showLoginModal);
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
        const vehicleResponse = await fetch(`${getApiUrl()}/api/Vehicle`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ownerName: vehicleData.ownerName,
                make: vehicleData.make,
                model: vehicleData.model,
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
    
    const formData = new FormData(e.target);
    
    const data = {
        ownerName: formData.get('ownerName'),
        make: formData.get('vehicleMake'),
        model: formData.get('vehicleModel'),
        year: new Date().getFullYear(), // Default to current year
        licensePlate: formData.get('licensePlate'),
        vehicleType: formData.get('vehicleType'),
        insuranceProvider: formData.get('insuranceProvider'),
        policyNumber: formData.get('policyNumber'),
        policyExpiration: formData.get('expirationDate'),
        maintenanceTask: formData.get('maintenanceTask'),
        maintenanceDate: formData.get('inspectionDate'),
        mileage: parseInt(formData.get('mileage'))
    };
    
    try {
        const apiUrl = getApiUrl();
        console.log('Submitting to API:', apiUrl);
        console.log('Data being sent:', data);
        
        const response = await fetch(`${apiUrl}/api/Vehicle/maintenance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(currentUser && localStorage.getItem('token') ? {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                } : {})
            },
            body: JSON.stringify({
                maintenanceTask: data.maintenanceTask,
                maintenanceDate: data.maintenanceDate,
                mileage: data.mileage,
                policyExpiration: data.policyExpiration
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Success result:', result);
        
        document.getElementById("dashboard").innerHTML = `
            <h3>Success!</h3>
            <p>Vehicle information saved successfully!</p>
            <p>Make: ${data.make}</p>
            <p>Model: ${data.model}</p>
            <p>Year: ${data.year}</p>
            <p>Maintenance Task: ${data.maintenanceTask}</p>
            <p>Maintenance Date: ${data.maintenanceDate}</p>
            ${data.policyNumber ? `<p>Policy Number: ${data.policyNumber}</p>` : ''}
            ${data.policyExpiration ? `<p>Policy Expiration: ${data.policyExpiration}</p>` : ''}
        `;
        
        e.target.reset();
        
    } catch (error) {
        console.error('Error submitting vehicle data:', error);
        document.getElementById("dashboard").innerHTML = `
            <h3>Error:</h3>
            <p>Unable to process your request. Please try again later.</p>
            <p>Error details: ${error.message}</p>
            <p>API URL: ${getApiUrl()}</p>
        `;
    }
}

// Utility Functions
function showLoading(message = 'Loading...') {
    // Remove existing loading
    hideLoading();
    
    const loading = document.createElement('div');
    loading.id = 'loadingIndicator';
    loading.className = 'loading';
    loading.innerHTML = `<p>${message}</p>`;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('loadingIndicator');
    if (loading) loading.remove();
}

function showError(message) {
    showMessage(message, 'error');
}

function showSuccess(message) {
    showMessage(message, 'success');
}

function showMessage(message, type) {
    // Remove existing messages
    document.querySelectorAll('.error, .success').forEach(el => el.remove());
    
    const messageEl = document.createElement('div');
    messageEl.className = type;
    messageEl.textContent = message;
    
    // Insert after header
    const header = document.querySelector('.app-header');
    header.parentNode.insertBefore(messageEl, header.nextSibling);
    
    // Auto remove after 5 seconds
    setTimeout(() => messageEl.remove(), 5000);
}

// Service selection functionality (keep existing)
function getServicesForType(type) {
    const serviceOptions = {
        car: [
            { name: "Oil Change", price: 50 },
            { name: "Tire Rotation", price: 30 },
            { name: "Brake Inspection", price: 40 }
        ],
        truck: [
            { name: "Transmission Check", price: 120 },
            { name: "Diesel Oil Change", price: 80 },
            { name: "Suspension Inspection", price: 70 }
        ],
        motorcycle: [
            { name: "Chain Adjustment", price: 25 },
            { name: "Brake Fluid Change", price: 35 },
            { name: "Engine Tune-Up", price: 60 }
        ]
    };
    return serviceOptions[type] || [];
}
