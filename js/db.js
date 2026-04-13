import { supabase } from './supabaseClient.js';
// Fallback for local storage if Supabase is not configured yet
import { products as initialProducts, users as initialUsers } from './data.js';

class DatabaseService {
    constructor() {
        this.STORAGE_KEYS = {
            PRODUCTS: 'agri_connect_products',
            USERS: 'agri_connect_users',
            ORDERS: 'agri_connect_orders'
        };
        this.useSupabase = supabase !== null;
    }

    // Initialize the "database"
    async init() {
        if (this.useSupabase) {
            console.log('Database Service Initialized via Supabase Cloud');
            return true;
        }

        // Fallback Local Storage initialization
        if (!localStorage.getItem(this.STORAGE_KEYS.PRODUCTS)) {
            const productsWithStock = initialProducts.map(p => ({ ...p, stock: 50 }));
            localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(productsWithStock));
        }

        const existingUsers = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS) || '[]');
        if (existingUsers.length === 0 || !existingUsers.some(u => u.password)) {
            localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
        }
        console.warn('Supabase not configured. Using Local Storage Fallback.');
        return true;
    }

    // Upload image to Supabase Storage
    async uploadProductImage(file) {
        if (!this.useSupabase) {
            console.warn("Supabase non configuré. Upload impossible.");
            return null;
        }
        const fileExt = file.name.split('.').pop();
        const fileName = `product_${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage
            .from('product-images')
            .upload(fileName, file, { cacheControl: '3600', upsert: false });

        if (error) {
            console.error("Erreur upload image:", error);
            return null;
        }
        // Get the public URL of the uploaded image
        const { data: urlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);
        return urlData.publicUrl;
    }

    // Product Methods
    async getProducts() {
        if (this.useSupabase) {
            const { data, error } = await supabase.from('products').select('*');
            if (error) { console.error("Error fetching products:", error); return []; }
            return data;
        }
        return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PRODUCTS)) || [];
    }

    async getProductById(id) {
        if (this.useSupabase) {
            const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
            if (error) { console.error("Error fetching product:", error); return null; }
            return data;
        }
        const products = await this.getProducts();
        return products.find(p => p.id == id);
    }

    async updateProduct(updatedProduct) {
        if (this.useSupabase) {
            const { error } = await supabase.from('products').update(updatedProduct).eq('id', updatedProduct.id);
            return !error;
        }
        const products = await this.getProducts();
        const index = products.findIndex(p => p.id == updatedProduct.id);
        if (index !== -1) {
            products[index] = updatedProduct;
            localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
            return true;
        }
        return false;
    }

    async updateStock(productId, quantityChange) {
        const product = await this.getProductById(productId);
        if (product) {
            const newStock = Math.max(0, (product.stock || 0) + quantityChange);
            if (this.useSupabase) {
                const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', productId);
                if (!error) return newStock;
            } else {
                const products = await this.getProducts();
                const idx = products.findIndex(p => p.id == productId);
                products[idx].stock = newStock;
                localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
                return newStock;
            }
        }
        return null;
    }

    // User Methods
    async getUsers() {
        if (this.useSupabase) {
            const { data, error } = await supabase.from('users').select('*');
            if (error) { console.error("Error fetching users:", error); return []; }
            return data;
        }
        return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS)) || [];
    }

    async registerUser(userData) {
        let newUser = {
            role: userData.role || 'user',
            ...userData,
        };

        if (newUser.role === 'seller') {
            newUser.matricule = `GAB-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(Math.random() * 8999 + 1000)}`;
            newUser.matriculeUnlocked = false; 
        }

        if (this.useSupabase) {
            const { data, error } = await supabase.from('users').insert([newUser]).select();
            if (error) { 
                console.error("Error saving user:", error); 
                return { isError: true, details: error.message || error.details || "Erreur inconnue" }; 
            }
            return data[0];
        }

        const allUsers = await this.getUsers();
        newUser.id = Date.now();
        newUser.joinedAt = new Date().toISOString();
        allUsers.push(newUser);
        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(allUsers));
        return newUser;
    }

    async login(credentials) {
        const users = await this.getUsers();
        const { name, password, role } = credentials;

        const user = users.find(u => u.name === name && u.password === password);
        if (user) {
            if (user.role === 'admin') {
                const { firstname, birthdate, phone, email } = credentials;
                if (
                    user.firstname !== firstname ||
                    user.birthdate !== birthdate ||
                    user.phone !== phone ||
                    user.email !== email
                ) {
                    return { error: "Identité non confirmée. Vérifiez vos informations administratives." };
                }
            }
            this.setCurrentUser(user);
            return user;
        }
        return null;
    }

    // Session Management
    setCurrentUser(user) {
        sessionStorage.setItem('agri_connect_session', JSON.stringify(user));
    }

    getCurrentUser() {
        return JSON.parse(sessionStorage.getItem('agri_connect_session'));
    }

    logout() {
        sessionStorage.removeItem('agri_connect_session');
    }

    unlockMatricule(matricule) {
        const user = this.getCurrentUser();
        if (user && user.matricule === matricule) {
            user.matriculeUnlocked = true;
            this.setCurrentUser(user);
            return true;
        }
        return false;
    }

    unlockAdmin(phrase) {
        const user = this.getCurrentUser();
        if (user && user.role === 'admin' && user.secretPhrase === phrase) {
            user.adminUnlocked = true;
            this.setCurrentUser(user);
            return true;
        }
        return false;
    }

    // Orders Management
    async getTransactions() {
        if (this.useSupabase) {
            const { data, error } = await supabase.from('orders').select('*');
            if (error) { console.error("Error fetching orders:", error); return []; }
            return data;
        }
        return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ORDERS)) || [];
    }

    async addTransaction(transactionData) {
        let newTransaction = {
            status: 'En attente',
            ...transactionData
        };

        if (this.useSupabase) {
            const { data, error } = await supabase.from('orders').insert([newTransaction]).select();
            if (error) { console.error("Error inserting order:", error); return null; }
            return data[0];
        }

        const transactions = await this.getTransactions();
        newTransaction.id = 'ORD-' + Date.now();
        newTransaction.timestamp = new Date().toISOString();
        transactions.push(newTransaction);
        localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(transactions));
        return newTransaction;
    }

    async updateTransactionStatus(id, newStatus) {
        if (this.useSupabase) {
            const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
            return !error;
        }
        const transactions = await this.getTransactions();
        const index = transactions.findIndex(t => t.id == id);
        if (index !== -1) {
            transactions[index].status = newStatus;
            localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(transactions));
            return true;
        }
        return false;
    }

    async getSellerFinancials() {
        const transactions = await this.getTransactions();
        const totalRevenue = transactions.reduce((acc, t) => acc + (t.price || 0), 0);
        const salesCount = transactions.length;
        return {
            totalRevenue,
            salesCount,
            recentTransactions: transactions.slice(-5).reverse()
        };
    }

    // Advanced Product Management
    async addProduct(productData) {
        let newProduct = {
            stock: 0,
            ...productData
        };

        if (this.useSupabase) {
            const { data, error } = await supabase.from('products').insert([newProduct]).select();
            if (error) { console.error("Error inserting product:", error); return null; }
            return data[0];
        }

        const products = await this.getProducts();
        newProduct.id = Date.now();
        products.push(newProduct);
        localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        return newProduct;
    }

    async deleteProduct(id) {
        if (this.useSupabase) {
            const { error } = await supabase.from('products').delete().eq('id', id);
            return !error;
        }

        let products = await this.getProducts();
        products = products.filter(p => p.id != id);
        localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        return true;
    }
}

export const db = new DatabaseService();
