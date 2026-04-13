import { db } from './db.js';

export async function renderSellerDashboard(container) {
    const products = await db.getProducts();
    const financialData = await db.getSellerFinancials();
    
    container.innerHTML = `
        <div class="dashboard-container animate-fade-up">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;">
                <h1>Bilan Commercial & Gestion</h1>
                <p style="font-weight: 700; color: var(--text-muted);">Matricule : <span style="color: var(--gabon-blue);">GAB-2026-ACTIVE</span></p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <p style="color: #666; font-size: 0.9rem;">Chiffre d'Affaires (CA)</p>
                    <h2 style="font-size: 2.2rem;">${financialData.totalRevenue.toLocaleString()} FCFA</h2>
                    <p style="color: var(--gabon-green); font-size: 0.8rem; font-weight: 700;">Contribution directe</p>
                </div>
                <div class="stat-card yellow">
                    <p style="color: #666; font-size: 0.9rem;">Ventes Réalisées</p>
                    <h2 style="font-size: 2.2rem;">${financialData.salesCount}</h2>
                    <p style="color: var(--text-dark); font-size: 0.8rem; font-weight: 700;">Flux budgétaire actif</p>
                </div>
                <div class="stat-card blue">
                    <p style="color: #666; font-size: 0.9rem;">Valeur du Stock</p>
                    <h2 style="font-size: 2.2rem;">${products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString()} FCFA</h2>
                    <p style="color: var(--gabon-blue); font-size: 0.8rem; font-weight: 700;">Actifs en inventaire</p>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 3rem;">
                <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: var(--shadow-soft);">
                    <h2>Dernières Transactions</h2>
                    <div style="margin-top: 1.5rem;">
                        ${financialData.recentTransactions.length > 0 ? financialData.recentTransactions.map(t => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid #eee;">
                                <div>
                                    <strong>Vente #${t.id.toString().slice(-4)}</strong>
                                    <p style="font-size: 0.8rem; color: #666;">${new Date(t.timestamp).toLocaleString()}</p>
                                </div>
                                <span style="font-weight: 700; color: var(--gabon-green);">+${t.price.toLocaleString()} FCFA</span>
                            </div>
                        `).join('') : '<p style="color: #999;">Aucune transaction récente.</p>'}
                    </div>
                </div>

                <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: var(--shadow-soft);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <h2>Gestion des Stocks</h2>
                    </div>
                    <div style="max-height: 400px; overflow-y: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="text-align: left; border-bottom: 2px solid #eee;">
                                    <th style="padding: 1rem 0;">Produit</th>
                                    <th>Stock</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${products.map(p => `
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 1rem 0; font-size: 0.9rem;">${p.name}</td>
                                        <td id="stock-${p.id}" style="font-weight: 700;">${p.stock}</td>
                                        <td>
                                            <button class="restock-btn btn-primary" data-id="${p.id}" style="padding: 0.3rem 0.6rem; font-size: 0.7rem;">+ Ravitailler</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div style="background: white; padding: 3rem; border-radius: 16px; box-shadow: var(--shadow-soft);">
                <h2 style="margin-bottom: 2rem;">Ajouter un Nouveau Produit au Catalogue</h2>
                <form id="add-product-form" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                    <div class="form-group">
                        <label>Nom du produit</label>
                        <input type="text" id="prod-name" required placeholder="Ex: Manteau en raphia">
                    </div>
                    <div class="form-group">
                        <label>Prix (FCFA)</label>
                        <input type="number" id="prod-price" required placeholder="5000">
                    </div>
                    <div class="form-group">
                        <label>Catégorie</label>
                        <select id="prod-category">
                            <option value="Alimentation">Alimentation</option>
                            <option value="Artisanat">Artisanat</option>
                            <option value="Beauté">Beauté</option>
                            <option value="Confiserie">Confiserie</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Province d'origine</label>
                        <input type="text" id="prod-origin" required placeholder="Ex: Ngounié">
                    </div>
                    <div class="form-group" style="grid-column: span 2;">
                        <label>Photo du produit</label>
                        <div id="image-upload-zone" style="border: 2px dashed #ccc; border-radius: 12px; padding: 2rem; text-align: center; cursor: pointer; transition: all 0.3s;">
                            <input type="file" id="prod-image-file" accept="image/*" style="display: none;">
                            <div id="upload-placeholder">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                <p style="color: #999; margin-top: 0.5rem;">Cliquez ici ou glissez une photo</p>
                            </div>
                            <img id="image-preview" src="" alt="" style="display: none; max-height: 200px; border-radius: 8px; margin-top: 1rem;">
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary" id="submit-product-btn" style="grid-column: span 2; padding: 1rem;">Mettre en vente sur Agri Connect</button>
                </form>
            </div>
        </div>
    `;

    // Restock listeners
    container.querySelectorAll('.restock-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.dataset.id;
            const newStock = await db.updateStock(id, 10);
            if (newStock !== null) {
                document.getElementById(`stock-${id}`).innerText = newStock;
                // Instant refresh of financial stats too
                renderSellerDashboard(container);
            }
        });
    });

    // Image upload zone interactions
    const uploadZone = container.querySelector('#image-upload-zone');
    const fileInput = container.querySelector('#prod-image-file');
    const imagePreview = container.querySelector('#image-preview');
    const uploadPlaceholder = container.querySelector('#upload-placeholder');

    if (uploadZone) {
        uploadZone.addEventListener('click', () => fileInput.click());
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = 'var(--gabon-green)';
            uploadZone.style.background = 'rgba(0,104,55,0.05)';
        });
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.style.borderColor = '#ccc';
            uploadZone.style.background = '';
        });
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = '#ccc';
            uploadZone.style.background = '';
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                previewImage(e.dataTransfer.files[0]);
            }
        });
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                previewImage(fileInput.files[0]);
            }
        });
    }

    function previewImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            uploadPlaceholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    // Add product listener
    const addProductForm = document.getElementById('add-product-form');
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submit-product-btn');
        submitBtn.disabled = true;
        submitBtn.innerText = 'Envoi en cours...';

        let imageUrl = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400';

        // Upload real image if selected
        const imageFile = fileInput.files[0];
        if (imageFile) {
            const uploadedUrl = await db.uploadProductImage(imageFile);
            if (uploadedUrl) {
                imageUrl = uploadedUrl;
            } else {
                alert('Erreur lors de l\'envoi de l\'image. Le produit sera ajouté avec une image par défaut.');
            }
        }

        const newProd = {
            name: document.getElementById('prod-name').value,
            price: parseInt(document.getElementById('prod-price').value),
            category: document.getElementById('prod-category').value,
            origin: document.getElementById('prod-origin').value,
            image: imageUrl,
            stock: 10
        };

        await db.addProduct(newProd);
        alert('Produit ajouté avec succès au catalogue !');
        renderSellerDashboard(container);
    });
}
