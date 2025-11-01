// Firebase configuration - Optimized for performance
const firebaseConfig = {
    apiKey: "AIzaSyCB9uARJMMaY-N6ikCRvOscgMNOCE5R0n4",
    authDomain: "luubbkythuatnhap.firebaseapp.com",
    projectId: "luubbkythuatnhap",
    storageBucket: "luubbkythuatnhap.firebasestorage.app",
    messagingSenderId: "914373130415",
    appId: "1:914373130415:web:f2aad04a7138d43c6afc5a"
};

// Performance optimization: Advanced caching system
const DOM_CACHE = {};
const DATA_CACHE = {
    serviceRequests: { data: null, timestamp: 0, ttl: 60000 }, // 60 seconds cache
    userData: { data: null, timestamp: 0, ttl: 30000 }, // 30 seconds cache
    allUsers: { data: null, timestamp: 0, ttl: 120000 }, // 2 minutes cache
    lastLoadTime: 0
};

// Check if running in iframe
function isInIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

// Optimized Firebase initialization with performance enhancements
function initializeFirebase() {
    try {
        // Initialize Firebase only once
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
    } catch (error) {
        if (!error.message.includes('already exists')) {
            console.error('Firebase initialization error:', error);
        }
    }
}

// Initialize Firebase immediately with performance monitoring
const startTime = performance.now();
initializeFirebase();
const auth = firebase.auth();
const db = firebase.firestore();
console.log(`Firebase initialized in ${performance.now() - startTime}ms`);

// Global variables
let currentUser = null;
let serviceRequests = []; // Store service requests
let allUsers = []; // Store all users for admin filtering

// Data Management variables
let dataCurrentFilter = 'all';
let dataCurrentSort = 'date-desc';
let dataCurrentSearchTerm = '';
let dataCurrentPage = 1;
let dataCurrentStatusFilter = '';
let dataCurrentUserFilter = '';
let dataCurrentDateFromFilter = '';
let dataCurrentDateToFilter = '';

// Utility functions
function showLoading(show = true) {
    const loadingScreen = document.getElementById('loadingScreen');
    if (show) {
        loadingScreen.classList.remove('hidden');
    } else {
        loadingScreen.classList.add('hidden');
    }
}

// Debounce function for performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toastId = 'toast-' + Date.now();

    const bgColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };

    const toastHtml = `
        <div id="${toastId}" class="bg-white rounded-lg shadow-lg p-4 mb-2 toast-item">
            <div class="flex items-center">
                <div class="w-10 h-10 ${bgColors[type]} rounded-full flex items-center justify-center mr-3">
                    <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'} text-white"></i>
                </div>
                <div class="flex-1">
                    <p class="font-medium text-gray-800">${message}</p>
                </div>
                <button onclick="document.getElementById('${toastId}').remove()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);

    // Auto remove after 5 seconds
    setTimeout(() => {
        const toast = document.getElementById(toastId);
        if (toast) toast.remove();
    }, 5000);
}

function showSection(sectionName) {
    console.log('Showing section:', sectionName);
    
    // Close all popup windows when switching sections
    closeAllPopupWindows();
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
        section.style.display = 'none'; // Force hide with inline style
    });

    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Handle special case for new-request section
    let sectionId = sectionName + 'Section';
    if (sectionName === 'new-request') {
        sectionId = 'newRequestSection'; // Match the ID in HTML
    }

    // Show selected section
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
        sectionElement.classList.remove('hidden');
        sectionElement.style.display = 'block'; // Force show with inline style
        console.log('Section element found and shown:', sectionElement);
        console.log('Section display style:', window.getComputedStyle(sectionElement).display);
        console.log('Section visibility:', window.getComputedStyle(sectionElement).visibility);
    } else {
        console.error('Section element not found:', sectionId);
        console.log('Available sections:', Array.from(document.querySelectorAll('.content-section')).map(el => el.id));
        return;
    }

    // Add active class to corresponding nav item
    const navItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (navItem) {
        navItem.classList.add('active');
        console.log('Nav item found and activated:', navItem);
    } else {
        console.error('Nav item not found for section:', sectionName);
    }

    // Load section data
    loadSectionData(sectionName);
}

function closeAllPopupWindows() {
    // Close all popup windows that might have been opened
    if (window.editServiceRequestWindow && !window.editServiceRequestWindow.closed) {
        window.editServiceRequestWindow.close();
    }
    if (window.viewServiceRequestWindow && !window.viewServiceRequestWindow.closed) {
        window.viewServiceRequestWindow.close();
    }
}

function showModal(modalId) {
    console.log('Showing modal:', modalId);
    console.log('All modals in DOM:', document.querySelectorAll('.modal'));
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        console.log('Modal found and activated:', modal);
        console.log('Modal classes after adding active:', modal.className);
        console.log('Modal style display:', window.getComputedStyle(modal).display);
    } else {
        console.error('Modal not found:', modalId);
        console.log('Available elements with IDs:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
    }
}

function hideModal(modalId) {
    console.log('Hiding modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        console.log('Modal hidden:', modalId);
    } else {
        console.error('Modal not found:', modalId);
    }
}

// Data loading functions
async function loadUserData() {
    try {
        if (!currentUser || !currentUser.uid) {
            console.error('No current user available');
            return null;
        }

        // Check cache first
        const now = Date.now();
        if (DATA_CACHE.userData.data &&
            (now - DATA_CACHE.userData.timestamp) < DATA_CACHE.userData.ttl) {
            console.log('Returning cached user data');
            return DATA_CACHE.userData.data;
        }

        console.log('Loading user data for:', currentUser.uid);
        const userDoc = await db.collection('users').doc(currentUser.uid).get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            console.log('User data loaded from Firestore:', userData);

        // Update cache
        DATA_CACHE.userData.data = userData;
        DATA_CACHE.userData.timestamp = now;

            // Update UI with user data
            const userNameEl = document.getElementById('userName');
            const userRoleEl = document.getElementById('userRole');

            if (userNameEl) {
                userNameEl.textContent = userData.displayName || 'Unknown User';
            }

            if (userRoleEl) {
                userRoleEl.textContent = userData.role || 'user';
            }

            if (userData.photoURL) {
                const userAvatarEl = document.getElementById('userAvatar');
                if (userAvatarEl) {
                    userAvatarEl.src = userData.photoURL;
                }
            }

            // Show/hide admin features
            const adminElements = document.querySelectorAll('.admin-only');
            adminElements.forEach(el => {
                el.style.display = userData.role === 'admin' ? 'flex' : 'none';
            });

            return userData;
        } else {
            console.log('User document does not exist');
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        showToast('Lỗi tải dữ liệu người dùng: ' + error.message, 'error');
    }
    return null;
}

// Make loadUserData available globally for popup windows
window.loadUserData = loadUserData;


async function loadSectionData(sectionName) {
    console.log('Loading data for section:', sectionName);
    
    try {
        switch (sectionName) {
            case 'dashboard':
                await loadServiceRequests();
                updateServiceRequestStats();
                break;
            case 'links':
                await loadServiceRequests();
                renderServiceRequests();
                break;
            case 'categories':
                await loadServiceRequests();
                renderServiceRequests();
                break;
            case 'new-request':
                console.log('Initializing new service request form section');
                // Wait a bit for DOM to update
                setTimeout(() => {
                    initializeNewServiceRequestForm();
                }, 100);
                break;
            case 'data-management':
                console.log('Initializing data management section');
                // Wait a bit for DOM to update
                setTimeout(() => {
                    initializeDataManagementSection();
                }, 100);
                break;
            default:
                console.warn('Unknown section:', sectionName);
        }
    } catch (error) {
        console.error('Error loading section data:', error);
        showToast('Lỗi tải dữ liệu: ' + error.message, 'error');
    }
}



// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;

            try {
                const userData = await loadUserData();
                await loadServiceRequests();
                
                // Only load all users if the current user is an admin
                if (userData && userData.role === 'admin') {
                    await loadAllUsers(); // Load all users for admin features
                }
                
                showLoading(false);
                showSection('links');
            } catch (error) {
                console.error('Error during data loading:', error);
                showToast('Lỗi tải dữ liệu: ' + error.message, 'error');
                showLoading(false);
            }
        } else {
            window.location.href = 'index.html';
        }
    });

    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.toggle('open');
            }
        });
    }

    // User menu
    const userMenuBtn = document.getElementById('userMenuBtn');
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', function() {
            const userDropdown = document.getElementById('userDropdown');
            if (userDropdown) {
                userDropdown.classList.toggle('hidden');
            }
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            try {
                await auth.signOut();
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Logout error:', error);
                showToast('Lỗi đăng xuất', 'error');
            }
        });
    }

    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    if (navItems.length > 0) {
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                const section = this.dataset.section;
                console.log('Nav item clicked, section:', section);
                if (section) {
                    showSection(section);
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth <= 1023) {
                        const sidebar = document.getElementById('sidebar');
                        if (sidebar) {
                            sidebar.classList.remove('open');
                        }
                    }
                } else {
                    console.warn('No section found on nav item:', this);
                }
            });
        });
    }

    // Service request actions with debouncing
    const debouncedRender = debounce(renderServiceRequests, 300);

    const serviceRequestSearch = document.getElementById('serviceRequestSearch');
    if (serviceRequestSearch) {
        serviceRequestSearch.addEventListener('input', debouncedRender);
    }
    
    const serviceRequestStatus = document.getElementById('serviceRequestStatus');
    if (serviceRequestStatus) {
        serviceRequestStatus.addEventListener('change', renderServiceRequests);
    }
    
    const serviceRequestUser = document.getElementById('serviceRequestUser');
    if (serviceRequestUser) {
        serviceRequestUser.addEventListener('change', renderServiceRequests);
    }
    
    const serviceRequestDateFrom = document.getElementById('serviceRequestDateFrom');
    if (serviceRequestDateFrom) {
        serviceRequestDateFrom.addEventListener('change', renderServiceRequests);
    }
    
    const serviceRequestDateTo = document.getElementById('serviceRequestDateTo');
    if (serviceRequestDateTo) {
        serviceRequestDateTo.addEventListener('change', renderServiceRequests);
    }

    // Load service requests when service-requests section is shown
    const serviceRequestsSection = document.getElementById('linksSection');
    if (serviceRequestsSection) {
        loadServiceRequests().then(() => {
            renderServiceRequests();
        }).catch(error => {
            console.error('Error loading service requests:', error);
        });
    }

// Optimized user loading with caching
async function loadAllUsers() {
    try {
        // Check cache first
        const now = Date.now();
        if (DATA_CACHE.allUsers.data &&
            (now - DATA_CACHE.allUsers.timestamp) < DATA_CACHE.allUsers.ttl) {
            console.log('Returning cached all users data');
            return DATA_CACHE.allUsers.data;
        }

        const snapshot = await db.collection('users').get();
        allUsers = [];
        snapshot.forEach(doc => {
            allUsers.push({ uid: doc.id, ...doc.data() });
            });
            console.log('Loaded all users from Firestore:', snapshot.size);
        
        // Update cache
        DATA_CACHE.allUsers.data = allUsers;
        DATA_CACHE.allUsers.timestamp = now;
        populateUserFilter();
    } catch (error) {
        console.error('Error loading users:', error);
        showToast('Lỗi tải danh sách người dùng', 'error');
        }
    }

    function populateUserFilter() {
        const userFilter = document.getElementById('serviceRequestUser');
        if (!userFilter) return;

        // Clear existing options except the first one
        userFilter.innerHTML = '<option value="">Tất cả người dùng</option>';

        // Add user options
        allUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.uid;
            option.textContent = user.displayName || user.email || 'Unknown User';
            userFilter.appendChild(option);
        });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown && !e.target.closest('#userMenuBtn') && !e.target.closest('#userDropdown')) {
            userDropdown.classList.add('hidden');
        }

        if (window.innerWidth <= 1023 && !e.target.closest('#sidebar') && !e.target.closest('#sidebarToggle')) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.remove('open');
            }
        }
    });
    
    // Listen for custom events from localStorage updates
    window.addEventListener('serviceRequestUpdated', function(event) {
        console.log('Received service request update event:', event.detail);
        showLoading(true);
        
        // Update the local array
        const index = serviceRequests.findIndex(r => r.id === event.detail.requestId);
        if (index !== -1) {
            serviceRequests[index] = { ...serviceRequests[index], ...event.detail.data };
            console.log('Updated service request from event:', serviceRequests[index]);
            
            // Refresh UI
            renderServiceRequests();
            updateServiceRequestStats();
            showLoading(false);
            showToast('Phiếu yêu cầu đã được cập nhật thành công!', 'success');
        }
    });
    
    // Check for service request updates in localStorage
    setInterval(function() {
        window.checkForServiceRequestUpdates();
    }, 500);
});

// Handle edit service request form submission
document.addEventListener('DOMContentLoaded', function() {
    const editForm = document.getElementById('editServiceRequestForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditServiceRequestSubmit);
    }
});

// Also add event listener when modal is shown
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('editServiceRequestModal');
    if (modal) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (modal.classList.contains('active')) {
                        const editForm = document.getElementById('editServiceRequestForm');
                        if (editForm && !editForm.hasAttribute('data-listener-added')) {
                            editForm.addEventListener('submit', handleEditServiceRequestSubmit);
                            editForm.setAttribute('data-listener-added', 'true');
                            console.log('Added submit listener to edit form in modal');
                        }
                    }
                }
            });
        });
        observer.observe(modal, { attributes: true });
    }
});

async function handleEditServiceRequestSubmit(e) {
    e.preventDefault();
    
    if (!currentUser || !currentUser.uid) {
        showToast('Vui lòng đăng nhập trước', 'error');
        return;
    }
    
    const editRequestIdEl = document.getElementById('editRequestId');
    const requestId = editRequestIdEl ? editRequestIdEl.value : window.currentEditingRequestId;
    if (!requestId) {
        showToast('Không tìm thấy ID phiếu yêu cầu', 'error');
        return;
    }
    
    // Show loading state
    showLoading(true);
    
    try {
        // Collect form data
        const serviceTypes = [];
        document.querySelectorAll('#editServiceRequestModal input[name="editServiceTypes"]:checked').forEach(checkbox => {
            if (checkbox.value) {
                serviceTypes.push(checkbox.value);
            }
        });
        
        const updatedRequest = {
            serviceRequestNumber: document.getElementById('editServiceRequestNumber')?.value || '',
            companyName: document.getElementById('editCompanyName')?.value || '',
            address: document.getElementById('editAddress')?.value || '',
            productCode: document.getElementById('editProductCode')?.value || '',
            machineNumber: document.getElementById('editMachineNumber')?.value || '',
            orderNumber: document.getElementById('editOrderNumber')?.value || '',
            productDescription: document.getElementById('editProductDescription')?.value || '',
            model: document.getElementById('editModel')?.value || '',
            serialNumber: document.getElementById('editSerialNumber')?.value || '',
            manufacturer: document.getElementById('editManufacturer')?.value || '',
            problemDescription: document.getElementById('editProblemDescription')?.value || '',
            problemDefinition: document.getElementById('editProblemDefinition')?.value || '',
            serviceCompleted: document.getElementById('editServiceCompleted')?.value || '',
            notes: document.getElementById('editNotes')?.value || '',
            contactPerson: document.getElementById('editContactPerson')?.value || '',
            phone: document.getElementById('editPhone')?.value || '',
            startDate: document.getElementById('editStartDate')?.value || '',
            startTime: document.getElementById('editStartTime')?.value || '',
            endDate: document.getElementById('editEndDate')?.value || '',
            endTime: document.getElementById('editEndTime')?.value || '',
            totalDate: document.getElementById('editTotalDate')?.value || '',
            totalTime: document.getElementById('editTotalTime')?.value || '',
            travelInfo: document.getElementById('editTravelInfo')?.value || '',
            serviceTypes: serviceTypes,
            status: document.getElementById('editStatus')?.value || 'pending',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        console.log('Updating service request with data:', updatedRequest);
        
        // Check if document exists first
        const docRef = db.collection('serviceRequests').doc(requestId);
        const doc = await docRef.get();
        
        if (!doc.exists) {
            throw new Error('Phiếu yêu cầu không tồn tại');
        }
        
        // Get user data to check role
        let userData = null;
        try {
            const userDoc = await db.collection('users').doc(currentUser.uid).get();
            if (userDoc.exists) {
                userData = userDoc.data();
                console.log('User data loaded:', userData);
            }
        } catch (e) {
            console.error('Error loading user data:', e);
        }
        
        // Check if user has permission to edit this request
        const requestData = doc.data();
        const isAdmin = userData && userData.role === 'admin';
        const isOwner = requestData.userId === currentUser.uid;
        
        console.log('Permission check:');
        console.log('- isAdmin:', isAdmin);
        console.log('- isOwner:', isOwner);
        console.log('- request.userId:', requestData.userId);
        console.log('- currentUser.uid:', currentUser.uid);
        
        if (!isAdmin && !isOwner) {
            throw new Error('Bạn không có quyền chỉnh sửa phiếu yêu cầu này');
        }
        
        console.log('Permission check passed, proceeding with update...');
        
        // Update document
        console.log('Sending update to Firestore...');
        const updateResult = await docRef.update(updatedRequest);
        console.log('Firestore update result:', updateResult);
        console.log('Service request updated successfully in Firestore');
        
        // Update local array
        const index = serviceRequests.findIndex(r => r.id === requestId);
        if (index !== -1) {
            serviceRequests[index] = { ...serviceRequests[index], ...updatedRequest };
            console.log('Updated service request in local array:', serviceRequests[index]);
        }
        
        // Refresh UI
        renderServiceRequests();
        updateServiceRequestStats();
        
        // Hide modal
        hideModal('editServiceRequestModal');
        
        showToast('Phiếu yêu cầu đã được cập nhật thành công!', 'success');
        
    } catch (error) {
        console.error('Error updating service request:', error);
        showToast('Lỗi cập nhật phiếu yêu cầu: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Service Request management functions
async function loadServiceRequests() {
    try {
        if (!currentUser || !currentUser.uid) {
            console.error('No current user available for loading service requests');
            return;
        }

        // Check cache first
        const now = Date.now();
        if (DATA_CACHE.serviceRequests.data &&
            (now - DATA_CACHE.serviceRequests.timestamp) < DATA_CACHE.serviceRequests.ttl) {
            console.log('Returning cached service requests data');
            serviceRequests = DATA_CACHE.serviceRequests.data;
            return serviceRequests;
        }

        console.log('Loading service requests for user:', currentUser.uid);

        // Check user role to determine what service requests to load
        const userData = await loadUserData();
        const isAdmin = userData && userData.role === 'admin';

        let query;
        if (isAdmin) {
            // Admin can see all service requests
            console.log('Loading all service requests for admin');
            query = db.collection('serviceRequests').orderBy('createdAt', 'desc');
        } else {
            // Regular users only see their own service requests
            console.log('Loading user service requests');
            query = db.collection('serviceRequests')
                .where('userId', '==', currentUser.uid)
                .orderBy('createdAt', 'desc');
        }

        const snapshot = await query.get();

        console.log('Service requests query completed, snapshot size:', snapshot.size);

        serviceRequests = [];
        snapshot.forEach(doc => {
            const requestData = { id: doc.id, ...doc.data() };
            serviceRequests.push(requestData);
            console.log('Loaded service request:', requestData.serviceRequestNumber, 'by user:', requestData.userId);
        });

        console.log('Total service requests loaded:', serviceRequests.length);

        // Update cache
        DATA_CACHE.serviceRequests.data = serviceRequests;
        DATA_CACHE.serviceRequests.timestamp = now;

        return serviceRequests;
    } catch (error) {
        console.error('Error loading service requests:', error);
        showToast('Lỗi tải phiếu yêu cầu dịch vụ: ' + error.message, 'error');
    }
}

async function renderServiceRequests() {
    // Cache DOM elements
    if (!DOM_CACHE.serviceRequests) {
        DOM_CACHE.serviceRequests = {
            loadingEl: document.getElementById('serviceRequestsLoading'),
            emptyEl: document.getElementById('serviceRequestsEmpty'),
            listEl: document.getElementById('serviceRequestsList'),
            searchEl: document.getElementById('serviceRequestSearch'),
            statusEl: document.getElementById('serviceRequestStatus'),
            userEl: document.getElementById('serviceRequestUser'),
            dateFromEl: document.getElementById('serviceRequestDateFrom'),
            dateToEl: document.getElementById('serviceRequestDateTo')
        };
    }
    
    const { loadingEl, emptyEl, listEl, searchEl, statusEl, userEl, dateFromEl, dateToEl } = DOM_CACHE.serviceRequests;
    
    const searchTerm = searchEl?.value.toLowerCase() || '';
    const statusFilter = statusEl?.value || '';
    const userFilter = userEl?.value || '';
    const dateFrom = dateFromEl?.value || '';
    const dateTo = dateToEl?.value || '';

    // Generate cache key for filtered results
    const cacheKey = `${searchTerm}-${statusFilter}-${userFilter}-${dateFrom}-${dateTo}`;
    
    // Check if we have cached HTML for this filter combination
    if (DOM_CACHE.filteredRequests && DOM_CACHE.filteredRequests.cacheKey === cacheKey) {
        if (listEl) listEl.innerHTML = DOM_CACHE.filteredRequests.html;
        return;
    }

    let filteredRequests = serviceRequests.filter(request => {
        const matchesSearch = !searchTerm ||
            request.contactPerson?.toLowerCase().includes(searchTerm) ||
            request.phone?.toLowerCase().includes(searchTerm) ||
            request.companyName?.toLowerCase().includes(searchTerm) ||
            request.address?.toLowerCase().includes(searchTerm);

        const matchesStatus = !statusFilter || request.status === statusFilter;
        const matchesUser = !userFilter || request.userId === userFilter;

        let matchesDate = true;
        if (dateFrom || dateTo) {
            const requestDate = new Date(request.createdAt.toDate());
            if (dateFrom) {
                const fromDate = new Date(dateFrom);
                matchesDate = matchesDate && requestDate >= fromDate;
            }
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999); // End of day
                matchesDate = matchesDate && requestDate <= toDate;
            }
        }

        return matchesSearch && matchesStatus && matchesUser && matchesDate;
    });

    // Hide loading and empty states
    if (loadingEl) loadingEl.classList.add('hidden');
    if (emptyEl) emptyEl.classList.add('hidden');

    if (filteredRequests.length === 0) {
        if (emptyEl) emptyEl.classList.remove('hidden');
        if (listEl) listEl.innerHTML = '';
        return;
    }

    // Get user data for attribution
    const userData = await loadUserData();
    const isAdmin = userData && userData.role === 'admin';

    const requestsHtml = filteredRequests.map(request => {
        const createdDate = request.createdAt ? new Date(request.createdAt.toDate()).toLocaleDateString('vi-VN') : 'N/A';
        const statusClass = request.status === 'completed' ? 'status-completed' :
                           request.status === 'in-progress' ? 'status-in-progress' :
                           'status-pending';
        const statusText = request.status === 'completed' ? 'Hoàn thành' :
                          request.status === 'in-progress' ? 'Đang thực hiện' :
                          'Chờ xử lý';

        // Show user attribution for admin
        const showUserInfo = isAdmin && request.userId !== currentUser.uid;
        const userInfo = showUserInfo ? allUsers.find(u => u.uid === request.userId) : null;
        const userEmail = userInfo ? (userInfo.email || userInfo.displayName || 'Unknown User') : '';

        return `
            <div class="service-request-panel">
                <div class="service-request-header">
                    <div class="service-request-title">
                        <span class="service-request-number">${request.serviceRequestNumber || 'N/A'}</span>
                        <span class="service-request-status ${statusClass}">${statusText}</span>
                    </div>
                </div>
                
                <div class="service-request-body">
                    <div class="service-request-info">
                        <div class="info-item">
                            <span class="info-label">Công ty</span>
                            <span class="info-value">${request.companyName || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Người liên hệ</span>
                            <span class="info-value">${request.contactPerson || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Điện thoại</span>
                            <span class="info-value">${request.phone || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Địa chỉ</span>
                            <span class="info-value">${request.address || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Model</span>
                            <span class="info-value">${request.model || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Ngày tạo</span>
                            <span class="info-value">${createdDate}</span>
                        </div>
                    </div>
                    
                    ${request.problemDescription ? `
                        <div class="service-request-description">
                            <div class="description-title">Mô tả vấn đề</div>
                            <div class="description-text">${request.problemDescription}</div>
                        </div>
                    ` : ''}
                    
                    ${showUserInfo ? `
                        <div class="service-request-description">
                            <div class="description-title">Người tạo</div>
                            <div class="description-text">${userEmail}</div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="service-request-footer">
                    <div class="service-request-date">
                        <i class="fas fa-calendar-alt mr-1"></i>
                        ${createdDate}
                    </div>
                    <div class="service-request-actions">
                        <button onclick="viewServiceRequest('${request.id}')" class="action-btn action-edit">
                            <i class="fas fa-eye"></i>
                            Xem
                        </button>
                        <button onclick="editServiceRequest('${request.id}')" class="action-btn action-edit">
                            <i class="fas fa-edit"></i>
                            Sửa
                        </button>
                        <button onclick="deleteServiceRequest('${request.id}')" class="action-btn action-delete">
                            <i class="fas fa-trash"></i>
                            Xóa
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Cache the rendered HTML
    DOM_CACHE.filteredRequests = {
        cacheKey: cacheKey,
        html: requestsHtml
    };

    if (listEl) listEl.innerHTML = requestsHtml;
}

async function deleteServiceRequest(requestId) {
    if (!confirm('Bạn có chắc muốn xóa phiếu yêu cầu dịch vụ này?')) return;

    try {
        await db.collection('serviceRequests').doc(requestId).delete();

        // Remove from local array
        serviceRequests = serviceRequests.filter(request => request.id !== requestId);

        renderServiceRequests();
        showToast('Phiếu yêu cầu dịch vụ đã được xóa', 'success');
    } catch (error) {
        console.error('Error deleting service request:', error);
        showToast('Lỗi xóa phiếu yêu cầu dịch vụ', 'error');
    }
}

function updateServiceRequestStats() {
    const totalServiceRequestsEl = document.getElementById('totalServiceRequests');
    const completedRequestsEl = document.getElementById('completedRequests');
    const inProgressRequestsEl = document.getElementById('inProgressRequests');
    const pendingRequestsEl = document.getElementById('pendingRequests');

    if (totalServiceRequestsEl) {
        totalServiceRequestsEl.textContent = serviceRequests.length;
    }

    if (completedRequestsEl) {
        const completedCount = serviceRequests.filter(r => r.status === 'completed').length;
        completedRequestsEl.textContent = completedCount;
    }

    if (inProgressRequestsEl) {
        const inProgressCount = serviceRequests.filter(r => r.status === 'in-progress').length;
        inProgressRequestsEl.textContent = inProgressCount;
    }

    if (pendingRequestsEl) {
        const pendingCount = serviceRequests.filter(r => !r.status || r.status === 'pending').length;
        pendingRequestsEl.textContent = pendingCount;
    }

    // Update recent service requests
    const recentServiceRequestsContainer = document.getElementById('recentServiceRequests');
    if (recentServiceRequestsContainer) {
        const recentRequests = serviceRequests.slice(0, 5);

        if (recentRequests.length === 0) {
            recentServiceRequestsContainer.innerHTML = `
                <div class="text-center py-4 text-gray-500">
                    <p>Chưa có phiếu yêu cầu nào</p>
                </div>
            `;
            return;
        }

        const recentHtml = recentRequests.map(request => {
            const createdDate = request.createdAt ? new Date(request.createdAt.toDate()).toLocaleDateString('vi-VN') : 'Unknown';
            const statusClass = request.status === 'completed' ? 'status-active' :
                               request.status === 'in-progress' ? 'status-timeout' :
                               'status-broken';
            const statusText = request.status === 'completed' ? 'Hoàn thành' :
                              request.status === 'in-progress' ? 'Đang thực hiện' :
                              'Chờ xử lý';

            return `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex-1">
                        <h4 class="font-medium text-gray-800 truncate">${request.serviceRequestNumber}</h4>
                        <p class="text-sm text-gray-600 truncate">${request.companyName}</p>
                    </div>
                    <div class="text-right">
                        <span class="badge ${statusClass} text-xs">
                            ${statusText}
                        </span>
                        <p class="text-xs text-gray-500 mt-1">
                            ${createdDate}
                        </p>
                    </div>
                </div>
            `;
        }).join('');

        recentServiceRequestsContainer.innerHTML = recentHtml;
    }
}


function exportServiceRequests(format, options = {}) {
    const statusFilter = options.status || '';
    const includeMetadata = options.includeMetadata || false;
    const filteredData = options.filteredData || null;

    let filteredRequests;
    
    // Use pre-filtered data if provided, otherwise apply status filter
    if (filteredData) {
        filteredRequests = filteredData;
    } else {
        filteredRequests = serviceRequests.filter(request => {
            const matchesStatus = !statusFilter || request.status === statusFilter;
            return matchesStatus;
        });
    }

    switch (format) {
        case 'json':
            return exportServiceRequestsAsJSON(filteredRequests, includeMetadata);
        case 'csv':
            return exportServiceRequestsAsCSV(filteredRequests, includeMetadata);
        case 'html':
            return exportServiceRequestsAsHTML(filteredRequests, includeMetadata);
        case 'markdown':
            return exportServiceRequestsAsMarkdown(filteredRequests, includeMetadata);
        default:
            throw new Error('Unsupported export format');
    }
}

function exportServiceRequestsAsJSON(requests, includeMetadata) {
    const data = requests.map(request => {
        const base = {
            serviceRequestNumber: request.serviceRequestNumber,
            companyName: request.companyName,
            address: request.address,
            productCode: request.productCode,
            machineNumber: request.machineNumber,
            orderNumber: request.orderNumber,
            productDescription: request.productDescription,
            model: request.model,
            serialNumber: request.serialNumber,
            manufacturer: request.manufacturer,
            problemDescription: request.problemDescription,
            problemDefinition: request.problemDefinition,
            serviceCompleted: request.serviceCompleted,
            notes: request.notes,
            contactPerson: request.contactPerson,
            phone: request.phone,
            startDate: request.startDate,
            startTime: request.startTime,
            endDate: request.endDate,
            endTime: request.endTime,
            totalDate: request.totalDate,
            totalTime: request.totalTime,
            travelInfo: request.travelInfo,
            serviceTypes: request.serviceTypes,
            status: request.status
        };

        if (includeMetadata) {
            base.createdAt = request.createdAt;
            base.updatedAt = request.updatedAt;
            base.userId = request.userId;
            base.userEmail = request.userEmail;
            base.userDisplayName = request.userDisplayName;
        }

        return base;
    });

    return JSON.stringify(data, null, 2);
}

function exportServiceRequestsAsCSV(requests, includeMetadata) {
    const headers = [
        'Service Request Number', 'Company Name', 'Address', 'Product Code', 'Machine Number',
        'Order Number', 'Product Description', 'Model', 'Serial Number', 'Manufacturer',
        'Problem Description', 'Problem Definition', 'Service Completed', 'Notes',
        'Contact Person', 'Phone', 'Start Date', 'Start Time', 'End Date', 'End Time',
        'Total Date', 'Total Time', 'Travel Info', 'Service Types', 'Status'
    ];

    if (includeMetadata) {
        headers.push('Created At', 'Updated At', 'User ID', 'User Email', 'User Display Name');
    }

    const rows = requests.map(request => {
        const row = [
            request.serviceRequestNumber || '',
            request.companyName || '',
            request.address || '',
            request.productCode || '',
            request.machineNumber || '',
            request.orderNumber || '',
            request.productDescription || '',
            request.model || '',
            request.serialNumber || '',
            request.manufacturer || '',
            request.problemDescription || '',
            request.problemDefinition || '',
            request.serviceCompleted || '',
            request.notes || '',
            request.contactPerson || '',
            request.phone || '',
            request.startDate || '',
            request.startTime || '',
            request.endDate || '',
            request.endTime || '',
            request.totalDate || '',
            request.totalTime || '',
            request.travelInfo || '',
            request.serviceTypes ? request.serviceTypes.join('; ') : '',
            request.status || ''
        ];

        if (includeMetadata) {
            row.push(
                request.createdAt ? new Date(request.createdAt.toDate()).toISOString() : '',
                request.updatedAt ? new Date(request.updatedAt.toDate()).toISOString() : '',
                request.userId || '',
                request.userEmail || '',
                request.userDisplayName || ''
            );
        }

        return row.map(field => `"${field}"`).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
}

function exportServiceRequestsAsHTML(requests, includeMetadata) {
    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Danh sách Phiếu yêu cầu dịch vụ</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; }
        .request { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .request h3 { margin: 0 0 10px 0; color: #333; }
        .field { margin-bottom: 5px; }
        .label { font-weight: bold; color: #666; }
        .status { padding: 2px 8px; border-radius: 3px; font-size: 0.9em; }
        .status-completed { background: #d4edda; color: #155724; }
        .status-in-progress { background: #fff3cd; color: #856404; }
        .status-pending { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <h1>Danh sách Phiếu yêu cầu dịch vụ (${requests.length})</h1>
    ${requests.map(request => `
        <div class="request">
            <h3>${request.serviceRequestNumber} - ${request.companyName}</h3>
            <div class="field"><span class="label">Model:</span> ${request.model || 'N/A'}</div>
            <div class="field"><span class="label">Người liên hệ:</span> ${request.contactPerson} (${request.phone})</div>
            <div class="field"><span class="label">Loại dịch vụ:</span> ${request.serviceTypes ? request.serviceTypes.join(', ') : 'N/A'}</div>
            <div class="field"><span class="label">Vấn đề:</span> ${request.problemDescription || 'N/A'}</div>
            <div class="field"><span class="label">Trạng thái:</span> <span class="status status-${request.status || 'pending'}">${request.status === 'completed' ? 'Hoàn thành' : request.status === 'in-progress' ? 'Đang thực hiện' : 'Chờ xử lý'}</span></div>
            ${includeMetadata ? `
                <div class="field"><span class="label">Ngày tạo:</span> ${request.createdAt ? new Date(request.createdAt.toDate()).toLocaleString('vi-VN') : 'N/A'}</div>
                <div class="field"><span class="label">Người tạo:</span> ${request.userDisplayName || request.userEmail || 'N/A'}</div>
            ` : ''}
        </div>
    `).join('')}
</body>
</html>`;
    return html;
}

function exportServiceRequestsAsMarkdown(requests, includeMetadata) {
    let markdown = `# Danh sách Phiếu yêu cầu dịch vụ (${requests.length})\n\n`;

    requests.forEach(request => {
        markdown += `## ${request.serviceRequestNumber} - ${request.companyName}\n\n`;
        markdown += `**Model:** ${request.model || 'N/A'}\n\n`;
        markdown += `**Người liên hệ:** ${request.contactPerson} (${request.phone})\n\n`;
        markdown += `**Loại dịch vụ:** ${request.serviceTypes ? request.serviceTypes.join(', ') : 'N/A'}\n\n`;
        markdown += `**Mô tả vấn đề:** ${request.problemDescription || 'N/A'}\n\n`;
        markdown += `**Trạng thái:** ${request.status === 'completed' ? 'Hoàn thành' : request.status === 'in-progress' ? 'Đang thực hiện' : 'Chờ xử lý'}\n\n`;

        if (includeMetadata) {
            markdown += `**Ngày tạo:** ${request.createdAt ? new Date(request.createdAt.toDate()).toLocaleString('vi-VN') : 'N/A'}\n\n`;
            markdown += `**Người tạo:** ${request.userDisplayName || request.userEmail || 'N/A'}\n\n`;
        }

        markdown += '---\n\n';
    });

    return markdown;
}

function updateServiceRequestStats() {
    const totalServiceRequestsEl = document.getElementById('totalServiceRequests');
    const completedRequestsEl = document.getElementById('completedRequests');
    const inProgressRequestsEl = document.getElementById('inProgressRequests');
    const pendingRequestsEl = document.getElementById('pendingRequests');

    if (totalServiceRequestsEl) {
        totalServiceRequestsEl.textContent = serviceRequests.length;
    }

    if (completedRequestsEl) {
        const completedCount = serviceRequests.filter(r => r.status === 'completed').length;
        completedRequestsEl.textContent = completedCount;
    }

    if (inProgressRequestsEl) {
        const inProgressCount = serviceRequests.filter(r => r.status === 'in-progress').length;
        inProgressRequestsEl.textContent = inProgressCount;
    }

    if (pendingRequestsEl) {
        const pendingCount = serviceRequests.filter(r => !r.status || r.status === 'pending').length;
        pendingRequestsEl.textContent = pendingCount;
    }

    // Update user stats for admin
    updateUserStats();

    // Update recent service requests
    const recentServiceRequestsContainer = document.getElementById('recentServiceRequests');
    if (recentServiceRequestsContainer) {
        const recentRequests = serviceRequests.slice(0, 5);

        if (recentRequests.length === 0) {
            recentServiceRequestsContainer.innerHTML = `
                <div class="text-center py-4 text-gray-500">
                    <p>Chưa có phiếu yêu cầu nào</p>
                </div>
            `;
            return;
        }

        const recentHtml = recentRequests.map(request => {
            const createdDate = request.createdAt ? new Date(request.createdAt.toDate()).toLocaleDateString('vi-VN') : 'Unknown';
            const statusClass = request.status === 'completed' ? 'status-active' :
                               request.status === 'in-progress' ? 'status-timeout' :
                               'status-broken';
            const statusText = request.status === 'completed' ? 'Hoàn thành' :
                              request.status === 'in-progress' ? 'Đang thực hiện' :
                              'Chờ xử lý';

            return `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex-1">
                        <h4 class="font-medium text-gray-800 truncate">${request.serviceRequestNumber}</h4>
                        <p class="text-sm text-gray-600 truncate">${request.companyName}</p>
                    </div>
                    <div class="text-right">
                        <span class="badge ${statusClass} text-xs">
                            ${statusText}
                        </span>
                        <p class="text-xs text-gray-500 mt-1">
                            ${createdDate}
                        </p>
                    </div>
                </div>
            `;
        }).join('');

        recentServiceRequestsContainer.innerHTML = recentHtml;
    }
}

function updateUserStats() {
    const userStatsContainer = document.getElementById('userStatsContainer');
    if (!userStatsContainer) return;

    // Check if allUsers is loaded, if not, return early
    if (!allUsers || allUsers.length === 0) {
        userStatsContainer.innerHTML = '<p class="text-gray-500 text-sm col-span-full text-center py-4">Đang tải dữ liệu người dùng...</p>';
        return;
    }

    // Calculate stats per user
    const userStats = {};
    allUsers.forEach(user => {
        userStats[user.uid] = {
            user: user,
            total: 0,
            completed: 0,
            inProgress: 0,
            pending: 0
        };
    });

    // Count requests per user
    serviceRequests.forEach(request => {
        if (userStats[request.userId]) {
            userStats[request.userId].total++;
            switch (request.status) {
                case 'completed':
                    userStats[request.userId].completed++;
                    break;
                case 'in-progress':
                    userStats[request.userId].inProgress++;
                    break;
                default:
                    userStats[request.userId].pending++;
            }
        }
    });

    // Generate HTML for user stats
    const userStatsHtml = Object.values(userStats)
        .filter(stats => stats.total > 0)
        .sort((a, b) => b.total - a.total)
        .slice(0, 6) // Show top 6 users
        .map(stats => {
            const user = stats.user;
            const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

            return `
                <div class="card p-4">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center">
                            <img src="${user.photoURL || 'https://picsum.photos/seed/' + user.uid + '/32/32.jpg'}" alt="Avatar" class="w-8 h-8 rounded-full mr-3">
                            <div>
                                <p class="font-medium text-gray-800 text-sm">${user.displayName || user.email || 'Unknown'}</p>
                                <p class="text-xs text-gray-500">${stats.total} phiếu</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-lg font-bold text-indigo-600">${completionRate}%</p>
                            <p class="text-xs text-gray-500">hoàn thành</p>
                        </div>
                    </div>
                    <div class="flex space-x-2 text-xs">
                        <span class="flex-1 bg-green-100 text-green-800 px-2 py-1 rounded text-center">${stats.completed} HT</span>
                        <span class="flex-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-center">${stats.inProgress} DX</span>
                        <span class="flex-1 bg-gray-100 text-gray-800 px-2 py-1 rounded text-center">${stats.pending} CX</span>
                    </div>
                </div>
            `;
        }).join('');

    userStatsContainer.innerHTML = userStatsHtml || '<p class="text-gray-500 text-sm col-span-full text-center py-4">Chưa có dữ liệu thống kê</p>';
}

window.viewServiceRequest = function(requestId) {
    const request = serviceRequests.find(r => r.id === requestId);
    if (!request) return;

    // Create a new window for viewing the service request
    const viewWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');

    if (!viewWindow) {
        showToast('Không thể mở cửa sổ mới. Vui lòng cho phép popup trong trình duyệt.', 'error');
        return;
    }
    
    // Store reference to the window
    window.viewServiceRequestWindow = viewWindow;

    const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Chi tiết Phiếu yêu cầu: ${request.serviceRequestNumber}</title>
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
<style>
    body {
        background: #f9fafb;
        font-family: 'Inter', sans-serif;
    }
    .panel {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        margin: 10px;
        padding: 16px;
    }
    @media (min-width: 768px) {
        .panel {
            margin: 20px;
            padding: 24px;
        }
    }
    .section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: #111827;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #4f46e5;
    }
    @media (min-width: 768px) {
        .section-title {
            font-size: 1.25rem;
        }
    }
    .field-group {
        margin-bottom: 1.5rem;
    }
    .field-label {
        display: block;
        font-size: 0.875rem;
        font-weight: 600;
        color: #374151;
        margin-bottom: 0.5rem;
    }
    .field-value {
        padding: 0.75rem;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        color: #111827;
        line-height: 1.5;
        font-size: 0.875rem;
    }
    .status-badge {
        display: inline-block;
        padding: 0.5rem 1rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 600;
    }
    .status-completed { background: #dcfce7; color: #166534; }
    .status-in-progress { background: #fef3c7; color: #92400e; }
    .status-pending { background: #f3f4f6; color: #374151; }
    .service-tag {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background: #e0e7ff;
        color: #3730a3;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
        margin-right: 0.5rem;
        margin-bottom: 0.5rem;
    }
    .action-buttons {
        position: fixed;
        bottom: 10px;
        right: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        z-index: 1000;
    }
    @media (min-width: 768px) {
        .action-buttons {
            bottom: 20px;
            right: 20px;
            flex-direction: row;
            gap: 12px;
        }
    }
    .action-btn {
        padding: 10px 16px;
        border-radius: 8px;
        font-weight: 600;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s ease;
        font-size: 0.875rem;
    }
    @media (min-width: 768px) {
        .action-btn {
            padding: 12px 20px;
            font-size: 1rem;
        }
    }
    .action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .btn-edit { background: #2563eb; color: white; }
    .btn-delete { background: #dc2626; color: white; }
    .btn-print { background: #059669; color: white; }
    .btn-close { background: #6b7280; color: white; }
    @media print {
        .action-buttons { display: none; }
        .panel {
            margin: 0;
            box-shadow: none;
            padding: 4px;
            font-size: 8px;
        }
        .section-title {
            font-size: 10px;
            margin-bottom: 4px;
            padding-bottom: 2px;
        }
        .field-group {
            margin-bottom: 4px;
        }
        .field-label {
            font-size: 7px;
            margin-bottom: 1px;
        }
        .field-value {
            padding: 2px;
            font-size: 8px;
            line-height: 1.1;
        }
        .grid {
            grid-gap: 4px;
        }
        .service-tag {
            font-size: 6px;
            padding: 1px 4px;
            margin-right: 2px;
            margin-bottom: 2px;
        }
        .status-badge {
            font-size: 7px;
            padding: 2px 6px;
        }
        .panel > div {
            margin-bottom: 4px;
        }
        .border-t {
            border-top: 1px solid #e5e7eb !important;
            padding-top: 3px !important;
        }
        .border-b {
            border-bottom: 1px solid #9ca3af !important;
        }
        .mt-6 {
            margin-top: 6px !important;
        }
        .pt-4 {
            padding-top: 3px !important;
        }
        .pb-8 {
            padding-bottom: 8px !important;
        }
        .gap-8 {
            gap: 6px !important;
        }
        .gap-4 {
            gap: 4px !important;
        }
        h1 {
            font-size: 14px;
            margin-bottom: 4px;
        }
        h2 {
            font-size: 12px;
            margin-bottom: 3px;
        }
        .text-lg {
            font-size: 10px;
        }
        .text-base {
            font-size: 8px;
        }
        .text-sm {
            font-size: 7px;
        }
        .text-xs {
            font-size: 6px;
        }
        .whitespace-pre-wrap {
            white-space: pre-wrap;
            word-wrap: break-word;
            max-height: 40px;
            overflow: hidden;
        }
        @page {
            margin: 5mm;
            size: A4;
        }
    }
</style>
</head>
<body>
    <div class="panel">
        <div class="flex flex-col sm:flex-row justify-between items-start mb-2 sm:mb-4 gap-2">
            <div>
                <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Phiếu yêu cầu dịch vụ</h1>
                <p class="text-base sm:text-lg text-gray-600">Mã phiếu: <span class="font-semibold text-indigo-600">${request.serviceRequestNumber || 'N/A'}</span></p>
            </div>
            <div class="text-left sm:text-right w-full sm:w-auto">
                <div class="status-badge status-${request.status || 'pending'} mb-2">
                    ${request.status === 'completed' ? 'Hoàn thành' :
                      request.status === 'in-progress' ? 'Đang thực hiện' :
                      'Chờ xử lý'}
                </div>
                <p class="text-sm text-gray-500">
                    Ngày tạo: ${request.createdAt ? new Date(request.createdAt.toDate()).toLocaleDateString('vi-VN') : 'N/A'}
                </p>
            </div>
        </div>

        <!-- Thông tin cơ bản -->
        <div class="mb-2 sm:mb-4">
            <h2 class="section-title">Thông tin công ty</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div class="field-group">
                    <label class="field-label">Tên công ty</label>
                    <div class="field-value">${request.companyName || 'N/A'}</div>
                </div>
                <div class="field-group">
                    <label class="field-label">Người liên hệ</label>
                    <div class="field-value">${request.contactPerson || 'N/A'}</div>
                </div>
                <div class="field-group">
                    <label class="field-label">Địa chỉ</label>
                    <div class="field-value">${request.address || 'N/A'}</div>
                </div>
                <div class="field-group">
                    <label class="field-label">Điện thoại</label>
                    <div class="field-value">${request.phone || 'N/A'}</div>
                </div>
            </div>
        </div>

        <!-- Thông tin kỹ thuật -->
        <div class="mb-2 sm:mb-4">
            <h2 class="section-title">Thông tin thiết bị</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                <div class="field-group">
                    <label class="field-label">Mã hàng</label>
                    <div class="field-value">${request.productCode || 'N/A'}</div>
                </div>
                <div class="field-group">
                    <label class="field-label">Số máy</label>
                    <div class="field-value">${request.machineNumber || 'N/A'}</div>
                </div>
                <div class="field-group">
                    <label class="field-label">Mã số đơn hàng</label>
                    <div class="field-value">${request.orderNumber || 'N/A'}</div>
                </div>
                <div class="field-group">
                    <label class="field-label">Model</label>
                    <div class="field-value">${request.model || 'N/A'}</div>
                </div>
                <div class="field-group">
                    <label class="field-label">Số hiệu</label>
                    <div class="field-value">${request.serialNumber || 'N/A'}</div>
                </div>
                <div class="field-group">
                    <label class="field-label">Hãng sản xuất</label>
                    <div class="field-value">${request.manufacturer || 'N/A'}</div>
                </div>
            </div>
        </div>

        <!-- Dịch vụ yêu cầu -->
        <div class="mb-2 sm:mb-4">
            <h2 class="section-title">Dịch vụ yêu cầu</h2>
            <div class="field-group">
                <label class="field-label">Loại dịch vụ</label>
                <div class="field-value">
                    ${request.serviceTypes && request.serviceTypes.length > 0 ?
                        request.serviceTypes.map(type => `<span class="service-tag">${type}</span>`).join('') :
                        '<span class="text-gray-500">Không có dịch vụ nào được chọn</span>'
                    }
                </div>
            </div>
        </div>

        <!-- Mô tả vấn đề -->
        <div class="mb-2 sm:mb-4">
            <h2 class="section-title">Mô tả vấn đề</h2>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-4">
                <div class="field-group">
                    <label class="field-label">Mô tả hàng hoá</label>
                    <div class="field-value">${request.productDescription || 'N/A'}</div>
                </div>
                <div class="field-group">
                    <label class="field-label">Mô tả tình trạng</label>
                    <div class="field-value">${request.problemDescription || 'N/A'}</div>
                </div>
            </div>
            <div class="field-group">
                <label class="field-label">Problem definition</label>
                <div class="field-value">${request.problemDefinition || 'N/A'}</div>
            </div>
        </div>

        <!-- Dịch vụ đã hoàn thành -->
        <div class="mb-4 sm:mb-6">
            <h2 class="section-title">Dịch vụ đã thực hiện</h2>
            <div class="field-group">
                <label class="field-label">Dịch vụ đã hoàn thành & Diễn giải chi tiết dịch vụ</label>
                <div class="field-value whitespace-pre-wrap">${request.serviceCompleted || 'N/A'}</div>
            </div>
        </div>

        <!-- Thời gian thực hiện -->
        <div class="mb-4 sm:mb-6">
            <h2 class="section-title">Thời gian thực hiện</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div class="field-group">
                    <label class="field-label">Thời gian bắt đầu</label>
                    <div class="field-value">${request.startDate || 'N/A'} ${request.startTime || ''}</div>
                </div>
                <div class="field-group">
                    <label class="field-label">Thời gian kết thúc</label>
                    <div class="field-value">${request.endDate || 'N/A'} ${request.endTime || ''}</div>
                </div>
                <div class="field-group">
                    <label class="field-label">Tổng thời gian - Ngày</label>
                    <div class="field-value">${request.totalDate || 'N/A'}</div>
                </div>
                <div class="field-group">
                    <label class="field-label">Tổng thời gian - Giờ</label>
                    <div class="field-value">${request.totalTime || 'N/A'}</div>
                </div>
            </div>
            <div class="field-group">
                <label class="field-label">Thời gian di chuyển tới khách hàng và khoảng cách</label>
                <div class="field-value">${request.travelInfo || 'N/A'}</div>
            </div>
        </div>

        <!-- Ghi chú -->
        <div class="mb-4 sm:mb-6">
            <h2 class="section-title">Ghi chú</h2>
            <div class="field-group">
                <div class="field-value whitespace-pre-wrap">${request.notes || 'N/A'}</div>
            </div>
        </div>

        <!-- Thông tin người tạo và chữ ký -->
        <div class="border-t pt-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="text-xs text-gray-600">
                    <p><strong>Người tạo:</strong> ${request.userDisplayName || request.userEmail || 'N/A'}</p>
                    <p><strong>Email:</strong> ${request.userEmail || 'N/A'}</p>
                    <p><strong>Cập nhật lần cuối:</strong> ${request.updatedAt ? new Date(request.updatedAt.toDate()).toLocaleString('vi-VN') : 'N/A'}</p>
                </div>
                <div class="text-xs text-gray-600">
                    <p><strong>Người lập:</strong> _______________________</p>
                    <p><strong>Ngày lập:</strong> _______________________</p>
                </div>
            </div>
        </div>
        
        <!-- Chữ ký -->
        <div class="mt-3 border-t pt-2">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div class="text-center">
                    <p class="text-xs font-medium mb-2">NGƯỜI LẬP PHIẾU</p>
                    <div class="border-b border-gray-400 pb-8">
                        <p class="text-xs text-gray-500 mt-8">(Ký và ghi rõ họ tên)</p>
                    </div>
                </div>
                <div class="text-center">
                    <p class="text-xs font-medium mb-2">KHÁCH HÀNG</p>
                    <div class="border-b border-gray-400 pb-8">
                        <p class="text-xs text-gray-500 mt-8">(Ký và ghi rõ họ tên)</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
        <button onclick="window.print()" class="action-btn btn-print">
            <i class="fas fa-print"></i> In phiếu
        </button>
        <button onclick="window.close()" class="action-btn btn-close">
            <i class="fas fa-times"></i> Đóng
        </button>
    </div>

    <script>
        // Auto-resize window to fit content
        window.addEventListener('load', function() {
            setTimeout(function() {
                const contentHeight = document.body.scrollHeight + 100;
                const contentWidth = Math.min(document.body.scrollWidth + 40, screen.width * 0.9);
                window.resizeTo(contentWidth, Math.min(contentHeight, screen.height * 0.9));
            }, 100);
        });
    </script>
</body>
</html>`;

    viewWindow.document.write(htmlContent);
    viewWindow.document.close();
};

window.editServiceRequest = function(requestId) {
    const request = serviceRequests.find(r => r.id === requestId);
    if (!request) return;

    // Store the current request ID for form submission
    window.currentEditingRequestId = requestId;
    const editRequestIdEl = document.getElementById('editRequestId');
    if (editRequestIdEl) {
        editRequestIdEl.value = requestId;
    }

    // Populate the modal form with request data
    const editServiceRequestNumberEl = document.getElementById('editServiceRequestNumber');
    if (editServiceRequestNumberEl) editServiceRequestNumberEl.value = request.serviceRequestNumber || '';
    
    const editCompanyNameEl = document.getElementById('editCompanyName');
    if (editCompanyNameEl) editCompanyNameEl.value = request.companyName || '';
    
    const editContactPersonEl = document.getElementById('editContactPerson');
    if (editContactPersonEl) editContactPersonEl.value = request.contactPerson || '';
    
    const editPhoneEl = document.getElementById('editPhone');
    if (editPhoneEl) editPhoneEl.value = request.phone || '';
    
    const editAddressEl = document.getElementById('editAddress');
    if (editAddressEl) editAddressEl.value = request.address || '';
    
    const editProductCodeEl = document.getElementById('editProductCode');
    if (editProductCodeEl) editProductCodeEl.value = request.productCode || '';
    
    const editMachineNumberEl = document.getElementById('editMachineNumber');
    if (editMachineNumberEl) editMachineNumberEl.value = request.machineNumber || '';
    
    const editOrderNumberEl = document.getElementById('editOrderNumber');
    if (editOrderNumberEl) editOrderNumberEl.value = request.orderNumber || '';
    
    const editProductDescriptionEl = document.getElementById('editProductDescription');
    if (editProductDescriptionEl) editProductDescriptionEl.value = request.productDescription || '';
    
    const editModelEl = document.getElementById('editModel');
    if (editModelEl) editModelEl.value = request.model || '';
    
    const editSerialNumberEl = document.getElementById('editSerialNumber');
    if (editSerialNumberEl) editSerialNumberEl.value = request.serialNumber || '';
    
    const editManufacturerEl = document.getElementById('editManufacturer');
    if (editManufacturerEl) editManufacturerEl.value = request.manufacturer || '';
    
    const editProblemDescriptionEl = document.getElementById('editProblemDescription');
    if (editProblemDescriptionEl) editProblemDescriptionEl.value = request.problemDescription || '';
    
    const editProblemDefinitionEl = document.getElementById('editProblemDefinition');
    if (editProblemDefinitionEl) editProblemDefinitionEl.value = request.problemDefinition || '';
    
    const editServiceCompletedEl = document.getElementById('editServiceCompleted');
    if (editServiceCompletedEl) editServiceCompletedEl.value = request.serviceCompleted || '';
    
    const editNotesEl = document.getElementById('editNotes');
    if (editNotesEl) editNotesEl.value = request.notes || '';
    
    const editStartDateEl = document.getElementById('editStartDate');
    if (editStartDateEl) editStartDateEl.value = request.startDate || '';
    
    const editStartTimeEl = document.getElementById('editStartTime');
    if (editStartTimeEl) editStartTimeEl.value = request.startTime || '';
    
    const editEndDateEl = document.getElementById('editEndDate');
    if (editEndDateEl) editEndDateEl.value = request.endDate || '';
    
    const editEndTimeEl = document.getElementById('editEndTime');
    if (editEndTimeEl) editEndTimeEl.value = request.endTime || '';
    
    const editTotalDateEl = document.getElementById('editTotalDate');
    if (editTotalDateEl) editTotalDateEl.value = request.totalDate || '';
    
    const editTotalTimeEl = document.getElementById('editTotalTime');
    if (editTotalTimeEl) editTotalTimeEl.value = request.totalTime || '';
    
    const editTravelInfoEl = document.getElementById('editTravelInfo');
    if (editTravelInfoEl) editTravelInfoEl.value = request.travelInfo || '';
    
    const editStatusEl = document.getElementById('editStatus');
    if (editStatusEl) editStatusEl.value = request.status || 'pending';

    // Set service types checkboxes
    const serviceTypes = request.serviceTypes || [];
    document.querySelectorAll('#editServiceRequestModal input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = serviceTypes.includes(checkbox.value);
    });

    // Show the modal
    showModal('editServiceRequestModal');
};

// Check for closed popup windows and reload data
setInterval(function() {
    if (window.editServiceRequestWindow && window.editServiceRequestWindow.closed) {
        console.log('Edit window was closed, reloading data');
        showLoading(true);
        loadServiceRequests().then(() => {
            renderServiceRequests();
            updateServiceRequestStats();
            showLoading(false);
        }).catch(error => {
            console.error('Error reloading service requests:', error);
            showLoading(false);
        });
        window.editServiceRequestWindow = null;
    }
}, 1000);

// Function to update service request in the main window list
window.updateServiceRequestInList = function(requestId, updatedData) {
    console.log('Direct update called for requestId:', requestId, 'with data:', updatedData);
    
    // Find the request in the local array
    const index = serviceRequests.findIndex(r => r.id === requestId);
    if (index !== -1) {
        // Update the local array with new data
        serviceRequests[index] = { ...serviceRequests[index], ...updatedData };
        console.log('Updated local service request:', serviceRequests[index]);
        
        // Refresh the UI
        renderServiceRequests();
        updateServiceRequestStats();
        
        // Show success message
        showToast('Phiếu yêu cầu đã được cập nhật thành công!', 'success');
    } else {
        console.error('Service request not found in local array:', requestId);
    }
};

// Alternative data synchronization using localStorage
window.syncServiceRequestUpdate = function(requestId, updatedData) {
    try {
        // Store update in localStorage for cross-window communication
        const updateKey = `serviceRequestUpdate_${requestId}`;
        localStorage.setItem(updateKey, JSON.stringify({
            requestId: requestId,
            data: updatedData,
            timestamp: Date.now()
        }));
        
        // Trigger a custom event for the main window
        const event = new CustomEvent('serviceRequestUpdated', {
            detail: {
                requestId: requestId,
                data: updatedData
            }
        });
        window.dispatchEvent(event);
        
        console.log('Stored update in localStorage and dispatched event');
    } catch (error) {
        console.error('Error in syncServiceRequestUpdate:', error);
    }
};

// Check for updates in localStorage
window.checkForServiceRequestUpdates = function() {
    try {
        // Get all keys that match our pattern
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('serviceRequestUpdate_')) {
                const updateData = JSON.parse(localStorage.getItem(key));
                
                // Only process if it's from the last 5 seconds
                if (Date.now() - updateData.timestamp < 5000) {
                    console.log('Processing update from localStorage:', updateData);
                    
                    // Update the local array
                    const index = serviceRequests.findIndex(r => r.id === updateData.requestId);
                    if (index !== -1) {
                        serviceRequests[index] = { ...serviceRequests[index], ...updateData.data };
                        renderServiceRequests();
                        updateServiceRequestStats();
                        showToast('Phiếu yêu cầu đã được cập nhật thành công!', 'success');
                    }
                    
                    // Remove the processed update
                    localStorage.removeItem(key);
                }
            }
        }
    } catch (error) {
        console.error('Error checking for updates:', error);
    }
};

// Handle direct service request updates from popup windows
window.handleServiceRequestUpdate = function(requestId, updatedData) {
    console.log('Handling direct service request update:', requestId, updatedData);
    
    // Update the local array
    const index = serviceRequests.findIndex(r => r.id === requestId);
    if (index !== -1) {
        serviceRequests[index] = { ...serviceRequests[index], ...updatedData };
        console.log('Updated service request in local array:', serviceRequests[index]);
        
        // Refresh UI
        renderServiceRequests();
        updateServiceRequestStats();
        showToast('Phiếu yêu cầu đã được cập nhật thành công!', 'success');
    } else {
        console.error('Service request not found in local array:', requestId);
        // If not found locally, reload from Firestore
        loadServiceRequests().then(() => {
            renderServiceRequests();
            updateServiceRequestStats();
        }).catch(error => {
            console.error('Error reloading service requests:', error);
        });
    }
};

// Initialize new service request form
function initializeNewServiceRequestForm() {
    console.log('Initializing new service request form');
    
    // Check if form exists
    const form = document.getElementById('serviceRequestForm');
    if (!form) {
        console.error('Service request form not found in DOM');
        console.log('Available elements with IDs:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
        return;
    }
    
    // Generate service request number
    const serviceRequestNumber = generateServiceRequestNumber();
    const serviceRequestNumberEl = document.getElementById('serviceRequestNumber');
    if (serviceRequestNumberEl) {
        serviceRequestNumberEl.value = serviceRequestNumber;
        console.log('Service request number set to:', serviceRequestNumber);
    } else {
        console.error('Service request number input not found');
    }
    
    // Set default note
    const notesEl = document.getElementById('notes');
    if (notesEl) {
        notesEl.value = 'Thiết bị hoạt động ổn định, đường chuẩn vẫn còn áp dụng được với các mẫu phân tích hiện tại';
        console.log('Default note set');
    } else {
        console.error('Notes textarea not found');
    }
    
    // Remove existing event listener to prevent duplicates
    form.removeEventListener('submit', handleNewServiceRequestSubmit);
    
    // Add form submit event listener
    form.addEventListener('submit', handleNewServiceRequestSubmit);
    
    console.log('Service request form initialized successfully');
    console.log('Form element:', form);
    console.log('Form parent:', form.parentElement);
    console.log('Form parent visibility:', window.getComputedStyle(form.parentElement).display);
}

// Generate service request number
function generateServiceRequestNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `N1-${year}/${month}/${day}/${hours}/${minutes}/${seconds}`;
}

// Handle new service request form submission
async function handleNewServiceRequestSubmit(e) {
    e.preventDefault();
    
    if (!currentUser || !currentUser.uid) {
        showToast('Vui lòng đăng nhập trước', 'error');
        return;
    }
    
    // Show loading state
    showLoading(true);
    
    try {
        // Get form element
        const form = e.target;
        
        // Collect form data
        const formData = {
            serviceRequestNumber: document.getElementById('serviceRequestNumber').value,
            companyName: document.getElementById('companyName').value,
            address: document.getElementById('address').value,
            productCode: document.getElementById('productCode').value,
            machineNumber: document.getElementById('machineNumber').value,
            orderNumber: document.getElementById('orderNumber').value,
            productDescription: document.getElementById('productDescription').value,
            model: document.getElementById('model').value,
            serialNumber: document.getElementById('serialNumber').value,
            manufacturer: document.getElementById('manufacturer').value,
            problemDescription: document.getElementById('problemDescription').value,
            problemDefinition: document.getElementById('problemDefinition').value,
            serviceCompleted: document.getElementById('serviceCompleted').value,
            notes: document.getElementById('notes').value,
            contactPerson: document.getElementById('contactPerson').value,
            phone: document.getElementById('phone').value,
            startDate: document.getElementById('startDate').value,
            startTime: document.getElementById('startTime').value,
            endDate: document.getElementById('endDate').value,
            endTime: document.getElementById('endTime').value,
            totalDate: document.getElementById('totalDate').value,
            totalTime: document.getElementById('totalTime').value,
            travelInfo: document.getElementById('travelInfo').value,
            userId: currentUser.uid,
            userEmail: currentUser.email,
            userDisplayName: currentUser.displayName,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Collect service types
        const serviceTypes = [];
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        checkboxes.forEach(checkbox => {
            if (checkbox.value) {
                serviceTypes.push(checkbox.value);
            }
        });
        formData.serviceTypes = serviceTypes;
        
        console.log('Collected service types:', serviceTypes);
        
        console.log('Saving service request with data:', formData);
        
        // Save to Firestore
        await db.collection('serviceRequests').add(formData);
        
        showToast('Phiếu yêu cầu dịch vụ đã được lưu thành công!', 'success');
        
        // Reset form
        form.reset();
        const serviceRequestNumberEl = document.getElementById('serviceRequestNumber');
        if (serviceRequestNumberEl) {
            serviceRequestNumberEl.value = generateServiceRequestNumber();
        }
        const notesEl = document.getElementById('notes');
        if (notesEl) {
            notesEl.value = 'Thiết bị hoạt động ổn định, đường chuẩn vẫn còn áp dụng được với các mẫu phân tích hiện tại';
        }
        
        // Switch to service requests list
        setTimeout(() => {
            showSection('links');
        }, 1500);
        
    } catch (error) {
        console.error('Error saving service request:', error);
        showToast('Lỗi khi lưu phiếu yêu cầu: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Reset service request form
function resetServiceRequestForm() {
    const form = document.getElementById('serviceRequestForm');
    if (form) {
        form.reset();
        const serviceRequestNumberEl = document.getElementById('serviceRequestNumber');
        if (serviceRequestNumberEl) {
            serviceRequestNumberEl.value = generateServiceRequestNumber();
        }
        const notesEl = document.getElementById('notes');
        if (notesEl) {
            notesEl.value = 'Thiết bị hoạt động ổn định, đường chuẩn vẫn còn áp dụng được với các mẫu phân tích hiện tại';
        }
    }
}

// Import/Export functions
function showImportModal() {
    console.log('Showing import modal');
    const modal = document.getElementById('importModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('active');
        console.log('Import modal shown');
    } else {
        console.error('Import modal not found');
    }
}

function hideImportModal() {
    const modal = document.getElementById('importModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('active');
    }
    const importFile = document.getElementById('importFile');
    if (importFile) {
        importFile.value = '';
    }
    const importPreview = document.getElementById('importPreview');
    if (importPreview) {
        importPreview.classList.add('hidden');
    }
    const importPreviewBody = document.getElementById('importPreviewBody');
    if (importPreviewBody) {
        importPreviewBody.innerHTML = '';
    }
}

function toggleExportMenu() {
    const menu = document.getElementById('exportMenu');
    menu.classList.toggle('hidden');
}

// Close export menu when clicking outside
document.addEventListener('click', function(e) {
    const exportMenu = document.getElementById('exportMenu');
    if (exportMenu && !e.target.closest('#exportMenu') && !e.target.closest('[onclick*="toggleExportMenu"]')) {
        exportMenu.classList.add('hidden');
    }
});

// Handle file selection for import
document.addEventListener('DOMContentLoaded', function() {
    const importFile = document.getElementById('importFile');
    if (importFile) {
        importFile.addEventListener('change', handleFileSelect);
    }
    
    // Also add event listener when import modal is shown
    const importModal = document.getElementById('importModal');
    if (importModal) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (!importModal.classList.contains('hidden')) {
                        const importFile = document.getElementById('importFile');
                        if (importFile && !importFile.hasAttribute('data-listener-added')) {
                            importFile.addEventListener('change', handleFileSelect);
                            importFile.setAttribute('data-listener-added', 'true');
                            console.log('Added file select listener to import modal');
                        }
                    }
                }
            });
        });
        observer.observe(importModal, { attributes: true });
    }
});

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv');
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isCSV && !isExcel) {
        showToast('Vui lòng chọn file CSV hoặc Excel', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            let data;
            if (isCSV) {
                data = parseCSV(e.target.result);
            } else {
                // For Excel files, we'll need a library like SheetJS
                showToast('Đang xử lý file Excel...', 'info');
                // For now, just show a message
                return;
            }

            showImportPreview(data);
        } catch (error) {
            console.error('Error reading file:', error);
            showToast('Lỗi đọc file: ' + error.message, 'error');
        }
    };

    if (isCSV) {
        reader.readAsText(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
}

function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index];
            });
            data.push(row);
        }
    }

    return data;
}

function showImportPreview(data) {
    const preview = document.getElementById('importPreview');
    const previewBody = document.getElementById('importPreviewBody');

    if (!preview || !previewBody) return;

    if (data.length === 0) {
        showToast('File không có dữ liệu', 'warning');
        return;
    }

    // Show preview (max 10 rows)
    const previewData = data.slice(0, 10);
    const headers = Object.keys(previewData[0] || {});

    const headerHtml = headers.map(header => `<th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">${header}</th>`).join('');
    
    const rowHtml = previewData.map(row => {
        const cells = headers.map(header => `<td class="px-2 py-2 text-sm">${row[header] || ''}</td>`).join('');
        return `<tr>${cells}</tr>`;
    }).join('');

    previewBody.innerHTML = `
        <tr class="bg-gray-50">${headerHtml}</tr>
        ${rowHtml}
    `;

    preview.classList.remove('hidden');
    
    if (data.length > 10) {
        previewBody.innerHTML += `
            <tr>
                <td colspan="${headers.length}" class="px-2 py-4 text-center text-sm text-gray-500">
                    ... và ${data.length - 10} dòng nữa
                </td>
            </tr>
        `;
    }
}

async function processImport() {
    const file = document.getElementById('importFile').files[0];
    if (!file) {
        showToast('Vui lòng chọn file để nhập', 'warning');
        return;
    }

    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv');
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    let data;
    try {
        if (isCSV) {
            const reader = new FileReader();
            reader.onload = function(e) {
                data = parseCSV(e.target.result);
                performImport(data);
            };
            reader.readAsText(file);
        } else {
            showToast('Chỉ hỗ trợ file CSV hiện tại', 'warning');
        }
    } catch (error) {
        console.error('Error processing file:', error);
        showToast('Lỗi xử lý file: ' + error.message, 'error');
    }
}

async function performImport(data) {
    if (!data || data.length === 0) {
        showToast('Không có dữ liệu để nhập', 'warning');
        return;
    }

    const skipDuplicatesEl = document.getElementById('skipDuplicates');
    const validateDataEl = document.getElementById('validateData');
    const skipDuplicates = skipDuplicatesEl ? skipDuplicatesEl.checked : false;
    const validateData = validateDataEl ? validateDataEl.checked : true;

    showLoading(true);
    hideImportModal();

    try {
        const results = await importServiceRequests(data, {
            skipDuplicates,
            validateData
        });

        let message = `Nhập dữ liệu hoàn tất!\n`;
        message += `- Thành công: ${results.success}\n`;
        message += `- Thất bại: ${results.failed}\n`;
        if (results.duplicates > 0) {
            message += `- Bỏ qua trùng lặp: ${results.duplicates}\n`;
        }

        if (results.errors.length > 0) {
            message += `\nLỗi chi tiết:\n`;
            results.errors.slice(0, 5).forEach(error => {
                message += `- ${error}\n`;
            });
            if (results.errors.length > 5) {
                message += `... và ${results.errors.length - 5} lỗi nữa\n`;
            }
        }

        showToast(message, results.failed > 0 ? 'warning' : 'success');

        // Reload data
        await loadServiceRequests();
        renderServiceRequests();
        updateServiceRequestStats();

    } catch (error) {
        console.error('Import error:', error);
        showToast('Lỗi nhập dữ liệu: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Redirect to data management page for export functionality
function exportData(format) {
    window.location.href = 'quanludulieu.html';
}

// Redirect to data management page for export functionality
function exportWithFilters(format) {
    window.location.href = 'quanludulieu.html';
}

// Redirect to data management page for export functionality
function exportByUser() {
    window.location.href = 'quanludulieu.html';
}

// Initialize data management section
function initializeDataManagementSection() {
    console.log('Initializing data management section');
    
    // Populate user filter for data table
    const dataUserFilterEl = document.getElementById('dataServiceRequestUser');
    if (dataUserFilterEl && allUsers.length > 0) {
        // Clear existing options
        dataUserFilterEl.innerHTML = '<option value="">Tất cả người dùng</option>';
        
        // Add user options
        allUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.uid;
            option.textContent = user.displayName || user.email || 'Unknown User';
            dataUserFilterEl.appendChild(option);
        });
    }
    
    // Add event listeners for data management filters
    const dataSearchEl = document.getElementById('dataServiceRequestSearch');
    const dataStatusEl = document.getElementById('dataServiceRequestStatus');
    const dataUserEl = document.getElementById('dataServiceRequestUser');
    const dataDateFromEl = document.getElementById('dataServiceRequestDateFrom');
    const dataDateToEl = document.getElementById('dataServiceRequestDateTo');
    
    if (dataSearchEl) {
        dataSearchEl.addEventListener('input', renderDataManagementTable);
    }
    if (dataStatusEl) {
        dataStatusEl.addEventListener('change', renderDataManagementTable);
    }
    if (dataUserEl) {
        dataUserEl.addEventListener('change', renderDataManagementTable);
    }
    if (dataDateFromEl) {
        dataDateFromEl.addEventListener('change', renderDataManagementTable);
    }
    if (dataDateToEl) {
        dataDateToEl.addEventListener('change', renderDataManagementTable);
    }
    
    // Load and render data
    loadDataManagementTable();
}

// Load data for data management table
async function loadDataManagementTable() {
    try {
        // Show loading state
        const loadingRow = document.getElementById('dataLoadingRow');
        if (loadingRow) {
            loadingRow.style.display = 'table-row';
        }
        
        // Load service requests if not already loaded
        if (serviceRequests.length === 0) {
            await loadServiceRequests();
        }
        
        // Update stats
        updateDataManagementStats();
        
        // Render table
        renderDataManagementTable();
        
        // Hide loading state
        if (loadingRow) {
            loadingRow.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error loading data management table:', error);
        showToast('Lỗi tải dữ liệu: ' + error.message, 'error');
        
        // Hide loading state
        const loadingRow = document.getElementById('dataLoadingRow');
        if (loadingRow) {
            loadingRow.style.display = 'none';
        }
    }
}

// Update data management statistics
function updateDataManagementStats() {
    const totalServiceRequestsEl = document.getElementById('dataTotalServiceRequests');
    const completedRequestsEl = document.getElementById('dataCompletedRequests');
    const inProgressRequestsEl = document.getElementById('dataInProgressRequests');
    const pendingRequestsEl = document.getElementById('dataPendingRequests');
    
    if (totalServiceRequestsEl) {
        totalServiceRequestsEl.textContent = serviceRequests.length;
    }
    
    if (completedRequestsEl) {
        const completedCount = serviceRequests.filter(r => r.status === 'completed').length;
        completedRequestsEl.textContent = completedCount;
    }
    
    if (inProgressRequestsEl) {
        const inProgressCount = serviceRequests.filter(r => r.status === 'in-progress').length;
        inProgressRequestsEl.textContent = inProgressCount;
    }
    
    if (pendingRequestsEl) {
        const pendingCount = serviceRequests.filter(r => !r.status || r.status === 'pending').length;
        pendingRequestsEl.textContent = pendingCount;
    }
}

// Render data management table
function renderDataManagementTable() {
    const tableBody = document.getElementById('dataServiceRequestsTableBody');
    if (!tableBody) return;
    
    const searchTerm = document.getElementById('dataServiceRequestSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('dataServiceRequestStatus')?.value || '';
    const userFilter = document.getElementById('dataServiceRequestUser')?.value || '';
    const dateFrom = document.getElementById('dataServiceRequestDateFrom')?.value || '';
    const dateTo = document.getElementById('dataServiceRequestDateTo')?.value || '';
    
    let filteredRequests = serviceRequests.filter(request => {
        const matchesSearch = !searchTerm ||
            request.serviceRequestNumber?.toLowerCase().includes(searchTerm) ||
            request.companyName?.toLowerCase().includes(searchTerm) ||
            request.contactPerson?.toLowerCase().includes(searchTerm) ||
            request.phone?.toLowerCase().includes(searchTerm) ||
            request.address?.toLowerCase().includes(searchTerm) ||
            request.model?.toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusFilter || request.status === statusFilter;
        const matchesUser = !userFilter || request.userId === userFilter;
        
        let matchesDate = true;
        if (dateFrom || dateTo) {
            const requestDate = new Date(request.createdAt.toDate());
            if (dateFrom) {
                const fromDate = new Date(dateFrom);
                matchesDate = matchesDate && requestDate >= fromDate;
            }
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999); // End of day
                matchesDate = matchesDate && requestDate <= toDate;
            }
        }
        
        return matchesSearch && matchesStatus && matchesUser && matchesDate;
    });
    
    // Clear table body
    tableBody.innerHTML = '';
    
    if (filteredRequests.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                    <div class="flex flex-col items-center">
                        <i class="fas fa-inbox text-4xl mb-2 text-gray-300"></i>
                        <p>Không có dữ liệu phù hợp với bộ lọc</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Get user data for attribution
    const userData = loadUserData();
    const isAdmin = userData && userData.role === 'admin';
    
    // Create table rows
    filteredRequests.forEach(request => {
        const createdDate = request.createdAt ? new Date(request.createdAt.toDate()).toLocaleDateString('vi-VN') : 'N/A';
        const statusClass = request.status === 'completed' ? 'bg-green-100 text-green-800' :
                           request.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                           'bg-gray-100 text-gray-800';
        const statusText = request.status === 'completed' ? 'Hoàn thành' :
                          request.status === 'in-progress' ? 'Đang thực hiện' :
                          'Chờ xử lý';
        
        // Show user attribution for admin
        const showUserInfo = isAdmin && request.userId !== currentUser.uid;
        const userInfo = showUserInfo ? allUsers.find(u => u.uid === request.userId) : null;
        const userEmail = userInfo ? (userInfo.email || userInfo.displayName || 'Unknown User') : '';
        
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${request.serviceRequestNumber || 'N/A'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${request.companyName || 'N/A'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${request.contactPerson || 'N/A'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${request.phone || 'N/A'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${request.model || 'N/A'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                    ${statusText}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${createdDate}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                    <button onclick="viewServiceRequest('${request.id}')" class="text-indigo-600 hover:text-indigo-900" title="Xem">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="editServiceRequest('${request.id}')" class="text-blue-600 hover:text-blue-900" title="Sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteServiceRequest('${request.id}')" class="text-red-600 hover:text-red-900" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}


// Redirect to data management page for export functionality
function exportByDateRange() {
    window.location.href = 'quanludulieu.html';
}

// Import service requests function for data management page
async function importServiceRequests(data, options = {}) {
    const skipDuplicates = options.skipDuplicates || false;
    const validateData = options.validateData || true;
    
    let success = 0;
    let failed = 0;
    let duplicates = 0;
    const errors = [];
    
    for (let i = 0; i < data.length; i++) {
        try {
            const item = data[i];
            
            // Validate required fields
            if (validateData) {
                if (!item.serviceRequestNumber) {
                    errors.push(`Dòng ${i + 1}: Thiếu mã phiếu yêu cầu`);
                    failed++;
                    continue;
                }
                
                if (!item.companyName) {
                    errors.push(`Dòng ${i + 1}: Thiếu tên công ty`);
                    failed++;
                    continue;
                }
                
                if (!item.contactPerson) {
                    errors.push(`Dòng ${i + 1}: Thiếu người liên hệ`);
                    failed++;
                    continue;
                }
                
                if (!item.phone) {
                    errors.push(`Dòng ${i + 1}: Thiếu số điện thoại`);
                    failed++;
                    continue;
                }
            }
            
            // Check for duplicates
            if (skipDuplicates) {
                const existingRequest = serviceRequests.find(req => 
                    req.serviceRequestNumber === item.serviceRequestNumber
                );
                
                if (existingRequest) {
                    duplicates++;
                    continue;
                }
            }
            
            // Prepare data for Firestore
            const serviceRequestData = {
                serviceRequestNumber: item.serviceRequestNumber || '',
                companyName: item.companyName || '',
                address: item.address || '',
                productCode: item.productCode || '',
                machineNumber: item.machineNumber || '',
                orderNumber: item.orderNumber || '',
                productDescription: item.productDescription || '',
                model: item.model || '',
                serialNumber: item.serialNumber || '',
                manufacturer: item.manufacturer || '',
                problemDescription: item.problemDescription || '',
                problemDefinition: item.problemDefinition || '',
                serviceCompleted: item.serviceCompleted || '',
                notes: item.notes || '',
                contactPerson: item.contactPerson || '',
                phone: item.phone || '',
                startDate: item.startDate || '',
                startTime: item.startTime || '',
                endDate: item.endDate || '',
                endTime: item.endTime || '',
                totalDate: item.totalDate || '',
                totalTime: item.totalTime || '',
                travelInfo: item.travelInfo || '',
                serviceTypes: Array.isArray(item.serviceTypes) ? item.serviceTypes : 
                           (item.serviceTypes ? item.serviceTypes.split(';').map(s => s.trim()) : []),
                status: item.status || 'pending',
                userId: currentUser.uid,
                userEmail: currentUser.email,
                userDisplayName: currentUser.displayName,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Save to Firestore
            await db.collection('serviceRequests').add(serviceRequestData);
            success++;
            
        } catch (error) {
            console.error('Error importing service request:', error);
            errors.push(`Dòng ${i + 1}: ${error.message}`);
            failed++;
        }
    }
    
    return {
        success,
        failed,
        duplicates,
        errors
    };
}

// Process export by user function for data management page
function processExportByUser(userId, format) {
    // Filter data by user
    let filteredRequests = userId ?
        serviceRequests.filter(request => request.userId === userId) :
        serviceRequests;
    
    try {
        const data = exportServiceRequests(format, {
            includeMetadata: true,
            filteredData: filteredRequests
        });

        // Create download
        const blob = new Blob([data], {
            type: format === 'csv' ? 'text/csv' :
                  format === 'json' ? 'application/json' :
                  format === 'html' ? 'text/html' :
                  'text/markdown'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Create filename with user info
        let filename = 'service-requests';
        if (userId) {
            const user = allUsers.find(u => u.uid === userId);
            if (user) {
                filename += `-by-${user.displayName || user.email || 'unknown'}`;
            }
        } else {
            filename += '-all-users';
        }
        
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        filename += `-${timestamp}.${format === 'csv' ? 'csv' :
                                         format === 'json' ? 'json' :
                                         format === 'html' ? 'html' : 'md'}`;
        
        a.download = filename;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast(`Xuất dữ liệu theo người dùng ${format.toUpperCase()} thành công!`, 'success');
        return true;

    } catch (error) {
        console.error('Export error:', error);
        showToast('Lỗi xuất dữ liệu: ' + error.message, 'error');
        return false;
    }
}

// Process export by date range function for data management page
function processExportByDateRange(dateFrom, dateTo, format) {
    // Filter data by date range
    let filteredRequests = serviceRequests.filter(request => {
        const requestDate = new Date(request.createdAt.toDate());
        let matchesDate = true;
        
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            matchesDate = matchesDate && requestDate >= fromDate;
        }
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999); // End of day
            matchesDate = matchesDate && requestDate <= toDate;
        }
        
        return matchesDate;
    });
    
    try {
        const data = exportServiceRequests(format, {
            includeMetadata: true,
            filteredData: filteredRequests
        });

        // Create download
        const blob = new Blob([data], {
            type: format === 'csv' ? 'text/csv' :
                  format === 'json' ? 'application/json' :
                  format === 'html' ? 'text/html' :
                  'text/markdown'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Create filename with date range
        let filename = 'service-requests';
        if (dateFrom || dateTo) {
            if (dateFrom && dateTo) {
                filename += `-from-${dateFrom}-to-${dateTo}`;
            } else if (dateFrom) {
                filename += `-from-${dateFrom}`;
            } else if (dateTo) {
                filename += `-to-${dateTo}`;
            }
        }
        
        // Download file function
        function downloadFile(data, filename) {
            const blob = new Blob([data], {
                type: filename.endsWith('.csv') ? 'text/csv' :
                      filename.endsWith('.json') ? 'application/json' :
                      filename.endsWith('.html') ? 'text/html' :
                      'text/markdown'
            });
        
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        
        // Download template function
        function downloadTemplate() {
            const csvTemplate = `Company Name,Contact Person,Phone,Address,Service Request Number,Product Code,Machine Number,Order Number,Product Description,Model,Serial Number,Manufacturer,Problem Description,Problem Definition,Service Types,Service Completed,Start Date,Start Time,End Date,End Time,Total Date,Total Time,Travel Info,Notes,Status
        "Công ty ABC","Nguyễn Văn A","0123456789","Địa chỉ ABC","SR-001","P001","M001","ORD001","Mô tả sản phẩm","Model XYZ","SN12345","Hãng XYZ","Vấn đề mô tả","Problem definition","Lắp đặt,Sửa chữa","Dịch vụ đã hoàn thành","2023-01-01","08:00","2023-01-02","17:00","1","9","Thông tin di chuyển","Ghi chú here","pending"`;
        
            downloadFile(csvTemplate, 'service-request-template.csv');
            showToast('Tải file mẫu thành công!', 'success');
        }
        
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        filename += `-${timestamp}.${format === 'csv' ? 'csv' :
                                         format === 'json' ? 'json' :
                                         format === 'html' ? 'html' : 'md'}`;
        
        a.download = filename;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast(`Xuất dữ liệu theo khoảng ngày ${format.toUpperCase()} thành công!`, 'success');
        return true;

    } catch (error) {
        console.error('Export error:', error);
        showToast('Lỗi xuất dữ liệu: ' + error.message, 'error');
        return false;
    }
    
    // Export all data function
    async function exportAllData(format) {
        try {
            const data = exportServiceRequests(format, {
                includeMetadata: true
            });
            
            // Create filename with timestamp
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `service-requests-all-${timestamp}.${format}`;
            
            downloadFile(data, filename);
            showToast(`Xuất tất cả dữ liệu ${format.toUpperCase()} thành công!`, 'success');
            return true;
        } catch (error) {
            console.error('Export error:', error);
            showToast('Lỗi xuất dữ liệu: ' + error.message, 'error');
            return false;
        }
    }
}
