import { renderUserStore } from './js/userInterface.js';
import { renderSellerDashboard } from './js/sellerDashboard.js';
import { renderAdminDashboard } from './js/adminDashboard.js';
import { db } from './js/db.js';

const mainContent = document.getElementById('main-content');
const navLinksContainer = document.getElementById('nav-links');
const navLinks = document.querySelectorAll('.nav-links a');
const burgerMenu = document.getElementById('burger-menu');
const cartCount = document.querySelector('.cart-count');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');

// Basic Routing Logic with Guards
function navigate(view) {
    const user = db.getCurrentUser();
    
    // Guard Clauses
    if (view === 'seller') {
        if (!user || user.role !== 'seller') {
            alert("Accès réservé aux vendeurs. Veuillez vous connecter.");
            showAuthModal('login');
            return;
        }
        if (!user.matriculeUnlocked) {
            showAuthModal('unlock');
            return;
        }
    }

    if (view === 'admin') {
        if (!user || user.role !== 'admin') {
            alert("Accès réservé aux administrateurs. Veuillez vous connecter.");
            showAuthModal('login');
            return;
        }
        if (!user.adminUnlocked) {
            showAuthModal('admin_unlock');
            return;
        }
    }

    // Clear content
    mainContent.innerHTML = '<div class="loader">Chargement...</div>';
    
    // Smooth transition effect
    setTimeout(() => {
        switch(view) {
            case 'user':
                renderUserStore(mainContent);
                break;
            case 'seller':
                renderSellerDashboard(mainContent);
                break;
            case 'admin':
                renderAdminDashboard(mainContent);
                break;
            default:
                renderUserStore(mainContent);
        }
        
        updateAuthUI();
        
        // Update active link
        navLinks.forEach(link => {
            if (link.dataset.view === view) {
                link.style.color = 'var(--gabon-blue)';
                link.style.borderBottom = '2px solid var(--gabon-yellow)';
            } else {
                link.style.color = '';
                link.style.borderBottom = '';
            }
        });
    }, 300);
}

// Global Nav Listeners
burgerMenu.addEventListener('click', () => {
    burgerMenu.classList.toggle('open');
    navLinksContainer.classList.toggle('open');
});

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(e.target.dataset.view);
        burgerMenu.classList.remove('open');
        navLinksContainer.classList.remove('open');
    });
});

// Update Cart UI
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cartCount.innerText = cart.length;
    
    // Scale effect
    cartCount.style.transform = 'scale(1.5)';
    setTimeout(() => {
        cartCount.style.transform = 'scale(1)';
    }, 300);
}

window.addEventListener('cartUpdated', updateCartCount);

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await db.init();
    updateAuthUI();
    navigate('user');
    updateCartCount();

    // Splash screen timeout
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        const app = document.getElementById('app');
        
        if (splash) {
            splash.classList.add('hidden');
            // Remove from DOM after transition
            setTimeout(() => {
                splash.remove();
            }, 800);
        }
        
        if (app) {
            app.classList.add('visible');
        }
    }, 2500);
});

// Auth Modal Logic
const authModal = document.getElementById('auth-modal');
const closeModalBtn = document.querySelector('.close-modal');

function updateAuthUI() {
    const user = db.getCurrentUser();
    if (user) {
        document.body.classList.add('logged-in');
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
    } else {
        document.body.classList.remove('logged-in');
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
    }
}

function showAuthModal(view = 'login') {
    authModal.classList.add('active');
    switchView(view);
}

function switchView(view) {
    // Hide all views
    document.querySelectorAll('.auth-view').forEach(v => v.classList.remove('active'));
    document.getElementById('auth-tabs').style.display = 'flex';

    if (view === 'login') {
        document.getElementById('login-form').classList.add('active');
        updateTabs('login');
    } else if (view === 'register') {
        document.getElementById('register-form').classList.add('active');
        updateTabs('register');
    } else if (view === 'success') {
        document.getElementById('register-success').classList.add('active');
        document.getElementById('auth-tabs').style.display = 'none';
    } else if (view === 'unlock') {
        document.getElementById('unlock-form').classList.add('active');
        document.getElementById('auth-tabs').style.display = 'none';
    } else if (view === 'admin_unlock') {
        document.getElementById('admin-unlock-view').classList.add('active');
        document.getElementById('auth-tabs').style.display = 'none';
    }
}

function updateTabs(active) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === active);
    });
}

loginBtn.addEventListener('click', () => showAuthModal('login'));
logoutBtn.addEventListener('click', () => {
    db.logout();
    alert("Déconnexion réussie.");
    navigate('user');
});
closeModalBtn.addEventListener('click', () => authModal.classList.remove('active'));

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.tab));
});

// Role-based field toggling
const loginRole = document.getElementById('login-role');
const registerRole = document.getElementById('register-role');
const adminLoginIdentity = document.getElementById('admin-login-identity');
const adminRegisterIdentity = document.getElementById('admin-register-identity');

loginRole.addEventListener('change', (e) => {
    adminLoginIdentity.style.display = e.target.value === 'admin' ? 'block' : 'none';
});

registerRole.addEventListener('change', (e) => {
    adminRegisterIdentity.style.display = e.target.value === 'admin' ? 'block' : 'none';
});

// Forms Handling
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const role = document.getElementById('register-role').value;
    const userData = {
        name: document.getElementById('register-name').value,
        role: role,
        password: document.getElementById('register-password').value
    };

    // Extract extra fields for admins
    if (role === 'admin') {
        userData.firstname = document.getElementById('register-firstname').value;
        userData.birthdate = document.getElementById('register-birthdate').value;
        userData.phone = document.getElementById('register-phone').value;
        userData.email = document.getElementById('register-email').value;
        userData.secretPhrase = document.getElementById('register-secret-phrase').value;
    }

    const user = await db.registerUser(userData);
    
    if (!user || user.isError) {
        alert("Erreur Supabase : " + (user?.details || "Le serveur a refusé l'accès. Vérifiez avoir lancé la requête SQL sur le site Supabase pour créer la base."));
        return;
    }
    
    // Show success screen
    switchView('success');
    document.getElementById('admin-success-note').style.display = user.role === 'admin' ? 'block' : 'none';
    
    if (user.role === 'seller') {
        document.getElementById('matricule-reveal').style.display = 'block';
        document.getElementById('generated-matricule').innerText = user.matricule;
    } else {
        document.getElementById('matricule-reveal').style.display = 'none';
    }
    
    if (user.role !== 'admin' && user.role !== 'seller') {
        document.getElementById('success-message').innerText = "Inscription réussie !";
    }
});

document.getElementById('btn-to-login').addEventListener('click', () => switchView('login'));

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const role = document.getElementById('login-role').value;
    const credentials = {
        name: document.getElementById('login-name').value,
        password: document.getElementById('login-password').value,
        role: role
    };

    if (role === 'admin') {
        credentials.firstname = document.getElementById('login-firstname').value;
        credentials.birthdate = document.getElementById('login-birthdate').value;
        credentials.phone = document.getElementById('login-phone').value;
        credentials.email = document.getElementById('login-email').value;
    }

    const result = await db.login(credentials);
    
    if (result && !result.error) {
        alert(`Authentification réussie. Bienvenue, ${result.firstname || result.name} !`);
        authModal.classList.remove('active');
        loginBtn.innerText = "Mon Compte";
        
        // Auto-redirect based on role
        if (result.role === 'seller') navigate('seller');
        else if (result.role === 'admin') navigate('admin');
        else navigate('user');
    } else {
        alert(result?.error || "Erreur d'authentification. Vérifiez vos informations.");
    }
});

document.getElementById('unlock-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const matricule = document.getElementById('unlock-matricule').value;
    
    if (db.unlockMatricule(matricule)) {
        authModal.classList.remove('active');
        navigate('seller');
    } else {
        alert("Matricule professionnel invalide. Accès refusé.");
    }
});

document.getElementById('admin-master-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const phrase = document.getElementById('admin-secret-phrase').value;
    
    if (db.unlockAdmin(phrase)) {
        alert("ACCRÉDITATION CONFIRMÉE. Accès au centre de gouvernance autorisé.");
        authModal.classList.remove('active');
        navigate('admin');
    } else {
        alert("PHRASE SECRÈTE INCORRECTE. Tentative d'accès non autorisée signalée.");
    }
});
