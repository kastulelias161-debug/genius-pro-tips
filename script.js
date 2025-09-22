// Supabase Configuration
const SUPABASE_URL = 'https://cdpubmvghgavnygbhbzd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcHVibXZnaGdhdm55Z2JoYnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MjQwNDcsImV4cCI6MjA3MzIwMDA0N30.IwBFtZ8vI7rZa3DOgxFbIckPkJ8JvSUw1zZlLy5n1Lg';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Supabase integration - no mock data needed

// Admin credentials
const ADMIN_CREDENTIALS = {
    username: 'Kastul',
    password: 'Kastul@10'
};

// Check if user is admin
let isAdmin = false;

// Auto-logout timer (10 minutes = 600,000 milliseconds)
let adminLogoutTimer = null;
const ADMIN_SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes

// Secret admin access key combination
let adminKeySequence = [];
const ADMIN_SECRET_KEY = ['k', 'a', 's', 't', 'u', 'l']; // Secret key: "kastul"

// Device detection
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768;
}

// Ten-tap detection for mobile
let lastTapTime = 0;
let tapCount = 0;
const REQUIRED_TAPS = 15; // Increased to 15 taps to prevent accidental activation

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    checkAdminStatus();
    initializeEventListeners();
    // setupSecretAdminAccess(); // Disabled - using dedicated admin panel at /admin
    setupRealtimeUpdates();
    setupSessionMonitoring();
    setupAdminActivityDetection();
    
    // Check if this is the admin page
    if (window.location.pathname.includes('admin.html')) {
        checkAdminPageAccess();
    }
});

// Setup admin activity detection to reset logout timer
function setupAdminActivityDetection() {
    // Reset timer on any admin activity
    document.addEventListener('click', function() {
        if (isAdmin) {
            resetAdminLogoutTimer();
        }
    });
    
    document.addEventListener('keydown', function() {
        if (isAdmin) {
            resetAdminLogoutTimer();
        }
    });
    
    document.addEventListener('touchstart', function() {
        if (isAdmin) {
            resetAdminLogoutTimer();
        }
    });
}

// Check admin status from sessionStorage with timeout
function checkAdminStatus() {
    const adminStatus = sessionStorage.getItem('isAdmin');
    const adminTimestamp = sessionStorage.getItem('adminTimestamp');
    
    if (adminStatus === 'true' && adminTimestamp) {
        const currentTime = Date.now();
        const sessionDuration = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
        
        // Check if session is still valid
        if (currentTime - parseInt(adminTimestamp) < sessionDuration) {
            isAdmin = true;
            showAdminFeatures();
            startAdminLogoutTimer();
        } else {
            // Session expired, clear admin status
            clearAdminSession();
        }
    }
}

// Start auto-logout timer
function startAdminLogoutTimer() {
    // Clear existing timer
    if (adminLogoutTimer) {
        clearTimeout(adminLogoutTimer);
    }
    
    // Set new timer for 10 minutes
    adminLogoutTimer = setTimeout(() => {
        logout();
        alert('Session expired. You have been automatically logged out for security.');
    }, ADMIN_SESSION_TIMEOUT);
}

// Reset auto-logout timer (call on any admin activity)
function resetAdminLogoutTimer() {
    if (isAdmin) {
        startAdminLogoutTimer();
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Admin login form
    const adminForm = document.getElementById('adminLoginForm');
    if (adminForm) {
        adminForm.addEventListener('submit', handleAdminLogin);
    }
}

// Setup secret admin access
function setupSecretAdminAccess() {
    if (isMobileDevice()) {
        // Mobile: Double-tap anywhere to open admin
        setupMobileAdminAccess();
    } else {
        // Desktop: Keyboard typing "kastul"
        setupDesktopAdminAccess();
    }
}

// Desktop admin access (keyboard typing)
function setupDesktopAdminAccess() {
    document.addEventListener('keydown', function(event) {
        // Only listen for letter keys
        if (event.key.length === 1 && event.key.match(/[a-z]/i)) {
            adminKeySequence.push(event.key.toLowerCase());
            
            // Keep only the last 6 keys
            if (adminKeySequence.length > ADMIN_SECRET_KEY.length) {
                adminKeySequence.shift();
            }
            
            // Check if sequence matches secret key
            if (adminKeySequence.length === ADMIN_SECRET_KEY.length) {
                if (adminKeySequence.every((key, index) => key === ADMIN_SECRET_KEY[index])) {
                    openAdminModal();
                    adminKeySequence = []; // Reset sequence
                }
            }
        }
    });
}

// Mobile admin access (15 taps in specific area)
function setupMobileAdminAccess() {
    // Only count taps in the header area to prevent accidental activation
    const header = document.querySelector('.header');
    
    if (header) {
        header.addEventListener('touchstart', function(event) {
            // Don't count taps on interactive elements
            if (event.target.closest('button') || 
                event.target.closest('a') || 
                event.target.closest('.mobile-menu-btn') ||
                event.target.closest('.mobile-nav') ||
                event.target.closest('.logo')) {
                return;
            }
            
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTapTime;
            
            // Allow up to 2 seconds between taps (shorter window)
            if (tapLength < 2000) {
                tapCount++;
                if (tapCount === REQUIRED_TAPS) {
                    openAdminModal();
                    tapCount = 0; // Reset counter only after success
                }
            } else {
                // Reset if too much time between taps
                tapCount = 1;
            }
            
            lastTapTime = currentTime;
        });
        
        // Also handle click events for devices that support both
        header.addEventListener('click', function(event) {
            // Don't count clicks on interactive elements
            if (event.target.closest('button') || 
                event.target.closest('a') || 
                event.target.closest('.mobile-menu-btn') ||
                event.target.closest('.mobile-nav') ||
                event.target.closest('.logo')) {
                return;
            }
            
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTapTime;
            
            // Allow up to 2 seconds between taps
            if (tapLength < 2000) {
                tapCount++;
                if (tapCount === REQUIRED_TAPS) {
                    openAdminModal();
                    tapCount = 0; // Reset counter only after success
                }
            } else {
                // Reset if too much time between taps
                tapCount = 1;
            }
            
            lastTapTime = currentTime;
        });
    }
}

// Setup real-time updates
function setupRealtimeUpdates() {
    const tipTypes = ['today', 'weekly', 'monthly', 'train'];
    
    tipTypes.forEach(type => {
        const tableName = `${type}_tips`;
        
        supabase
            .channel(`${tableName}_changes`)
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: tableName 
                }, 
                (payload) => {
                    console.log('Real-time update received:', payload);
                    
                    // Check if we're on the tips page for this type
                    const urlParams = new URLSearchParams(window.location.search);
                    const currentType = urlParams.get('type');
                    
                    if (currentType === type) {
                        // Reload the tips for this page
                        loadTipsPage();
                    }
                }
            )
            .subscribe();
    });
}

// Navigation function
function navigateToTips(type) {
    window.location.href = `tips.html?type=${type}`;
}

// Admin modal functions
// Admin modal functions - DISABLED (using dedicated admin panel at /admin)
/*
function openAdminModal() {
    document.getElementById('adminModal').style.display = 'block';
}

function closeAdminModal() {
    document.getElementById('adminModal').style.display = 'none';
    document.getElementById('adminLoginForm').reset();
}
*/

// Handle admin login
function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        isAdmin = true;
        const timestamp = Date.now();
        sessionStorage.setItem('isAdmin', 'true');
        sessionStorage.setItem('adminTimestamp', timestamp.toString());
        showAdminFeatures();
        startAdminLogoutTimer(); // Start auto-logout timer
        closeAdminModal();
        alert('Admin login successful! Session expires in 8 hours with 10-minute inactivity timeout.');
    } else {
        alert('Invalid credentials. Please try again.');
    }
}

// Show admin features
function showAdminFeatures() {
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutBtnMobile = document.getElementById('logoutBtnMobile');
    
    if (logoutBtn) {
        logoutBtn.style.display = 'block';
    }
    if (logoutBtnMobile) {
        logoutBtnMobile.style.display = 'block';
    }
}

// Clear admin session
function clearAdminSession() {
    isAdmin = false;
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('adminTimestamp');
    
    // Hide admin features
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutBtnMobile = document.getElementById('logoutBtnMobile');
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (logoutBtnMobile) logoutBtnMobile.style.display = 'none';
    
    // Hide admin panel if visible
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) adminPanel.style.display = 'none';
}

// Setup session monitoring
function setupSessionMonitoring() {
    // Check session validity every 5 minutes
    setInterval(() => {
        if (isAdmin) {
            const adminTimestamp = sessionStorage.getItem('adminTimestamp');
            if (adminTimestamp) {
                const currentTime = Date.now();
                const sessionDuration = 8 * 60 * 60 * 1000; // 8 hours
                
                if (currentTime - parseInt(adminTimestamp) >= sessionDuration) {
                    clearAdminSession();
                    alert('Admin session expired. Please login again.');
                    location.reload();
                }
            }
        }
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    // Clear session when browser is closed/refreshed
    window.addEventListener('beforeunload', function() {
        if (isAdmin) {
            // Optional: Add warning about unsaved changes
        }
    });
}

// Enhanced admin validation
function validateAdminAccess() {
    if (!isAdmin) return false;
    
    const adminStatus = sessionStorage.getItem('isAdmin');
    const adminTimestamp = sessionStorage.getItem('adminTimestamp');
    
    if (adminStatus !== 'true' || !adminTimestamp) {
        clearAdminSession();
        return false;
    }
    
    const currentTime = Date.now();
    const sessionDuration = 8 * 60 * 60 * 1000; // 8 hours
    
    if (currentTime - parseInt(adminTimestamp) >= sessionDuration) {
        clearAdminSession();
        return false;
    }
    
    return true;
}

// Check admin page access
function checkAdminPageAccess() {
    // If user is not admin, redirect to main site
    if (!isAdmin) {
        // Show login form (already handled by admin.html)
        return;
    } else {
        // User is admin, show dashboard
        showAdminDashboard();
    }
}

// Show admin dashboard (for admin.html)
function showAdminDashboard() {
    const loginSection = document.getElementById('adminLoginSection');
    const dashboard = document.getElementById('adminDashboard');
    
    if (loginSection) loginSection.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';
    
    // Load dashboard stats
    loadDashboardStats();
    
    // Load initial tips
    if (typeof loadTipsForManagement === 'function') {
        loadTipsForManagement();
    }
}

// Logout function
function logout() {
    clearAdminSession();
    
    // Clear auto-logout timer
    if (adminLogoutTimer) {
        clearTimeout(adminLogoutTimer);
        adminLogoutTimer = null;
    }
    
    // If on admin page, redirect to main site
    if (window.location.pathname.includes('admin.html')) {
        window.location.href = 'index.html';
    } else {
        location.reload();
    }
}

// Get tips data from Supabase
async function getTipsData(type) {
    try {
        const tableName = `${type}_tips`;
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching tips:', error);
            return [];
        }
        
        return data || [];
    } catch (error) {
        console.error('Error fetching tips:', error);
        return [];
    }
}

// Display tips on tips page
function displayTips(tips, type) {
    const tipsContainer = document.getElementById('tipsContainer');
    const adminPanel = document.getElementById('adminPanel');
    
    if (!tipsContainer) return;
    
    if (tips.length === 0) {
        tipsContainer.innerHTML = `
            <div class="no-tips">
                No tips available right now. Please check back after a few minutes.
            </div>
        `;
    } else {
        // Group tips by date
        const groupedTips = groupTipsByDate(tips);
        
        tipsContainer.innerHTML = Object.keys(groupedTips).map(date => `
            <div class="date-section">
                <h3 class="date-header">${formatDate(date)}</h3>
                <div class="tips-for-date">
                    ${groupedTips[date].map(tip => `
                        <div class="tip-item">
                            <div class="tip-header">
                                <div class="tip-match">${tip.match}</div>
                                <div class="tip-time">${tip.time}</div>
                            </div>
                            <div class="tip-details">
                                <div class="tip-detail">
                                    <div class="tip-detail-label">League</div>
                                    <div class="tip-detail-value">${tip.league}</div>
                                </div>
                                <div class="tip-detail">
                                    <div class="tip-detail-label">Prediction</div>
                                    <div class="tip-detail-value">${tip.prediction}</div>
                                </div>
                                <div class="tip-detail">
                                    <div class="tip-detail-label">Odds</div>
                                    <div class="tip-detail-value">${tip.odds}</div>
                                </div>
                            </div>
                            ${isAdmin ? `
                                <div class="tip-actions">
                                    <button class="btn btn-secondary" onclick="editTip('${type}', ${tip.id})">Edit</button>
                                    <button class="btn btn-danger" onclick="deleteTip('${type}', ${tip.id})">Delete</button>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }
    
    // Show admin panel if user is admin
    if (isAdmin && adminPanel) {
        adminPanel.style.display = 'block';
        setupAdminPanel(type);
    }
}

// Group tips by date
function groupTipsByDate(tips) {
    return tips.reduce((groups, tip) => {
        const date = tip.date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(tip);
        return groups;
    }, {});
}

// Format date for display
function formatDate(dateString) {
    // Check if it's a date range (contains "to")
    if (dateString.includes(' to ')) {
        const [startDate, endDate] = dateString.split(' to ');
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        const options = { 
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
        };
        
        const startFormatted = start.toLocaleDateString('en-GB', options);
        const endFormatted = end.toLocaleDateString('en-GB', options);
        
        return `${startFormatted} - ${endFormatted}`;
    } else {
        // Single date
        const date = new Date(dateString);
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    }
}

// Setup admin panel
function setupAdminPanel(type) {
    const addTipForm = document.getElementById('addTipForm');
    if (addTipForm) {
        addTipForm.onsubmit = (e) => handleAddTip(e, type);
        
        // Show/hide date fields based on tip type
        const singleDateGroup = document.getElementById('singleDateGroup');
        const dateRangeGroup = document.getElementById('dateRangeGroup');
        const endDateGroup = document.getElementById('endDateGroup');
        
        if (type === 'train') {
            singleDateGroup.style.display = 'none';
            dateRangeGroup.style.display = 'block';
            endDateGroup.style.display = 'block';
            document.getElementById('startDate').required = true;
            document.getElementById('endDate').required = true;
            document.getElementById('date').required = false;
        } else {
            singleDateGroup.style.display = 'block';
            dateRangeGroup.style.display = 'none';
            endDateGroup.style.display = 'none';
            document.getElementById('date').required = true;
            document.getElementById('startDate').required = false;
            document.getElementById('endDate').required = false;
        }
    }
    
    // Load dashboard stats when admin panel is shown
    loadDashboardStats();
}

// Handle add tip
async function handleAddTip(e, type) {
    // Validate admin access before proceeding
    if (!validateAdminAccess()) {
        alert('Admin access required. Please login again.');
        return;
    }
    
    e.preventDefault();
    
    const formData = new FormData(e.target);
    let dateValue;
    
    // Handle date based on tip type
    if (type === 'train') {
        const startDate = formData.get('startDate');
        const endDate = formData.get('endDate');
        dateValue = `${startDate} to ${endDate}`;
    } else {
        dateValue = formData.get('date');
    }
    
    const newTip = {
        date: dateValue,
        match: formData.get('match'),
        league: formData.get('league'),
        time: formData.get('time'),
        prediction: formData.get('prediction'),
        odds: formData.get('odds')
    };
    
    try {
        const tableName = `${type}_tips`;
        const { data, error } = await supabase
            .from(tableName)
            .insert([newTip])
            .select();
        
        if (error) {
            console.error('Error adding tip:', error);
            alert('Error adding tip. Please try again.');
            return;
        }
        
        // Refresh display
        loadTipsPage();
        
        // Refresh dashboard stats
        loadDashboardStats();
        
        // Reset form
        e.target.reset();
        
        alert('Tip added successfully!');
    } catch (error) {
        console.error('Error adding tip:', error);
        alert('Error adding tip. Please try again.');
    }
}

// Edit tip
async function editTip(type, tipId) {
    // Validate admin access before proceeding
    if (!validateAdminAccess()) {
        alert('Admin access required. Please login again.');
        return;
    }
    
    try {
        const tableName = `${type}_tips`;
        const { data: tip, error: fetchError } = await supabase
            .from(tableName)
            .select('*')
            .eq('id', tipId)
            .single();
        
        if (fetchError || !tip) {
            console.error('Error fetching tip:', fetchError);
            alert('Error fetching tip. Please try again.');
            return;
        }
        
        let newDate;
        if (type === 'train') {
            newDate = prompt('Date Range (YYYY-MM-DD to YYYY-MM-DD):', tip.date);
        } else {
            newDate = prompt('Date (YYYY-MM-DD):', tip.date);
        }
        if (newDate === null) return;
        
        const newMatch = prompt('Match:', tip.match);
        if (newMatch === null) return;
        
        const newLeague = prompt('League:', tip.league);
        if (newLeague === null) return;
        
        const newTime = prompt('Time:', tip.time);
        if (newTime === null) return;
        
        const newPrediction = prompt('Prediction:', tip.prediction);
        if (newPrediction === null) return;
        
        const newOdds = prompt('Odds:', tip.odds);
        if (newOdds === null) return;
        
        // Update tip in Supabase
        const { error: updateError } = await supabase
            .from(tableName)
            .update({
                date: newDate,
                match: newMatch,
                league: newLeague,
                time: newTime,
                prediction: newPrediction,
                odds: newOdds
            })
            .eq('id', tipId);
        
        if (updateError) {
            console.error('Error updating tip:', updateError);
            alert('Error updating tip. Please try again.');
            return;
        }
        
        // Refresh display
        loadTipsPage();
        
        // Refresh dashboard stats
        loadDashboardStats();
        
        alert('Tip updated successfully!');
    } catch (error) {
        console.error('Error editing tip:', error);
        alert('Error editing tip. Please try again.');
    }
}

// Delete tip
async function deleteTip(type, tipId) {
    // Validate admin access before proceeding
    if (!validateAdminAccess()) {
        alert('Admin access required. Please login again.');
        return;
    }
    
    if (confirm('Are you sure you want to delete this tip?')) {
        try {
            const tableName = `${type}_tips`;
            const { error } = await supabase
                .from(tableName)
                .delete()
                .eq('id', tipId);
            
            if (error) {
                console.error('Error deleting tip:', error);
                alert('Error deleting tip. Please try again.');
                return;
            }
            
            loadTipsPage();
            
            // Refresh dashboard stats
            loadDashboardStats();
            
            alert('Tip deleted successfully!');
        } catch (error) {
            console.error('Error deleting tip:', error);
            alert('Error deleting tip. Please try again.');
        }
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const tipTypes = ['today', 'weekly', 'monthly', 'train'];
        const counts = {};
        let totalCount = 0;
        let lastUpdated = null;
        let allTips = [];
        
        // Get counts for each tip type
        for (const type of tipTypes) {
            const tips = await getTipsData(type);
            counts[type] = tips.length;
            totalCount += tips.length;
            allTips = allTips.concat(tips);
            
            // Find the most recent tip
            if (tips.length > 0) {
                const latestTip = tips.reduce((latest, current) => {
                    return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
                });
                
                if (!lastUpdated || new Date(latestTip.created_at) > new Date(lastUpdated)) {
                    lastUpdated = latestTip.created_at;
                }
            }
        }
        
        // Calculate success rate
        const successRate = calculateSuccessRate(allTips);
        const completedTips = allTips.filter(tip => tip.status !== 'pending');
        
        // Update dashboard display
        updateDashboardDisplay(counts, totalCount, lastUpdated, successRate, completedTips.length);
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        updateDashboardDisplay({today: 0, weekly: 0, monthly: 0, train: 0}, 0, null, 0, 0);
    }
}

// Update dashboard display
function updateDashboardDisplay(counts, totalCount, lastUpdated, successRate, completedCount) {
    // Update individual counts
    document.getElementById('todayCount').textContent = counts.today || 0;
    document.getElementById('weeklyCount').textContent = counts.weekly || 0;
    document.getElementById('monthlyCount').textContent = counts.monthly || 0;
    document.getElementById('trainCount').textContent = counts.train || 0;
    
    // Update total count
    document.getElementById('totalCount').textContent = totalCount;
    
    // Update success rate
    const successRateElement = document.getElementById('successRate');
    if (successRateElement) {
        successRateElement.textContent = `${successRate}%`;
    }
    
    // Update completed count
    const completedCountElement = document.getElementById('completedCount');
    if (completedCountElement) {
        completedCountElement.textContent = completedCount;
    }
    
    // Update last updated time
    const lastUpdatedElement = document.getElementById('lastUpdated');
    if (lastUpdated) {
        const date = new Date(lastUpdated);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            lastUpdatedElement.textContent = 'Yesterday';
        } else if (diffDays < 7) {
            lastUpdatedElement.textContent = `${diffDays} days ago`;
        } else {
            lastUpdatedElement.textContent = date.toLocaleDateString();
        }
    } else {
        lastUpdatedElement.textContent = 'No posts yet';
    }
}

// Load tips page
async function loadTipsPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    
    if (!type) {
        window.location.href = 'index.html';
        return;
    }
    
    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        const titles = {
            'today': 'Today Tips',
            'weekly': 'Weekly Tips',
            'monthly': 'Monthly Tips',
            'train': 'Our Train Tips'
        };
        pageTitle.textContent = titles[type] || 'Tips';
    }
    
    // Load and display tips
    const tips = await getTipsData(type);
    displayTips(tips, type);
}

// Close modal when clicking outside - DISABLED (using dedicated admin panel)
/*
window.onclick = function(event) {
    const modal = document.getElementById('adminModal');
    if (event.target === modal) {
        closeAdminModal();
    }
}
*/

// Mobile menu functionality
function toggleMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (!mobileMenuBtn || !mobileNav) return;
    
    mobileMenuBtn.classList.toggle('active');
    mobileNav.classList.toggle('active');
}

// Add touch event support for mobile menu
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    
    if (mobileMenuBtn) {
        // Add touch event for better mobile support
        mobileMenuBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            toggleMobileMenu();
        });
        
        // Also keep click event for desktop
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleMobileMenu();
        });
    }
});

// Close mobile menu when clicking outside or on links
document.addEventListener('click', function(event) {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (mobileMenuBtn && mobileNav && 
        !mobileMenuBtn.contains(event.target) && 
        !mobileNav.contains(event.target)) {
        mobileMenuBtn.classList.remove('active');
        mobileNav.classList.remove('active');
    }
    
    // Close menu when clicking on mobile nav links
    if (event.target.classList.contains('nav-link') && mobileNav.classList.contains('active')) {
        mobileMenuBtn.classList.remove('active');
        mobileNav.classList.remove('active');
    }
});

// Close mobile menu on touch outside
document.addEventListener('touchstart', function(event) {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (mobileMenuBtn && mobileNav && mobileNav.classList.contains('active') &&
        !mobileMenuBtn.contains(event.target) && 
        !mobileNav.contains(event.target)) {
        mobileMenuBtn.classList.remove('active');
        mobileNav.classList.remove('active');
    }
});

// Export functions for global access
window.navigateToTips = navigateToTips;
// Global function assignments - DISABLED (using dedicated admin panel)
/*
window.openAdminModal = openAdminModal;
window.closeAdminModal = closeAdminModal;
*/
// ==================== MATCH RESULT TRACKING SYSTEM ====================

// Load match results for admin management
async function loadMatchResults() {
    try {
        const allTips = [];
        const tipTypes = ['today', 'weekly', 'monthly', 'train'];
        
        for (const type of tipTypes) {
            const tips = await getTipsData(type);
            tips.forEach(tip => {
                tip.tipType = type;
                allTips.push(tip);
            });
        }
        
        // Sort by date (newest first)
        allTips.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        displayMatchResults(allTips);
    } catch (error) {
        console.error('Error loading match results:', error);
    }
}

// Display match results in admin panel
function displayMatchResults(tips) {
    const container = document.getElementById('matchResultsContainer');
    if (!container) return;
    
    if (tips.length === 0) {
        container.innerHTML = '<div class="no-tips">No tips found.</div>';
        return;
    }
    
    let html = '<div class="match-results-list">';
    
    tips.forEach(tip => {
        const statusClass = getStatusClass(tip.status);
        const statusIcon = getStatusIcon(tip.status);
        
        html += `
            <div class="match-result-item">
                <div class="match-info">
                    <div class="match-header">
                        <span class="match-date">${tip.date}</span>
                        <span class="match-time">${tip.time}</span>
                        <span class="match-league">${tip.league}</span>
                    </div>
                    <div class="match-details">
                        <strong>${tip.match}</strong>
                        <span class="prediction">${tip.prediction}</span>
                        <span class="odds">Odds: ${tip.odds}</span>
                    </div>
                </div>
                <div class="match-status">
                    <span class="status-badge ${statusClass}">
                        ${statusIcon} ${tip.status.toUpperCase()}
                    </span>
                    <div class="status-actions">
                        <button onclick="updateMatchStatus('${tip.tipType}', ${tip.id}, 'won')" 
                                class="btn-status btn-won" title="Mark as Won">✅</button>
                        <button onclick="updateMatchStatus('${tip.tipType}', ${tip.id}, 'lost')" 
                                class="btn-status btn-lost" title="Mark as Lost">❌</button>
                        <button onclick="updateMatchStatus('${tip.tipType}', ${tip.id}, 'draw')" 
                                class="btn-status btn-draw" title="Mark as Draw">⚖️</button>
                        <button onclick="updateMatchStatus('${tip.tipType}', ${tip.id}, 'pending')" 
                                class="btn-status btn-pending" title="Mark as Pending">⏳</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Get status CSS class
function getStatusClass(status) {
    const classes = {
        'won': 'status-won',
        'lost': 'status-lost',
        'draw': 'status-draw',
        'pending': 'status-pending'
    };
    return classes[status] || 'status-pending';
}

// Get status icon
function getStatusIcon(status) {
    const icons = {
        'won': '✅',
        'lost': '❌',
        'draw': '⚖️',
        'pending': '⏳'
    };
    return icons[status] || '⏳';
}

// Update match status
async function updateMatchStatus(tipType, tipId, newStatus) {
    try {
        const tableName = `${tipType}_tips`;
        const { error } = await supabase
            .from(tableName)
            .update({ status: newStatus })
            .eq('id', tipId);
        
        if (error) {
            console.error('Error updating match status:', error);
            alert('Error updating match status. Please try again.');
            return;
        }
        
        // Refresh the match results display
        loadMatchResults();
        
        // Refresh dashboard stats
        if (typeof loadDashboardStats === 'function') {
            loadDashboardStats();
        }
        
        alert(`Match status updated to: ${newStatus.toUpperCase()}`);
    } catch (error) {
        console.error('Error updating match status:', error);
        alert('Error updating match status. Please try again.');
    }
}

// Calculate success rate
function calculateSuccessRate(tips) {
    const completedTips = tips.filter(tip => tip.status !== 'pending');
    if (completedTips.length === 0) return 0;
    
    const wonTips = completedTips.filter(tip => tip.status === 'won');
    return Math.round((wonTips.length / completedTips.length) * 100);
}

// Load match results for admin panel
async function loadMatchResultsForAdmin() {
    if (typeof loadMatchResults === 'function') {
        loadMatchResults();
    }
}

window.logout = logout;
window.editTip = editTip;
window.deleteTip = deleteTip;
window.loadTipsPage = loadTipsPage;
window.toggleMobileMenu = toggleMobileMenu;
window.updateMatchStatus = updateMatchStatus;
window.loadMatchResultsForAdmin = loadMatchResultsForAdmin;
