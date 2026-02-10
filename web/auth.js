// auth.js - Shared authentication and role-based access control

// Check if user is logged in
function checkAuth() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return null;
    }
    return JSON.parse(currentUser);
}

// Get current user's role
function getCurrentUserRole() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        return JSON.parse(currentUser).role;
    }
    return null;
}

// Define page access permissions for each role
const pagePermissions = {
    'admin': ['index.html', 'cattle_info.html', 'feeding.html', 'growth.html', 'health.html', 'profile.html', 'admin.html'],
    'doctor': ['index.html', 'growth.html', 'health.html', 'profile.html'],
    'owner': ['index.html', 'cattle_info.html', 'feeding.html', 'growth.html', 'health.html', 'profile.html'],
    'staff': ['index.html', 'cattle_info.html', 'feeding.html', 'growth.html', 'profile.html']
};

// Check if current user can access current page
function checkPageAccess() {
    const currentUser = checkAuth();
    if (!currentUser) return;

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const allowedPages = pagePermissions[currentUser.role] || [];

    if (!allowedPages.includes(currentPage)) {
        alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        window.location.href = 'index.html';
    }
}

// Show/Hide navigation based on role
function applyRoleBasedNavigation() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) return;

    const user = JSON.parse(currentUser);
    const role = user.role;

    // Navigation permissions
    const navPermissions = {
        'admin': {
            'nav-cattle': true,
            'nav-feeding': true,
            'nav-growth': true,
            'nav-health': true,
            'nav-admin': true
        },
        'doctor': {
            'nav-cattle': false,
            'nav-feeding': false,
            'nav-growth': true,
            'nav-health': true,
            'nav-admin': false
        },
        'owner': {
            'nav-cattle': true,
            'nav-feeding': true,
            'nav-growth': true,
            'nav-health': true,
            'nav-admin': false
        },
        'staff': {
            'nav-cattle': true,
            'nav-feeding': true,
            'nav-growth': true,
            'nav-health': false,
            'nav-admin': false
        }
    };

    const permissions = navPermissions[role] || navPermissions['staff'];

    // Apply to nav links by ID
    Object.keys(permissions).forEach(navId => {
        const navElement = document.getElementById(navId);
        if (navElement) {
            navElement.style.display = permissions[navId] ? 'flex' : 'none';
        }
    });

    // Also apply by href for pages without IDs
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            if (href.includes('cattle_info')) {
                link.style.display = permissions['nav-cattle'] ? 'flex' : 'none';
            } else if (href.includes('feeding')) {
                link.style.display = permissions['nav-feeding'] ? 'flex' : 'none';
            } else if (href.includes('growth')) {
                link.style.display = permissions['nav-growth'] ? 'flex' : 'none';
            } else if (href.includes('health')) {
                link.style.display = permissions['nav-health'] ? 'flex' : 'none';
            } else if (href.includes('admin')) {
                link.style.display = permissions['nav-admin'] ? 'flex' : 'none';
            }
        }
    });
}

// Logout function
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', function () {
    // Skip auth check on login and register pages
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'login.html' || currentPage === 'register.html') {
        return;
    }

    checkPageAccess();
    applyRoleBasedNavigation();
});
