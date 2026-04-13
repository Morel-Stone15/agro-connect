import { provinces, reviews } from './data.js';
import { db } from './db.js';

export function renderUserStore(container) {
    renderHubView(container);
}

function renderHubView(container) {
    container.innerHTML = `
        <section class="hero animate-fade-up">
            <h1>L'Essence du Gabon</h1>
            <p>Découvrez le meilleur du terroir gabonais à travers nos provinces.</p>
        </section>

        <section class="discovery-hub animate-fade-up">
            <div class="hub-card" id="btn-show-products">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22.5V12"/></svg>
                <h3>Produits</h3>
                <p>Explorez notre catalogue complet de produits artisanaux et alimentaires.</p>
            </div>
            
            <div class="hub-card" id="btn-show-provinces">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <h3>Provinces</h3>
                <p>Découvrez les spécialités locales province par province.</p>
            </div>
            
            <div class="hub-card" id="btn-show-reviews">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M13 8H7"/><path d="M13 12H7"/></svg>
                <h3>Avis</h3>
                <p>Ce que nos clients disent de nos produits du terroir.</p>
            </div>
        </section>
    `;

    // Hub Event Listeners
    document.getElementById('btn-show-products').addEventListener('click', () => renderProducts(container));
    document.getElementById('btn-show-provinces').addEventListener('click', () => renderProvinces(container));
    document.getElementById('btn-show-reviews').addEventListener('click', () => renderReviews(container));
}

async function renderProducts(container, provinceFilter = null) {
    const allProducts = await db.getProducts();
    const filteredProducts = provinceFilter 
        ? allProducts.filter(p => p.origin.toLowerCase().includes(provinceFilter.toLowerCase()))
        : allProducts;

    container.innerHTML = `
        <div class="dashboard-container animate-fade-up">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h1>${provinceFilter ? `Produits de la province : ${provinceFilter}` : 'Tous les Produits'}</h1>
                <button class="btn btn-primary" id="back-to-hub">← Retour Hub</button>
            </div>
            
            <div class="product-grid" style="padding: 0;">
                ${filteredProducts.length > 0 ? filteredProducts.map(product => `
                    <div class="product-card">
                        <div class="product-image">
                            <img src="${product.image}" alt="${product.name}">
                        </div>
                        <div class="product-info">
                            <span class="product-tag">${product.category}</span>
                            <h3 class="product-title">${product.name}</h3>
                            <p style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">Provenance: ${product.origin}</p>
                            <p style="font-size: 0.8rem; color: ${product.stock > 10 ? 'var(--gabon-green)' : '#d9534f'}; font-weight: 700; margin-bottom: 1rem;">
                                ${product.stock > 0 ? `En stock : ${product.stock}` : 'Rupture de stock'}
                            </p>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span class="product-price">${product.price.toLocaleString()} FCFA</span>
                                <button class="btn btn-primary add-to-cart" data-id="${product.id}" ${product.stock <= 0 ? 'disabled style="background: #ccc; cursor: not-allowed;"' : ''}>
                                    ${product.stock > 0 ? 'Ajouter' : 'Epuisé'}
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('') : '<p style="text-align: center; grid-column: 1/-1; padding: 4rem;">Aucun produit trouvé pour cette province.</p>'}
            </div>
        </div>
    `;

    attachProductListeners(container, provinceFilter);
    document.getElementById('back-to-hub').addEventListener('click', () => renderHubView(container));
}

function renderProvinces(container) {
    container.innerHTML = `
        <div class="dashboard-container animate-fade-up">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h1>Explorer par Province</h1>
                <button class="btn btn-primary" id="back-to-hub-2">← Retour Hub</button>
            </div>
            
            <div class="province-grid">
                ${provinces.map(prov => `
                    <div class="province-card" data-province="${prov.name}">
                        <img src="${prov.image}" alt="${prov.name}">
                        <div class="province-overlay">
                            <h3>${prov.name}</h3>
                            <p style="font-size: 0.8rem; opacity: 0.8;">Chef-lieu : ${prov.capital}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    container.querySelectorAll('.province-card').forEach(card => {
        card.addEventListener('click', () => {
            const provName = card.dataset.province;
            renderProducts(container, provName);
        });
    });

    document.getElementById('back-to-hub-2').addEventListener('click', () => renderHubView(container));
}

function renderReviews(container) {
    container.innerHTML = `
        <div class="dashboard-container animate-fade-up">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h1>Avis de nos Clients</h1>
                <button class="btn btn-primary" id="back-to-hub-3">← Retour Hub</button>
            </div>
            
            <div class="reviews-grid">
                ${reviews.map(review => `
                    <div class="review-card">
                        <div style="color: var(--gabon-yellow); margin-bottom: 0.5rem;">
                            ${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}
                        </div>
                        <p>"${review.text}"</p>
                        <div class="review-author">${review.user}</div>
                        <div style="font-size: 0.8rem; color: #999;">${review.date}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.getElementById('back-to-hub-3').addEventListener('click', () => renderHubView(container));
}

function attachProductListeners(container, provinceFilter = null) {
    container.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', async (e) => {
            const id = e.target.dataset.id;
            const product = await db.getProductById(id);
            if (product && product.stock > 0) {
                addToCart(product);
                // Update stock in DB
                await db.updateStock(id, -1);
                // Log financial transaction for the seller
                const user = db.getCurrentUser();
                await db.addTransaction({
                    productId: id,
                    productName: product.name,
                    price: product.price,
                    customerName: user ? user.name : 'Client Anonyme'
                });
                // Refresh view to show new stock
                setTimeout(() => renderProducts(container, provinceFilter), 1500);
            } else {
                alert('Désolé, ce produit est en rupture de stock.');
            }
        });
    });
}

function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    
    const btn = document.querySelector(`[data-id="${product.id}"]`);
    if (btn) {
        const originalText = btn.innerText;
        btn.innerText = 'Ajouté !';
        btn.style.background = '#FCD116';
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = '';
        }, 2000);
    }
}
