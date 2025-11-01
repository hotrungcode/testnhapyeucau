
// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCB9uARJMMaY-N6ikCRvOscgMNOCE5R0n4",
    authDomain: "luubbkythuatnhap.firebaseapp.com",
    projectId: "luubbkythuatnhap",
    storageBucket: "luubbkythuatnhap.firebasestorage.app",
    messagingSenderId: "914373130415",
    appId: "1:914373130415:web:f2aad04a7138d43c6afc5a"
};

// Performance optimization: Cache DOM elements
const DOM_CACHE = {};
const DATA_CACHE = {
    serviceRequests: null,
    users: null,
    userData: null,
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

// Optimized Firebase initialization
function initializeFirebase() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
    } catch (error) {
        if (!error.message.includes('already exists')) {
            console.error('Firebase initialization error:', error);
        }
    } catch (error) {
        console.error('Firebase initialization error:', error);
    }
}

// Initialize Firebase immediately
initializeFirebase();

const auth = firebase.auth();
const db = firebase.firestore();

// Global variables
let currentUser = null;
let serviceRequests = [];
let allUsers = [];

// Cache DOM elements for better performance
function cacheDOM() {
    const elements = [
        'loadingScreen', 'toastContainer', 'sidebar', 'sidebarToggle',
        'userMenuBtn', 'userDropdown', 'logoutBtn', 'serviceRequestSearch',
        'serviceRequestStatus', 'serviceRequestUser', 'serviceRequestDateFrom',
        'serviceRequestDateTo', 'serviceRequestsLoading', 'serviceRequestsEmpty',
        'serviceRequestsList', 'editServiceRequestModal', 'importModal',
        'exportMenu', 'dataServiceRequestSearch', 'dataServiceRequestStatus',
        'dataServiceRequestUser', 'dataServiceRequestDateFrom', 'dataServiceRequestDateTo',
        'dataServiceRequestsTableBody', 'dataLoadingRow'
    ];

    elements.forEach(id => {
        DOM_CACHE[id] = document.getElementById(id);
    });
}

// Optimized utility functions
function showLoading(show = true) {
    if (DOM_CACHE.loadingScreen) {
        DOM_CACHE.loadingScreen.classList.toggle('hidden', !show);
    }
}

function showToast(message, type = 'info') {
    const toastContainer = DOM_CACHE.toastContainer;
    if (!toastContainer) return;

    const bgColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };

    const toastId = 'toast-' + Date.now();
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

// Optimized section switching
function showSection(sectionName) {
    console.log('Showing section:', sectionName);
    
    // Close all popup windows when switching sections
    closeAllPopupWindows();
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });

    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Handle special case for new-request section
    let sectionId = sectionName + 'Section';
    if (sectionName === 'new-request') {
        sectionId = 'newRequestSection';
    }

    // Show selected section
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
        sectionElement.classList.remove('hidden');
        
        // Load section data
        loadSectionData(sectionName);
    } else {
        console.error('Section element not found:', sectionId);
        return;
    }

    // Add active class to corresponding nav item
    const navItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
}

function closeAllPopupWindows() {
    if (window.editServiceRequestWindow && !window.editServiceRequestWindow.closed) {
        window.editServiceRequestWindow.close();
    }
    if (window.viewServiceRequestWindow && !window.viewServiceRequestWindow.closed) {
        window.viewServiceRequestWindow.close();
    }
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Optimized data loading with caching
async function loadUserData() {
    // Check cache first
    if (DATA_CACHE.userData && Date.now() - DATA_CACHE.lastLoadTime < 30000) {
        return DATA_CACHE.userData;
    }

    try {
        if (!currentUser || !currentUser.uid) {
            console.error('No current user available');
            return null;
        }

        const userDoc = await db.collection('users').doc(currentUser.uid).get();

        if (userDoc.exists) {
            const userData = userDoc.data();

            // Update UI with user data
            const userNameEl = document.getElementById('userName');
        const userRoleEl = document.getElementById('userRole');

        if (userNameEl) {
            userNameEl.textContent = userData.displayName || 'Unknown User';
        }

        if (userRoleEl) {
            userRoleEl.textContent = userData.role || 'user';
        }

        // Show/hide admin features
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.display = userData.role === 'admin' ? 'flex' : 'none';
        });

        // Cache the data
        DATA_CACHE.userData = userData;
        DATA_CACHE.lastLoadTime = Date.now();

        return userData;
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        showToast('Lỗi tải dữ liệu người dùng: ' + error.message, 'error');
    }
    return null;
}

// Make loadUserData available globally for popup windows
window.loadUserData = loadUserData;

// Optimized section data loading
async function loadSectionData(sectionName) {
    console.log('Loading data for section:', sectionName);
    
    try {
        switch (sectionName) {
            case 'dashboard':
                await loadServiceRequests();
                updateServiceRequestStats();
        break;
    case 'links':
    case 'categories':
        await loadServiceRequests();
        renderServiceRequests();
        break;
    case 'new-request':
        // Use requestAnimationFrame for better performance
        requestAnimationFrame(() => {
            initializeNewServiceRequestForm();
        });
        break;
    case 'data-management':
        requestAnimationFrame(() => {
            initializeDataManagementSection();
        });
        break;
    default:
        console.warn('Unknown section:', sectionName);
        }
    } catch (error) {
        console.error('Error loading section data:', error);
        showToast('Lỗi tải dữ liệu: ' + error.message, 'error');
    }
}

// Optimized service request loading with caching
async function loadServiceRequests(forceRefresh = false) {
    // Check cache first
    if (!forceRefresh && DATA_CACHE.serviceRequests && Date.now() - DATA_CACHE.lastLoadTime < 60000) {
        serviceRequests = DATA_CACHE.serviceRequests;
        console.log('Using cached service requests:', serviceRequests.length);
        return;
    }

    try {
        if (!currentUser || !currentUser.uid) {
            console.error('No current user available for loading service requests');
        return;
    }

    const userData = await loadUserData();
    const isAdmin = userData && userData.role === 'admin';
    } else {
        console.error('No current user available for loading service requests');
        return;
    }

    let query;
    if (isAdmin) {
        query = db.collection('serviceRequests').orderBy('createdAt', 'desc');
    } else {
        query = db.collection('serviceRequests')
            .where('userId', '==', currentUser.uid)
            .orderBy('createdAt', 'desc');
    }

    const snapshot = await query.get();

    serviceRequests = [];
    snapshot.forEach(doc => {
        const requestData = { id: doc.id, ...doc.data() };
        serviceRequests.push(requestData);
    });

    // Cache the data
    DATA_CACHE.serviceRequests = serviceRequests;
    DATA_CACHE.lastLoadTime = Date.now();

    console.log('Total service requests loaded:', serviceRequests.length);
    } catch (error) {
        console.error('Error loading service requests:', error);
        showToast('Lỗi tải phiếu yêu cầu dịch vụ: ' + error.message, 'error');
    }
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        }, wait);
    };
}

// Optimized service request rendering
async function renderServiceRequests() {
    const loadingEl = DOM_CACHE.serviceRequestsLoading;
    const emptyEl = DOM_CACHE.serviceRequestsEmpty;
    const listEl = DOM_CACHE.serviceRequestsList;
    
    if (!listEl) return;

    const searchTerm = DOM_CACHE.serviceRequestSearch?.value.toLowerCase() || '';
    const statusFilter = DOM_CACHE.serviceRequestStatus?.value || '';
    const userFilter = DOM_CACHE.serviceRequestUser?.value || '';
    const dateFrom = DOM_CACHE.serviceRequestDateFrom?.value || '';
    const dateTo = DOM_CACHE.serviceRequestDateTo?.value || '';

    let filteredRequests = serviceRequests.filter(request => {
        const matchesSearch = !searchTerm ||
            (request.contactPerson && request.contactPerson.toLowerCase().includes(searchTerm)) ||
            (request.phone && request.phone.toLowerCase().includes(searchTerm)) ||
            (request.companyName && request.companyName.toLowerCase().includes(searchTerm)) ||
            (request.address && request.address.toLowerCase().includes(searchTerm));

        const matchesStatus = !statusFilter || request.status === statusFilter;
        const matchesUser = !userFilter || request.userId === userFilter;

        let matchesDate = true;
        if ((dateFrom || dateTo) && request.createdAt) {
            const requestDate = new Date(request.createdAt.toDate()));
            if (dateFrom) {
                const fromDate = new Date(dateFrom);
                matchesDate = matchesDate && requestDate >= fromDate;
        }
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
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
        listEl.innerHTML = '';
        return;
    }

    // Get user data for attribution
    const userData = await loadUserData();
    const isAdmin = userData && userData.role === 'admin';

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    
    filteredRequests.forEach(request => {
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

        const requestElement = document.createElement('div');
        requestElement.className = 'service-request-panel';
        requestElement.innerHTML = `
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
        `;
        
        fragment.appendChild(requestElement);
    });

    listEl.innerHTML = '';
    listEl.appendChild(fragment);
}

// Optimized event listeners setup
function setupEventListeners() {
    // Sidebar toggle
    if (DOM_CACHE.sidebarToggle) {
        DOM_CACHE.sidebarToggle.addEventListener('click', function() {
            DOM_CACHE.sidebar.classList.toggle('open');
        });
    }

    // User menu
    if (DOM_CACHE.userMenuBtn) {
        DOM_CACHE.userMenuBtn.addEventListener('click', function() {
            DOM_CACHE.userDropdown.classList.toggle('hidden');
        });
    }

    // Logout
    if (DOM_CACHE.logoutBtn) {
        DOM_CACHE.logoutBtn.addEventListener('click', async function() {
        try {
            await auth.signOut();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
            showToast('Lỗi đăng xuất', 'error');
        });
    }

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const section = this.dataset.section;
            console.log('Nav item clicked, section:', section);
            if (section) {
                showSection(section);
                // Close sidebar on mobile after navigation
        if (window.innerWidth <= 1023) {
            DOM_CACHE.sidebar.classList.remove('open');
            }
        });
    });

    // Service request actions with debouncing
    const
