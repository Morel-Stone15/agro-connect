export const products = [
    {
        id: 1,
        name: "Huile de Palme Rouge Premium",
        price: 4500,
        category: "Alimentation",
        origin: "Ogooué-Maritime",
        image: "/image/huile de palme.webp",
        description: "Huile de palme pressée à froid, 100% naturelle et riche en vitamines."
    },
    {
        id: 2,
        name: "Chocolat Artisanal de l'Ogooué",
        price: 2500,
        category: "Confiserie",
        origin: "Moyen-Ogooué",
        image: "/image/odika.png",
        description: "Chocolat noir 70% cacao issu des plantations durables du Gabon."
    },
    {
        id: 3,
        name: "Masque Punu Sculpté",
        price: 35000,
        category: "Artisanat",
        origin: "Ngounié",
        image: "/image/punu.webp",
        description: "Authentique masque Punu en bois précieux, pièce unique faite main."
    },
    {
        id: 4,
        name: "Miel Sauvage de l'Ivindo",
        price: 6000,
        category: "Alimentation",
        origin: "Ogooué-Ivindo",
        image: "/image/miel.jpg",
        description: "Miel de forêt primaire, goût intense et propriétés médicinales."
    },
    {
        id: 5,
        name: "Savon au Beurre de Karité & Moabi",
        price: 1500,
        category: "Beauté",
        origin: "Woleu-Ntem",
        image: "/image/savon.webp",
        description: "Soin naturel pour la peau à base d'extraits de Moabi précieux."
    },
    {
        id: 6,
        name: "Vannerie Traditionnelle",
        price: 12000,
        category: "Artisanat",
        origin: "Nyanga",
        image: "/image/van.webp",
        description: "Panier tressé selon les techniques ancestrales des côtes gabonaises."
    }
];

export const users = [
    { id: 1, name: "Jean-Pierre", role: "user", password: "user123" },
    { id: 2, name: "Ali", role: "seller", password: "seller123", matricule: "GAB-ALI-2026", matriculeUnlocked: false },
    { 
        id: 3, 
        name: "Marie", 
        firstname: "Dominique",
        birthdate: "1985-06-15",
        phone: "066000000",
        email: "marie.admin@agri.ga",
        role: "admin", 
        password: "admin123", 
        secretPhrase: "Gabon d'Abord toujours",
        adminUnlocked: false 
    }
];

export const provinces = [
    { id: 'estuaire', name: 'Estuaire', capital: 'Libreville', image: '/image/pk11.webp' },
    { id: 'haut-ogooue', name: 'Haut-Ogooué', capital: 'Franceville', image: '/image/france.jpg' },
    { id: 'moyen-ogooue', name: 'Moyen-Ogooué', capital: 'Lambaréné', image: '/image/lamb.jpg' },
    { id: 'ngounie', name: 'Ngounié', capital: 'Mouila', image: '/image/mouila.jpg' },
    { id: 'nyanga', name: 'Nyanga', capital: 'Tchibanga', image: '/image/tchibanga.jpg' },
    { id: 'ogooue-ivindo', name: 'Ogooué-Ivindo', capital: 'Makokou', image: '/image/makokou.jpg' },
    { id: 'ogooue-lolo', name: 'Ogooué-Lolo', capital: 'Koulamoutou', image: '/image/koulamoutou.jpg' },
    { id: 'ogooue-maritime', name: 'Ogooué-Maritime', capital: 'Port-Gentil', image: '/image/gentil.webp' },
    { id: 'woleu-ntem', name: 'Woleu-Ntem', capital: 'Oyem', image: '/image/oyem.jpg' }
];

export const reviews = [
    { id: 1, user: "Moussa Diop", text: "L'huile de palme est d'une qualité exceptionnelle, on sent vraiment le goût du pays.", rating: 5, date: "2024-03-24" },
    { id: 2, user: "Sarah B.", text: "Le chocolat de l'Ogooué est une merveille. Livraison rapide sur Libreville.", rating: 5, date: "2024-03-22" },
    { id: 3, user: "Marcelle", text: "Magnifique vannerie, elle décore superbement mon salon. Bel artisanat.", rating: 4, date: "2024-03-20" }
];
