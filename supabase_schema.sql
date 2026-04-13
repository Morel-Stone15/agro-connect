-- Script SQL pour la base de données Supabase "L'Essence du Gabon"

-- 1. Table des Utilisateurs
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    password TEXT NOT NULL, -- NOTE: Dans un vrai système en prod, cela devrait être stocké via Supabase Auth ou hashé, mais on garde la compatibilité avec votre code actuel
    firstname TEXT,
    birthdate DATE,
    phone TEXT,
    email TEXT,
    secretPhrase TEXT,
    matricule TEXT,
    matriculeUnlocked BOOLEAN DEFAULT false,
    adminUnlocked BOOLEAN DEFAULT false,
    joinedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table des Produits
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    category TEXT,
    origin TEXT,
    image TEXT,
    description TEXT,
    stock INTEGER DEFAULT 0
);

-- 3. Table des Commandes (Transactions)
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'En attente',
    price NUMERIC NOT NULL,
    quantity INTEGER,
    productId UUID REFERENCES products(id),
    userId UUID REFERENCES users(id)
);

-- Insertion des données par défaut pour les Produits
INSERT INTO products (name, price, category, origin, image, description, stock) VALUES
('Huile de Palme Rouge Premium', 4500, 'Alimentation', 'Ogooué-Maritime', '/image/huile de palme.webp', 'Huile de palme pressée à froid, 100% naturelle et riche en vitamines.', 50),
('Chocolat Artisanal de l''Ogooué', 2500, 'Confiserie', 'Moyen-Ogooué', '/image/odika.png', 'Chocolat noir 70% cacao issu des plantations durables du Gabon.', 50),
('Masque Punu Sculpté', 35000, 'Artisanat', 'Ngounié', '/image/punu.webp', 'Authentique masque Punu en bois précieux, pièce unique faite main.', 50),
('Miel Sauvage de l''Ivindo', 6000, 'Alimentation', 'Ogooué-Ivindo', '/image/miel.jpg', 'Miel de forêt primaire, goût intense et propriétés médicinales.', 50),
('Savon au Beurre de Karité & Moabi', 1500, 'Beauté', 'Woleu-Ntem', '/image/savon.webp', 'Soin naturel pour la peau à base d''extraits de Moabi précieux.', 50),
('Vannerie Traditionnelle', 12000, 'Artisanat', 'Nyanga', '/image/van.webp', 'Panier tressé selon les techniques ancestrales des côtes gabonaises.', 50);

-- Insertion des données par défaut pour les Utilisateurs
INSERT INTO users (name, role, password, matricule) VALUES
('Jean-Pierre', 'user', 'user123', null),
('Ali', 'seller', 'seller123', 'GAB-ALI-2026');

INSERT INTO users (name, firstname, birthdate, phone, email, role, password, secretPhrase) VALUES
('Marie', 'Dominique', '1985-06-15', '066000000', 'marie.admin@agri.ga', 'admin', 'admin123', 'Gabon d''Abord toujours');

-- 4. Désactivation de la sécurité stricte (Autorisation au site Web de modifier les données)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
