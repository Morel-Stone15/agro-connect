import { db } from './db.js';

export function renderAdminDashboard(container) {
    let activeTab = 'overview';

    async function render() {
        const users = await db.getUsers();
        const products = await db.getProducts();
        const orders = await db.getTransactions();

        container.innerHTML = `
            <div class="dashboard-container animate-fade-up">
                <h1 style="margin-bottom: 2rem;">Administration Globale</h1>
                
                <div class="admin-tabs">
                    <div class="admin-tab ${activeTab === 'overview' ? 'active' : ''}" data-tab="overview">Aperçu</div>
                    <div class="admin-tab ${activeTab === 'users' ? 'active' : ''}" data-tab="users">Utilisateurs</div>
                    <div class="admin-tab ${activeTab === 'catalog' ? 'active' : ''}" data-tab="catalog">Catalogue</div>
                    <div class="admin-tab ${activeTab === 'delivery' ? 'active' : ''}" data-tab="delivery">Service Livraison</div>
                </div>

                <div id="admin-tab-content">
                    ${renderTabContent(activeTab, { users, products, orders })}
                </div>
            </div>
        `;

        attachAdminListeners();
    }

    function renderTabContent(tab, data) {
        switch (tab) {
            case 'overview':
                return renderOverview(data);
            case 'users':
                return renderUsers(data.users);
            case 'catalog':
                return renderCatalog(data.products);
            case 'delivery':
                return renderDelivery(data.orders);
            default:
                return '';
        }
    }

    function renderOverview(data) {
        const totalRev = data.orders.reduce((acc, o) => acc + (o.price || 0), 0);
        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <p>Utilisateurs</p>
                    <h2>${data.users.length}</h2>
                </div>
                <div class="stat-card yellow">
                    <p>Produits en Vente</p>
                    <h2>${data.products.length}</h2>
                </div>
                <div class="stat-card blue">
                    <p>Volume Final (FCFA)</p>
                    <h2>${totalRev.toLocaleString()}</h2>
                </div>
            </div>
            <div class="modal-section" style="margin-top: 2rem;">
                <h3>Alertes de Sécurité</h3>
                <p style="color: grey; margin-top: 1rem;">Aucune intrusion détectée au cours des dernières 24h.</p>
            </div>
        `;
    }

    function renderUsers(users) {
        return `
            <div class="modal-section">
                <h2>Registre des Comptes</h2>
                <table class="mgmt-table">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Rôle</th>
                            <th>Matricule</th>
                            <th>Inscription</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(u => `
                            <tr>
                                <td><strong>${u.name}</strong></td>
                                <td><span class="product-tag">${u.role}</span></td>
                                <td>${u.matricule || '-'}</td>
                                <td>${u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    function renderCatalog(products) {
        return `
            <div class="modal-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2>Gestion du Catalogue</h2>
                    <button class="btn btn-primary" id="admin-add-product">Nouveau Produit</button>
                </div>
                <table class="mgmt-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Produit</th>
                            <th>Prix</th>
                            <th>Origine</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(p => `
                            <tr>
                                <td><img src="${p.image}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;"></td>
                                <td><strong>${p.name}</strong></td>
                                <td>${p.price} FCFA</td>
                                <td>${p.origin}</td>
                                <td>${p.stock}</td>
                                <td>
                                    <button class="btn-danger delete-product" data-id="${p.id}">Supprimer</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Add Product Form (Hidden by default) -->
            <div id="admin-add-form-container" style="display: none;" class="modal-section">
                <h3>Enregistrer un Nouveau Produit</h3>
                <form id="admin-product-form" style="margin-top: 1rem;">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Nom du produit</label>
                            <input type="text" id="p-name" required>
                        </div>
                        <div class="form-group">
                            <label>Prix (FCFA)</label>
                            <input type="number" id="p-price" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Province</label>
                            <input type="text" id="p-origin" required>
                        </div>
                        <div class="form-group">
                            <label>Image (URL)</label>
                            <input type="text" id="p-image" required value="image/logo.jpg">
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary">Valider la mise en ligne</button>
                    <button type="button" class="btn btn-secondary" id="cancel-add">Annuler</button>
                </form>
            </div>
        `;
    }

    function renderDelivery(orders) {
        return `
            <div class="modal-section">
                <h2>Suivi des Livraisons Globales</h2>
                <table class="mgmt-table">
                    <thead>
                        <tr>
                            <th>ID Commande</th>
                            <th>Client</th>
                            <th>Produit</th>
                            <th>Statut</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.length === 0 ? '<tr><td colspan="5" style="text-align:center;">Aucune commande en cours.</td></tr>' : orders.map(o => `
                            <tr>
                                <td><small>${o.id}</small></td>
                                <td><strong>${o.customerName || 'Client'}</strong></td>
                                <td>${o.productName}</td>
                                <td>
                                    <span class="status-badge ${getStatusClass(o.status)}">
                                        ${o.status || 'En attente'}
                                    </span>
                                </td>
                                <td>
                                    <select class="status-select" data-id="${o.id}">
                                        <option value="En attente" ${o.status === 'En attente' ? 'selected' : ''}>En attente</option>
                                        <option value="En livraison" ${o.status === 'En livraison' ? 'selected' : ''}>En livraison</option>
                                        <option value="Livré" ${o.status === 'Livré' ? 'selected' : ''}>Livré</option>
                                    </select>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    function getStatusClass(status) {
        if (status === 'En attente') return 'status-pending';
        if (status === 'En livraison') return 'status-shipping';
        if (status === 'Livré') return 'status-delivered';
        return 'status-pending';
    }

    function attachAdminListeners() {
        // Tab switching
        container.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                activeTab = e.target.dataset.tab;
                render();
            });
        });

        // Delete product
        container.querySelectorAll('.delete-product').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('Supprimer définitivement ce produit du catalogue ?')) {
                    await db.deleteProduct(e.target.dataset.id);
                    render();
                }
            });
        });

        // Show add form
        const addBtn = container.querySelector('#admin-add-product');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                container.querySelector('#admin-add-form-container').style.display = 'block';
            });
        }

        // Cancel add
        const cancelBtn = container.querySelector('#cancel-add');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                container.querySelector('#admin-add-form-container').style.display = 'none';
            });
        }

        // Handle Add product
        const productForm = container.querySelector('#admin-product-form');
        if (productForm) {
            productForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await db.addProduct({
                    name: document.getElementById('p-name').value,
                    price: parseInt(document.getElementById('p-price').value),
                    origin: document.getElementById('p-origin').value,
                    image: document.getElementById('p-image').value,
                    category: 'Nouveau'
                });
                alert('Produit ajouté avec succès au catalogue général.');
                render();
            });
        }

        // Status update
        container.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                await db.updateTransactionStatus(e.target.dataset.id, e.target.value);
                alert('Statut de livraison mis à jour.');
                render();
            });
        });
    }

    render();
}
