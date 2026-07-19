const API_BASE = 'http://127.0.0.1:8000';

function getServiceImage(category) {
    const cat = category.toLowerCase();
    if (cat.includes('hair') && cat.includes('spa')) {
        return 'images/hair_spa.png';
    } else if (cat.includes('cut') || cat.includes('style') || cat.includes('color') || cat.includes('hair')) {
        return 'images/haircut.png';
    } else if (cat.includes('massage')) {
        return 'images/massage.png';
    } else if (cat.includes('pedi')) {
        return 'images/pedicure.png';
    } else if (cat.includes('mani')) {
        return 'images/manicure.png';
    } else if (cat.includes('facial') || cat.includes('skin')) {
        return 'images/facial_care.png';
    } else {
        return 'images/services_spa.png'; // Fallback for general spa
    }
}

// --- Shared Utility Functions ---
async function apiFetch(endpoint, options = {}) {
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };
    
    // Set headers
    options.headers = {
        ...defaultHeaders,
        ...options.headers,
    };
    
    // Stringify body if it's an object
    if (options.body && typeof options.body === 'object') {
        options.body = JSON.stringify(options.body);
    }
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! Status: ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error(`API Fetch Error [${endpoint}]:`, error);
        throw error;
    }
}

// Authentication check
function getAuth() {
    const userStr = localStorage.getItem('auth_user');
    return userStr ? JSON.parse(userStr) : null;
}

function setAuth(user) {
    if (user) {
        localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
        localStorage.removeItem('auth_user');
    }
}

function logout() {
    setAuth(null);
    window.location.href = 'index.html';
}

// Update NavBar based on login state
function updateNavBar() {
    const auth = getAuth();
    const navLinks = document.getElementById('nav-links-list');
    if (!navLinks) return;
    
    let html = `
        <li><a href="index.html" id="nav-home">Home</a></li>
        <li><a href="services.html" id="nav-services">Services</a></li>
        <li><a href="stylists.html" id="nav-stylists">Stylists</a></li>
    `;
    
    if (auth) {
        if (auth.role === 'admin') {
            html += `
                <li><a href="admin_dashboard.html" id="nav-admin">Admin Dashboard</a></li>
                <li><button onclick="logout()" class="btn btn-secondary">Logout (${auth.full_name})</button></li>
            `;
        } else {
            html += `
                <li><a href="booking.html" id="nav-book" class="btn btn-primary" style="padding: 0.4rem 1rem;">Book Now</a></li>
                <li><a href="customer_dashboard.html" id="nav-dashboard">My Dashboard</a></li>
                <li><button onclick="logout()" class="btn btn-secondary">Logout (${auth.full_name})</button></li>
            `;
        }
    } else {
        html += `
            <li><a href="login.html" id="nav-login" class="btn btn-secondary">Login</a></li>
            <li><a href="register.html" id="nav-register" class="btn btn-primary">Register</a></li>
        `;
    }
    
    navLinks.innerHTML = html;
    
    // Set active link highlight
    const path = window.location.pathname;
    const pageName = path.substring(path.lastIndexOf('/') + 1);
    
    if (pageName === 'index.html' || pageName === '') {
        document.getElementById('nav-home')?.classList.add('active');
    } else if (pageName === 'services.html') {
        document.getElementById('nav-services')?.classList.add('active');
    } else if (pageName === 'stylists.html') {
        document.getElementById('nav-stylists')?.classList.add('active');
    } else if (pageName === 'booking.html') {
        document.getElementById('nav-book')?.classList.add('active');
    } else if (pageName === 'customer_dashboard.html') {
        document.getElementById('nav-dashboard')?.classList.add('active');
    } else if (pageName === 'admin_dashboard.html') {
        document.getElementById('nav-admin')?.classList.add('active');
    }
}

// Redirect helpers
function requireAuth(role = 'customer') {
    const auth = getAuth();
    if (!auth) {
        window.location.href = 'login.html';
        return false;
    }
    if (role && auth.role !== role) {
        if (auth.role === 'admin') {
            window.location.href = 'admin_dashboard.html';
        } else {
            window.location.href = 'customer_dashboard.html';
        }
        return false;
    }
    return true;
}

// --- Page Specific Loader Scripts ---
document.addEventListener('DOMContentLoaded', () => {
    updateNavBar();
    
    const path = window.location.pathname;
    const pageName = path.substring(path.lastIndexOf('/') + 1);
    
    if (pageName === 'index.html' || pageName === '') {
        initHomePage();
    } else if (pageName === 'login.html') {
        initLoginPage();
    } else if (pageName === 'register.html') {
        initRegisterPage();
    } else if (pageName === 'services.html') {
        initServicesPage();
    } else if (pageName === 'stylists.html') {
        initStylistsPage();
    } else if (pageName === 'booking.html') {
        initBookingPage();
    } else if (pageName === 'payment.html') {
        initPaymentPage();
    } else if (pageName === 'customer_dashboard.html') {
        initCustomerDashboard();
    } else if (pageName === 'admin_dashboard.html') {
        initAdminDashboard();
    }
});

// --- Home Page ---
async function initHomePage() {
    try {
        // Load featured services (show first 3)
        const services = await apiFetch('/services/');
        const servicesGrid = document.getElementById('featured-services-grid');
        if (servicesGrid) {
            servicesGrid.innerHTML = services.slice(0, 3).map(s => `
                <div class="card">
                    <span class="card-category">${s.category}</span>
                    <div class="card-img">
                        <img src="${getServiceImage(s.category)}" alt="${s.service_name}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div class="card-body">
                        <h3 class="card-title">${s.service_name}</h3>
                        <p class="card-text">${s.description || 'No description available.'}</p>
                        <div class="card-meta">
                            <span class="card-price">₹${s.price}</span>
                            <span class="card-duration">🕒 ${s.duration} Mins</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        // Load popular stylists
        const stylists = await apiFetch('/stylists/');
        const stylistsGrid = document.getElementById('popular-stylists-grid');
        if (stylistsGrid) {
            stylistsGrid.innerHTML = stylists.slice(0, 3).map(st => {
                const initials = st.stylist_name.split(' ').map(n => n[0]).join('');
                return `
                <div class="card" style="padding: 1.5rem;">
                    <span class="status-badge status-${st.availability}">${st.availability}</span>
                    <div class="stylist-header">
                        <div class="stylist-avatar">${initials}</div>
                        <div class="stylist-info">
                            <h3>${st.stylist_name}</h3>
                            <span class="stylist-experience">${st.experience} Years Exp</span>
                        </div>
                    </div>
                    <p class="card-text" style="margin-bottom: 0.5rem;"><strong>Specialization:</strong> ${st.specialization}</p>
                    <p class="card-text"><strong>Phone:</strong> ${st.phone}</p>
                </div>
            `;}).join('');
        }
        
        // Setup Book Button
        const heroBtn = document.getElementById('hero-book-btn');
        if (heroBtn) {
            heroBtn.addEventListener('click', () => {
                const auth = getAuth();
                if (auth) {
                    window.location.href = 'booking.html';
                } else {
                    window.location.href = 'login.html?redirect=booking.html';
                }
            });
        }
    } catch (e) {
        console.error("Home load failed", e);
    }
}

// --- Login Page ---
function initLoginPage() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;
    
    // Check if redirected from a page
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const errorDiv = document.getElementById('login-error');
        
        errorDiv.textContent = '';
        
        try {
            const result = await apiFetch('/login/', {
                method: 'POST',
                body: { email, password }
            });
            
            setAuth(result);
            
            // Redirect
            if (redirect) {
                window.location.href = redirect;
            } else if (result.role === 'admin') {
                window.location.href = 'admin_dashboard.html';
            } else {
                window.location.href = 'customer_dashboard.html';
            }
        } catch (err) {
            errorDiv.textContent = err.message || 'Invalid email or password.';
        }
    });
}

// --- Register Page ---
function initRegisterPage() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const gender = document.getElementById('gender').value;
        const password = document.getElementById('password').value.trim();
        const errorDiv = document.getElementById('register-error');
        
        errorDiv.textContent = '';
        
        try {
            // Register Customer
            await apiFetch('/customers/add/', {
                method: 'POST',
                body: {
                    full_name: name,
                    email: email,
                    phone: phone,
                    gender: gender,
                    password: password
                }
            });
            
            // Auto Login
            const loginResult = await apiFetch('/login/', {
                method: 'POST',
                body: { email, password }
            });
            
            setAuth(loginResult);
            window.location.href = 'customer_dashboard.html';
        } catch (err) {
            errorDiv.textContent = err.message || 'Registration failed. Try again.';
        }
    });
}

// --- Services Page ---
async function initServicesPage() {
    try {
        const services = await apiFetch('/services/');
        const grid = document.getElementById('services-grid');
        const filterContainer = document.getElementById('services-filter');
        if (!grid) return;
        
        // Generate category filters dynamically
        const categories = ['All', ...new Set(services.map(s => s.category))];
        if (filterContainer) {
            filterContainer.innerHTML = categories.map(cat => `
                <button class="filter-btn ${cat === 'All' ? 'active' : ''}" data-cat="${cat}">${cat}</button>
            `).join('');
            
            // Add click listeners to filter buttons
            filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    filterContainer.querySelector('.active').classList.remove('active');
                    btn.classList.add('active');
                    const selCat = btn.getAttribute('data-cat');
                    renderServiceCards(selCat === 'All' ? services : services.filter(s => s.category === selCat));
                });
            });
        }
        
        function renderServiceCards(list) {
            grid.innerHTML = list.map(s => `
                <div class="card">
                    <span class="card-category">${s.category}</span>
                    <div class="card-img">
                        <img src="${getServiceImage(s.category)}" alt="${s.service_name}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div class="card-body">
                        <h3 class="card-title">${s.service_name}</h3>
                        <p class="card-text">${s.description || 'Pamper yourself with our specialized treatment.'}</p>
                        <div class="card-meta">
                            <span class="card-price">₹${s.price}</span>
                            <span class="card-duration">🕒 ${s.duration} Mins</span>
                        </div>
                        <button onclick="bookNow('${s.service_name}', ${s.price})" class="btn btn-primary" style="margin-top: 1rem; width: 100%;">Book Now</button>
                    </div>
                </div>
            `).join('');
        }
        
        renderServiceCards(services);
    } catch (e) {
        console.error("Services load failed", e);
    }
}

// Book Now handler
window.bookNow = function(serviceName, price) {
    const auth = getAuth();
    if (!auth) {
        window.location.href = 'login.html?redirect=booking.html';
        return;
    }
    // Pre-save selection in session
    sessionStorage.setItem('pre_select_service', serviceName);
    sessionStorage.setItem('pre_select_price', price);
    window.location.href = 'booking.html';
};

// --- Stylists Page ---
async function initStylistsPage() {
    try {
        const stylists = await apiFetch('/stylists/');
        const grid = document.getElementById('stylists-grid');
        if (!grid) return;
        
        grid.innerHTML = stylists.map(st => {
            const initials = st.stylist_name.split(' ').map(n => n[0]).join('');
            return `
                <div class="card" style="padding: 2rem;">
                    <span class="status-badge status-${st.availability}">${st.availability}</span>
                    <div class="stylist-header">
                        <div class="stylist-avatar">${initials}</div>
                        <div class="stylist-info">
                            <h3>${st.stylist_name}</h3>
                            <span class="stylist-experience">${st.experience} Years Experience</span>
                        </div>
                    </div>
                    <p class="card-text" style="margin-bottom: 0.5rem;"><strong>Specialization:</strong> ${st.specialization}</p>
                    <p class="card-text" style="margin-bottom: 1.5rem;"><strong>Phone:</strong> ${st.phone}</p>
                    <button onclick="bookWithStylist('${st.stylist_name}')" class="btn btn-secondary" style="width: 100%;" ${st.availability !== 'Available' ? 'disabled' : ''}>
                        ${st.availability === 'Available' ? 'Book Appointment' : 'Unavailable'}
                    </button>
                </div>
            `;
        }).join('');
    } catch (e) {
        console.error("Stylists load failed", e);
    }
}

window.bookWithStylist = function(stylistName) {
    sessionStorage.setItem('pre_select_stylist', stylistName);
    window.location.href = 'booking.html';
};

// --- Booking Page ---
async function initBookingPage() {
    if (!requireAuth('customer')) return;
    
    const serviceSelect = document.getElementById('booking-service');
    const stylistSelect = document.getElementById('booking-stylist');
    const dateInput = document.getElementById('booking-date');
    const timeInput = document.getElementById('booking-time');
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    
    try {
        // Load services and stylists
        const [services, stylists] = await Promise.all([
            apiFetch('/services/'),
            apiFetch('/stylists/')
        ]);
        
        // Filter stylists to only show available
        const availableStylists = stylists.filter(s => s.availability === 'Available');
        
        // Populate services
        serviceSelect.innerHTML = '<option value="">-- Choose Service --</option>' + 
            services.map(s => `<option value="${s.service_name}" data-price="${s.price}" data-duration="${s.duration}">${s.service_name} (₹${s.price})</option>`).join('');
            
        // Populate stylists
        stylistSelect.innerHTML = '<option value="">-- Choose Stylist --</option>' + 
            availableStylists.map(s => `<option value="${s.stylist_name}">${s.stylist_name} (${s.specialization})</option>`).join('');
            
        // Pre-fill if sessionStorage has pre-selections
        const preService = sessionStorage.getItem('pre_select_service');
        const preStylist = sessionStorage.getItem('pre_select_stylist');
        
        if (preService) {
            serviceSelect.value = preService;
            sessionStorage.removeItem('pre_select_service');
        }
        if (preStylist) {
            stylistSelect.value = preStylist;
            sessionStorage.removeItem('pre_select_stylist');
        }
        
        // Update summary elements
        const summaryService = document.getElementById('sum-service');
        const summaryStylist = document.getElementById('sum-stylist');
        const summaryDate = document.getElementById('sum-date');
        const summaryTime = document.getElementById('sum-time');
        const summaryDuration = document.getElementById('sum-duration');
        const summaryTotal = document.getElementById('sum-total');
        
        function updateSummary() {
            const selectedOpt = serviceSelect.options[serviceSelect.selectedIndex];
            const serviceVal = serviceSelect.value;
            const stylistVal = stylistSelect.value;
            const dateVal = dateInput.value;
            const timeVal = timeInput.value;
            
            let price = 0;
            let duration = 0;
            if (selectedOpt && serviceVal) {
                price = parseFloat(selectedOpt.getAttribute('data-price')) || 0;
                duration = parseInt(selectedOpt.getAttribute('data-duration')) || 0;
            }
            
            summaryService.textContent = serviceVal || 'Not Selected';
            summaryStylist.textContent = stylistVal || 'Not Selected';
            summaryDate.textContent = dateVal || 'Not Selected';
            summaryTime.textContent = timeVal || 'Not Selected';
            summaryDuration.textContent = duration ? `${duration} Mins` : 'Not Selected';
            summaryTotal.textContent = `₹${price}`;
            
            // Return variables for booking
            return { serviceVal, stylistVal, dateVal, timeVal, price };
        }
        
        // Listeners
        serviceSelect.addEventListener('change', updateSummary);
        stylistSelect.addEventListener('change', updateSummary);
        dateInput.addEventListener('change', updateSummary);
        timeInput.addEventListener('change', updateSummary);
        
        updateSummary();
        
        // Submit handler
        const confirmBtn = document.getElementById('confirm-booking-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', async () => {
                const { serviceVal, stylistVal, dateVal, timeVal, price } = updateSummary();
                const errorDiv = document.getElementById('booking-error');
                if (errorDiv) errorDiv.textContent = '';
                
                if (!serviceVal || !stylistVal || !dateVal || !timeVal) {
                    if (errorDiv) errorDiv.textContent = 'Please fill out all booking fields.';
                    return;
                }
                
                const auth = getAuth();
                
                // Temp save booking data to pass to payment page
                const bookingDetails = {
                    customer_name: auth.full_name,
                    stylist_name: stylistVal,
                    service_name: serviceVal,
                    appointment_date: dateVal,
                    appointment_time: timeVal,
                    total_amount: price,
                    appointment_status: 'Booked' // Default
                };
                
                localStorage.setItem('pending_booking', JSON.stringify(bookingDetails));
                window.location.href = 'payment.html';
            });
        }
    } catch (e) {
        console.error("Booking page load failed", e);
    }
}

// --- Payment Page ---
function initPaymentPage() {
    if (!requireAuth('customer')) return;
    
    const bookingDetailsStr = localStorage.getItem('pending_booking');
    if (!bookingDetailsStr) {
        window.location.href = 'booking.html';
        return;
    }
    
    const details = JSON.parse(bookingDetailsStr);
    
    // Fill out payment page UI fields
    const paymentAmount = document.getElementById('payment-amount');
    const paymentService = document.getElementById('payment-service');
    const paymentStylist = document.getElementById('payment-stylist');
    const paymentDateTime = document.getElementById('payment-datetime');
    
    if (paymentAmount) paymentAmount.textContent = `₹${details.total_amount}`;
    if (paymentService) paymentService.textContent = details.service_name;
    if (paymentStylist) paymentStylist.textContent = details.stylist_name;
    if (paymentDateTime) paymentDateTime.textContent = `${details.appointment_date} at ${details.appointment_time}`;
    
    const payBtn = document.getElementById('pay-now-btn');
    if (payBtn) {
        payBtn.addEventListener('click', async () => {
            const method = document.getElementById('payment-method').value;
            const errorDiv = document.getElementById('payment-error');
            if (errorDiv) errorDiv.textContent = '';
            
            try {
                // 1. Create Appointment in Backend
                const appResult = await apiFetch('/appointments/add/', {
                    method: 'POST',
                    body: details
                });
                
                // 2. Create Payment Transaction in Backend
                const paymentDetails = {
                    customer_name: details.customer_name,
                    appointment_id: appResult.appointment_id,
                    amount: details.total_amount,
                    payment_method: method,
                    payment_status: 'Paid', // Assuming success on mock submit
                    payment_date: new Date().toISOString().split('T')[0]
                };
                
                await apiFetch('/payments/add/', {
                    method: 'POST',
                    body: paymentDetails
                });
                
                // Success! Clear pending storage
                localStorage.removeItem('pending_booking');
                
                // Show success modal or alert
                alert('Payment Successful! Your appointment is confirmed.');
                window.location.href = 'customer_dashboard.html';
            } catch (err) {
                if (errorDiv) errorDiv.textContent = err.message || 'Payment processing failed. Please try again.';
            }
        });
    }
}

// --- Customer Dashboard ---
async function initCustomerDashboard() {
    if (!requireAuth('customer')) return;
    
    const auth = getAuth();
    document.getElementById('cust-name').textContent = auth.full_name;
    document.getElementById('cust-email').textContent = auth.email;
    document.getElementById('cust-phone').textContent = auth.phone;
    
    try {
        const [allAppointments, allPayments] = await Promise.all([
            apiFetch('/appointments/'),
            apiFetch('/payments/')
        ]);
        
        // Filter elements matching current customer name
        const myAppointments = allAppointments.filter(app => app.customer_name === auth.full_name);
        const myPayments = allPayments.filter(p => p.customer_name === auth.full_name);
        
        // Sort appointments by date & time descending
        myAppointments.sort((a, b) => {
            const d1 = new Date(`${a.appointment_date}T${a.appointment_time}`);
            const d2 = new Date(`${b.appointment_date}T${b.appointment_time}`);
            return d2 - d1;
        });
        
        // 1. Upcoming Appointments
        const upcomingContainer = document.getElementById('upcoming-appointments-list');
        const upcomingList = myAppointments.filter(a => a.appointment_status === 'Booked');
        
        if (upcomingContainer) {
            if (upcomingList.length === 0) {
                upcomingContainer.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">No upcoming appointments.</td></tr>';
            } else {
                upcomingContainer.innerHTML = upcomingList.map(a => `
                    <tr>
                        <td><strong>#${a.appointment_id}</strong></td>
                        <td>${a.service_name}</td>
                        <td>${a.stylist_name}</td>
                        <td>${a.appointment_date} @ ${a.appointment_time}</td>
                        <td>
                            <button onclick="cancelAppointment(${a.appointment_id})" class="btn btn-danger" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;">Cancel</button>
                        </td>
                    </tr>
                `).join('');
            }
        }
        
        // 2. Completed Services
        const completedContainer = document.getElementById('completed-services-list');
        const completedList = myAppointments.filter(a => a.appointment_status === 'Completed');
        
        if (completedContainer) {
            if (completedList.length === 0) {
                completedContainer.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-secondary);">No service history found.</td></tr>';
            } else {
                completedContainer.innerHTML = completedList.map(a => `
                    <tr>
                        <td><strong>#${a.appointment_id}</strong></td>
                        <td>${a.service_name}</td>
                        <td>${a.stylist_name}</td>
                        <td>${a.appointment_date}</td>
                    </tr>
                `).join('');
            }
        }
        
        // 3. Payment History
        const paymentContainer = document.getElementById('payment-history-list');
        if (paymentContainer) {
            if (myPayments.length === 0) {
                paymentContainer.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">No billing records.</td></tr>';
            } else {
                paymentContainer.innerHTML = myPayments.map(p => `
                    <tr>
                        <td><strong>#${p.payment_id}</strong></td>
                        <td>Appt #${p.appointment_id}</td>
                        <td>₹${p.amount}</td>
                        <td>${p.payment_method}</td>
                        <td><span class="badge badge-success">${p.payment_status}</span></td>
                    </tr>
                `).join('');
            }
        }
    } catch (e) {
        console.error("Dashboard fetch failed", e);
    }
}

// Cancel booking helper
window.cancelAppointment = async function(id) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
        // Fetch current appointment
        const app = await apiFetch(`/appointments/`);
        const item = app.find(a => a.appointment_id === id);
        
        if (item) {
            item.appointment_status = 'Cancelled';
            // Send PUT update
            await apiFetch(`/appointments/update/${id}/`, {
                method: 'PUT',
                body: item
            });
            alert('Appointment cancelled successfully.');
            initCustomerDashboard();
        }
    } catch (e) {
        alert('Failed to cancel appointment: ' + e.message);
    }
};

// --- Admin Dashboard ---
let activeAdminTab = 'customers';
let serviceToEdit = null;
let stylistToEdit = null;

async function initAdminDashboard() {
    if (!requireAuth('admin')) return;
    
    // Tab switching
    const tabs = ['customers', 'services', 'stylists', 'appointments', 'payments'];
    tabs.forEach(t => {
        document.getElementById(`tab-link-${t}`)?.addEventListener('click', () => {
            tabs.forEach(x => {
                document.getElementById(`tab-link-${x}`).classList.remove('active');
                document.getElementById(`tab-content-${x}`).style.display = 'none';
            });
            document.getElementById(`tab-link-${t}`).classList.add('active');
            document.getElementById(`tab-content-${t}`).style.display = 'block';
            activeAdminTab = t;
            loadAdminData();
        });
    });
    
    loadAdminData();
    setupAdminActionListeners();
}

async function loadAdminData() {
    try {
        const [customers, services, stylists, appointments, payments] = await Promise.all([
            apiFetch('/customers/'),
            apiFetch('/services/'),
            apiFetch('/stylists/'),
            apiFetch('/appointments/'),
            apiFetch('/payments/')
        ]);
        
        // Update stats
        document.getElementById('stat-total-revenue').textContent = `₹${payments.reduce((acc, p) => p.payment_status === 'Paid' ? acc + p.amount : acc, 0)}`;
        document.getElementById('stat-total-appointments').textContent = appointments.length;
        document.getElementById('stat-active-stylists').textContent = stylists.filter(s => s.availability === 'Available').length;
        document.getElementById('stat-total-services').textContent = services.length;
        
        // Render Active Tab Table
        if (activeAdminTab === 'customers') {
            const list = document.getElementById('admin-customers-list');
            list.innerHTML = customers.map(c => `
                <tr>
                    <td><strong>#${c.customer_id}</strong></td>
                    <td>${c.full_name}</td>
                    <td>${c.email}</td>
                    <td>${c.phone}</td>
                    <td>${c.gender}</td>
                    <td>
                        <button onclick="deleteCustomer(${c.customer_id})" class="btn btn-danger" style="padding: 0.2rem 0.6rem; font-size: 0.8rem;">Delete</button>
                    </td>
                </tr>
            `).join('');
        } else if (activeAdminTab === 'services') {
            const list = document.getElementById('admin-services-list');
            list.innerHTML = services.map(s => `
                <tr>
                    <td><strong>#${s.service_id}</strong></td>
                    <td>${s.service_name}</td>
                    <td>${s.category}</td>
                    <td>${s.duration} mins</td>
                    <td>₹${s.price}</td>
                    <td>
                        <button onclick="openServiceModal(${s.service_id})" class="btn btn-secondary" style="padding: 0.2rem 0.6rem; font-size: 0.8rem; margin-right: 0.3rem;">Edit</button>
                        <button onclick="deleteService(${s.service_id})" class="btn btn-danger" style="padding: 0.2rem 0.6rem; font-size: 0.8rem;">Delete</button>
                    </td>
                </tr>
            `).join('');
        } else if (activeAdminTab === 'stylists') {
            const list = document.getElementById('admin-stylists-list');
            list.innerHTML = stylists.map(st => `
                <tr>
                    <td><strong>#${st.stylist_id}</strong></td>
                    <td>${st.stylist_name}</td>
                    <td>${st.specialization}</td>
                    <td>${st.experience} Years</td>
                    <td><span class="badge status-${st.availability}">${st.availability}</span></td>
                    <td>
                        <button onclick="openStylistModal(${st.stylist_id})" class="btn btn-secondary" style="padding: 0.2rem 0.6rem; font-size: 0.8rem; margin-right: 0.3rem;">Edit</button>
                        <button onclick="deleteStylist(${st.stylist_id})" class="btn btn-danger" style="padding: 0.2rem 0.6rem; font-size: 0.8rem;">Delete</button>
                    </td>
                </tr>
            `).join('');
        } else if (activeAdminTab === 'appointments') {
            const list = document.getElementById('admin-appointments-list');
            list.innerHTML = appointments.map(a => `
                <tr>
                    <td><strong>#${a.appointment_id}</strong></td>
                    <td>${a.customer_name}</td>
                    <td>${a.service_name}</td>
                    <td>${a.stylist_name}</td>
                    <td>${a.appointment_date} ${a.appointment_time}</td>
                    <td>₹${a.total_amount}</td>
                    <td>
                        <span class="badge badge-${a.appointment_status === 'Completed' ? 'success' : a.appointment_status === 'Cancelled' ? 'danger' : 'warning'}">
                            ${a.appointment_status}
                        </span>
                    </td>
                    <td>
                        <select onchange="updateAppointmentStatus(${a.appointment_id}, this.value)" class="form-input" style="padding: 0.25rem 0.5rem; font-size: 0.85rem; width: auto; display: inline-block;">
                            <option value="Booked" ${a.appointment_status === 'Booked' ? 'selected' : ''}>Booked</option>
                            <option value="Completed" ${a.appointment_status === 'Completed' ? 'selected' : ''}>Completed</option>
                            <option value="Cancelled" ${a.appointment_status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                        <button onclick="deleteAppointment(${a.appointment_id})" class="btn btn-danger" style="padding: 0.2rem 0.6rem; font-size: 0.8rem; margin-left: 0.3rem;">Delete</button>
                    </td>
                </tr>
            `).join('');
        } else if (activeAdminTab === 'payments') {
            const list = document.getElementById('admin-payments-list');
            list.innerHTML = payments.map(p => `
                <tr>
                    <td><strong>#${p.payment_id}</strong></td>
                    <td>${p.customer_name}</td>
                    <td>Appt #${p.appointment_id}</td>
                    <td>₹${p.amount}</td>
                    <td>${p.payment_method}</td>
                    <td>
                        <select onchange="updatePaymentStatus(${p.payment_id}, this.value)" class="form-input" style="padding: 0.25rem 0.5rem; font-size: 0.85rem; width: auto; display: inline-block;">
                            <option value="Paid" ${p.payment_status === 'Paid' ? 'selected' : ''}>Paid</option>
                            <option value="Pending" ${p.payment_status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Failed" ${p.payment_status === 'Failed' ? 'selected' : ''}>Failed</option>
                        </select>
                    </td>
                    <td>
                        <button onclick="deletePayment(${p.payment_id})" class="btn btn-danger" style="padding: 0.2rem 0.6rem; font-size: 0.8rem;">Delete</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (e) {
        console.error("Failed to load admin lists", e);
    }
}

// --- Delete Helpers ---
window.deleteCustomer = async function(id) {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
        await apiFetch(`/customers/delete/${id}/`, { method: 'DELETE' });
        loadAdminData();
    } catch (e) { alert(e.message); }
};

window.deleteService = async function(id) {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
        await apiFetch(`/services/delete/${id}/`, { method: 'DELETE' });
        loadAdminData();
    } catch (e) { alert(e.message); }
};

window.deleteStylist = async function(id) {
    if (!confirm('Are you sure you want to delete this stylist?')) return;
    try {
        await apiFetch(`/stylists/delete/${id}/`, { method: 'DELETE' });
        loadAdminData();
    } catch (e) { alert(e.message); }
};

window.deleteAppointment = async function(id) {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    try {
        await apiFetch(`/appointments/delete/${id}/`, { method: 'DELETE' });
        loadAdminData();
    } catch (e) { alert(e.message); }
};

window.deletePayment = async function(id) {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    try {
        await apiFetch(`/payments/delete/${id}/`, { method: 'DELETE' });
        loadAdminData();
    } catch (e) { alert(e.message); }
};

// --- Edit Status Helpers ---
window.updateAppointmentStatus = async function(id, val) {
    try {
        const apps = await apiFetch('/appointments/');
        const app = apps.find(a => a.appointment_id === id);
        if (app) {
            app.appointment_status = val;
            await apiFetch(`/appointments/update/${id}/`, { method: 'PUT', body: app });
            loadAdminData();
        }
    } catch (e) { alert(e.message); }
};

window.updatePaymentStatus = async function(id, val) {
    try {
        const payList = await apiFetch('/payments/');
        const pay = payList.find(p => p.payment_id === id);
        if (pay) {
            pay.payment_status = val;
            await apiFetch(`/payments/update/${id}/`, { method: 'PUT', body: pay });
            loadAdminData();
        }
    } catch (e) { alert(e.message); }
};

// --- Modal Handlers ---
window.openServiceModal = async function(id = null) {
    const modal = document.getElementById('service-modal');
    const title = document.getElementById('service-modal-title');
    
    // Reset Form
    document.getElementById('service-form').reset();
    serviceToEdit = id;
    
    if (id) {
        title.textContent = 'Edit Service';
        try {
            const list = await apiFetch('/services/');
            const item = list.find(s => s.service_id === id);
            if (item) {
                document.getElementById('srv-name').value = item.service_name;
                document.getElementById('srv-category').value = item.category;
                document.getElementById('srv-duration').value = item.duration;
                document.getElementById('srv-price').value = item.price;
                document.getElementById('srv-desc').value = item.description;
            }
        } catch (e) { console.error(e); }
    } else {
        title.textContent = 'Add Service';
    }
    
    modal.classList.add('active');
};

window.closeServiceModal = function() {
    document.getElementById('service-modal').classList.remove('active');
};

window.openStylistModal = async function(id = null) {
    const modal = document.getElementById('stylist-modal');
    const title = document.getElementById('stylist-modal-title');
    
    document.getElementById('stylist-form').reset();
    stylistToEdit = id;
    
    if (id) {
        title.textContent = 'Edit Stylist';
        try {
            const list = await apiFetch('/stylists/');
            const item = list.find(s => s.stylist_id === id);
            if (item) {
                document.getElementById('sty-name').value = item.stylist_name;
                document.getElementById('sty-spec').value = item.specialization;
                document.getElementById('sty-exp').value = item.experience;
                document.getElementById('sty-phone').value = item.phone;
                document.getElementById('sty-avail').value = item.availability;
            }
        } catch (e) { console.error(e); }
    } else {
        title.textContent = 'Add Stylist';
    }
    
    modal.classList.add('active');
};

window.closeStylistModal = function() {
    document.getElementById('stylist-modal').classList.remove('active');
};

// --- Setup Form Submission Listeners ---
function setupAdminActionListeners() {
    // Service Form Submit
    document.getElementById('service-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            service_name: document.getElementById('srv-name').value.trim(),
            category: document.getElementById('srv-category').value,
            duration: parseInt(document.getElementById('srv-duration').value),
            price: parseFloat(document.getElementById('srv-price').value),
            description: document.getElementById('srv-desc').value.trim()
        };
        
        try {
            if (serviceToEdit) {
                await apiFetch(`/services/update/${serviceToEdit}/`, {
                    method: 'PUT',
                    body: payload
                });
            } else {
                await apiFetch('/services/add/', {
                    method: 'POST',
                    body: payload
                });
            }
            closeServiceModal();
            loadAdminData();
        } catch (err) {
            alert('Service Operation Failed: ' + err.message);
        }
    });
    
    // Stylist Form Submit
    document.getElementById('stylist-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            stylist_name: document.getElementById('sty-name').value.trim(),
            specialization: document.getElementById('sty-spec').value.trim(),
            experience: parseInt(document.getElementById('sty-exp').value),
            phone: document.getElementById('sty-phone').value.trim(),
            availability: document.getElementById('sty-avail').value
        };
        
        try {
            if (stylistToEdit) {
                await apiFetch(`/stylists/update/${stylistToEdit}/`, {
                    method: 'PUT',
                    body: payload
                });
            } else {
                await apiFetch('/stylists/add/', {
                    method: 'POST',
                    body: payload
                });
            }
            closeStylistModal();
            loadAdminData();
        } catch (err) {
            alert('Stylist Operation Failed: ' + err.message);
        }
    });
}
