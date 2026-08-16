// --- 1. INTRO & ANIMATIONS ---
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('space-loader').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('space-loader').style.display = 'none';
            AOS.init({ duration: 1000, once: true });
        }, 1000);
    }, 2000);
});

// --- 2. CUSTOM CURSOR LOGIC ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if(cursorDot && cursorOutline) {
    window.addEventListener('mousemove', (e) => {
        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';
        cursorOutline.animate({
            left: e.clientX + 'px',
            top: e.clientY + 'px'
        }, { duration: 500, fill: 'forwards' });
    });

    document.body.addEventListener('mouseover', (e) => {
        if (e.target.closest('button, a, select, input, .size-btn, .logo, .menu-items p, .size-guide-link, .icon-btn')) {
            document.body.classList.add('cursor-hover');
        } else {
            document.body.classList.remove('cursor-hover');
        }
    });
}

// --- 3. MULTILINGUAL DICTIONARY ---
const translations = {
    en: {
        entering: "ENTERING RYZE...", 
        hero_title: "YOU ARE IN CONTROL", explore: "EXPLORE COLLECTION ->", manifesto_title: "REDEFINE GRAVITY", manifesto_text: "Streetwear designed for the unknown.",
        collections: "COLLECTIONS", winter: "WINTER", autumn: "AUTUMN", summer: "SUMMER", tops: "- Tops", bottoms: "- Bottoms",
        cargo: "CARGO (BAG)", total: "TOTAL:", checkout: "TRANSMIT TO WHATSAPP", empty_cart: "Your cargo is empty.",
        latest_drops: "LATEST DROPS", archives_btn: "EXPLORE THE ARCHIVES (PAST COLLECTIONS)", add_bag: "ADD TO BAG", sold_out: "SOLD OUT", size_guide: "Size Guide", size_guide_title: "SIZE GUIDE"
    },
    fr: {
        entering: "CONNEXION A RYZE...", 
        hero_title: "VOUS ETES AUX COMMANDES", explore: "EXPLORER LA COLLECTION ->", manifesto_title: "REDEFINIR LA GRAVITE", manifesto_text: "Le Streetwear concu pour l'inconnu.",
        collections: "COLLECTIONS", winter: "HIVER", autumn: "AUTOMNE", summer: "ETE", tops: "- Hauts", bottoms: "- Bas",
        cargo: "CARGO (PANIER)", total: "TOTAL:", checkout: "COMMANDER VIA WHATSAPP", empty_cart: "Votre cargo est vide.",
        latest_drops: "DERNIERES SORTIES", archives_btn: "EXPLORER LES ARCHIVES (ANCIENNES COLLECTIONS)", add_bag: "AJOUTER", sold_out: "EPUISE", size_guide: "Guide des Tailles", size_guide_title: "GUIDE DES TAILLES"
    },
    ar: {
        entering: "دخول عالم رايز...", 
        hero_title: "أنت في موقع السيطرة", explore: "استكشف التشكيلة <-", manifesto_title: "إعادة تعريف الجاذبية", manifesto_text: "ملابس شارع مصممة للمجهول.",
        collections: "التشكيلات", winter: "شتاء", autumn: "خريف", summer: "صيف", tops: "- ملابس علوية", bottoms: "- ملابس سفلية",
        cargo: "الحقيبة", total: "المجموع:", checkout: "أرسل الطلب عبر واتساب", empty_cart: "حقيبتك فارغة.",
        latest_drops: "أحدث الإصدارات", archives_btn: "استكشف الأرشيف (التشكيلات السابقة)", add_bag: "أضف للحقيبة", sold_out: "نفدت الكمية", size_guide: "دليل المقاسات", size_guide_title: "دليل المقاسات"
    }
};

let currentLang = 'en';

function changeLanguage(lang) {
    currentLang = lang;
    document.getElementById('html-doc').dir = lang === 'ar' ? 'rtl' : 'ltr'; 
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        let key = el.getAttribute('data-i18n');
        if(translations[lang][key]) el.innerText = translations[lang][key];
    });
    
    if (currentFilter) filterProducts(currentFilter.season, currentFilter.type);
    else showLatestDrops();
    
    updateCartUI();
}

// --- 4. DATABASE (CONNECTÉ À GOOGLE SHEETS) ---
let produits = []; 
const grid = document.getElementById('product-grid');
let currentFilter = null;

// ⚠️ METS LE LIEN DE TON FICHIER GOOGLE SHEETS PUBLIÉ (.csv) ICI :
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS1hvpFae2WqnRVuBCJoSjPDHkLQ0GQJeZHi7aTRcyQCF6uQZBksBSOCIlXHiSb3-DKrfD3jHqDNVrd/pub?output=csv";

function loadProductsFromGoogleSheets() {
    if (typeof Papa === 'undefined') {
        console.error("ERREUR: PapaParse n'est pas chargé. Ajoute le script dans le head de ton HTML.");
        grid.innerHTML = "<p style='text-align:center; color: red;'>Critical System Failure (PapaParse missing).</p>";
        return;
    }

    Papa.parse(sheetURL, {
        download: true,
        header: true,
        dynamicTyping: true, // Transforme le texte en nombres automatiquement
        complete: function(results) {
            // Nettoyer les lignes vides éventuelles
            produits = results.data.filter(p => p.name);
            
            // S'assurer que isLatest est bien compris comme un booléen
            produits.forEach(p => {
                p.isLatest = (p.isLatest === true || p.isLatest === "true" || p.isLatest === "TRUE" || p.isLatest === 1);
            });

            console.log("Transmission Reçue : Produits chargés", produits);
            
            // On affiche la page d'accueil une fois le chargement terminé
            showLatestDrops();
        },
        error: function(error) {
            console.error("Erreur Google Sheets:", error);
            grid.innerHTML = "<p style='text-align:center; color: red;'>Erreur de connexion au serveur Ryze.</p>";
        }
    });
}

// On lance le téléchargement des vêtements au démarrage
loadProductsFromGoogleSheets();


// --- 5. RENDER & FILTER ---
function renderProducts(liste, titleKey) {
    grid.innerHTML = "";
    document.getElementById('section-title').innerText = translations[currentLang][titleKey] || titleKey;

    if(liste.length === 0) {
        grid.innerHTML = `<p style='text-align:center; width:100%; color: #888;'>No items found.</p>`;
        return;
    }

    liste.forEach((produit, index) => {
        let isSoldOut = produit.stock <= 0;
        let btnText = isSoldOut ? translations[currentLang].sold_out : translations[currentLang].add_bag;
        let btnClass = isSoldOut ? "add-btn disabled" : "add-btn";
        let overlay = isSoldOut ? `<div class="sold-out-overlay"><div class="sold-out-text">${translations[currentLang].sold_out}</div></div>` : "";

        grid.innerHTML += `
            <div class="card" data-aos="fade-up" data-aos-delay="${(index % 4) * 100}">
                ${overlay}
                <div class="img-container">
                    <img src="${produit.imgFront}" class="img-front">
                    <img src="${produit.imgBack}" class="img-back">
                </div>
                <div class="prod-info">
                    <div class="prod-name">${produit.name}</div>
                    <div class="prod-price">${produit.price} DA</div>
                </div>
                <div class="size-header">
                    <span class="size-guide-link" onclick="openSizeGuide()">${translations[currentLang].size_guide}</span>
                </div>
                <div class="sizes">
                    <button class="size-btn active" onclick="selectSize(this)">S</button>
                    <button class="size-btn" onclick="selectSize(this)">M</button>
                    <button class="size-btn" onclick="selectSize(this)">L</button>
                    <button class="size-btn" onclick="selectSize(this)">XL</button>
                </div>
                <button class="${btnClass}" onclick="${isSoldOut ? '' : `addToCart(${produit.id}, this)`}">${btnText}</button>
            </div>
        `;
    });
}

function showLatestDrops() {
    currentFilter = null;
    document.getElementById('main-header').style.display = 'flex';
    document.getElementById('manifesto-section').style.display = 'flex';
    document.getElementById('archives-hint').style.display = 'block';
    
    document.getElementById('search-bar').value = '';
    
    let latest = produits.filter(p => p.isLatest);
    renderProducts(latest, "latest_drops");
    closeNavMenu();
}

function filterProducts(season, type) {
    currentFilter = { season, type };
    document.getElementById('main-header').style.display = 'none'; 
    document.getElementById('manifesto-section').style.display = 'none';
    document.getElementById('archives-hint').style.display = 'none';
    
    document.getElementById('search-bar').value = '';
    
    let filtered = produits.filter(p => p.season === season && p.type === type);
    renderProducts(filtered, `${translations[currentLang][season]} - ${translations[currentLang][type+'s']}`);
    closeNavMenu();
}

// --- RECHERCHE INTELLIGENTE ---
document.getElementById('search-bar').addEventListener('input', (e) => {
    let mot = e.target.value.toLowerCase().trim();
    
    if (mot === '') {
        showLatestDrops();
        return;
    }

    document.getElementById('main-header').style.display = 'none'; 
    document.getElementById('manifesto-section').style.display = 'none';
    document.getElementById('archives-hint').style.display = 'none';
    
    let filtrés = produits.filter(p => p.name.toLowerCase().includes(mot));
    
    let titre = currentLang === 'fr' ? 'RESULTATS' : (currentLang === 'ar' ? 'النتائج' : 'SEARCH RESULTS');
    renderProducts(filtrés, titre);
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// --- 6. SIDEBARS & MODALS ---
function toggleNavMenu() {
    document.getElementById('nav-sidebar').classList.toggle('active');
    document.getElementById('nav-overlay').classList.toggle('active');
}
function closeNavMenu() {
    document.getElementById('nav-sidebar').classList.remove('active');
    document.getElementById('nav-overlay').classList.remove('active');
}

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('active');
    document.getElementById('cart-overlay').classList.toggle('active');
    updateCartUI();
}

function openSizeGuide() {
    document.getElementById('size-modal').classList.add('active');
}
function closeSizeGuide(event, forceClose = false) {
    if (forceClose || event.target.id === 'size-modal') {
        document.getElementById('size-modal').classList.remove('active');
    }
}

// --- 7. CART MANAGEMENT ---
let cart = [];

function selectSize(btn) {
    let siblings = btn.parentElement.children;
    for(let i=0; i<siblings.length; i++) siblings[i].classList.remove('active');
    btn.classList.add('active');
}

function addToCart(productId, btnElement) {
    let product = produits.find(p => p.id === productId);
    let sizeBtn = btnElement.parentElement.parentElement.querySelector('.size-btn.active');
    let size = sizeBtn ? sizeBtn.innerText : 'M';

    let existingItem = cart.find(item => item.id === productId && item.size === size);
    if (existingItem) {
        if(existingItem.qty < product.stock) existingItem.qty += 1;
        else alert("Stock limit reached!");
    } else {
        cart.push({ ...product, size: size, qty: 1 });
    }

    updateCartUI();
    toggleCart(); 
}

function changeQty(index, amount) {
    let item = cart[index];
    let originalProduct = produits.find(p => p.id === item.id);
    if (amount === 1 && item.qty >= originalProduct.stock) return; 
    item.qty += amount;
    if (item.qty <= 0) cart.splice(index, 1);
    updateCartUI();
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    let container = document.getElementById('cart-items');
    container.innerHTML = "";
    let total = 0, totalItems = 0;

    if (cart.length === 0) {
        container.innerHTML = `<div class="empty-cart">${translations[currentLang].empty_cart}</div>`;
    } else {
        cart.forEach((item, index) => {
            total += item.price * item.qty;
            totalItems += item.qty;
            container.innerHTML += `
                <div class="cart-item">
                    <img src="${item.imgFront}">
                    <div class="item-info">
                        <div class="item-title">${item.name}</div>
                        <div class="item-price">${item.size} | ${item.price} DA</div>
                        <div class="qty-controls">
                            <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                            <span>${item.qty}</span>
                            <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                            <button class="remove-btn" onclick="removeItem(${index})"><i class="ph ph-trash"></i></button>
                        </div>
                    </div>
                </div>`;
        });
    }
    document.getElementById('cart-total-price').innerText = total;
    document.getElementById('cart-count').innerText = totalItems;
}

function checkout() {
    if (cart.length === 0) return;
    let message = "RYZE ORDER%0A%0A";
    let total = 0;
    cart.forEach(i => { message += `- ${i.qty}x ${i.name} (Size: ${i.size}) : ${i.price * i.qty} DA%0A`; total += i.price * i.qty; });
    message += `%0ATOTAL : ${total} DA%0A%0AInfos:%0AName : %0AWilaya : %0ATel : `;
    
    // ⚠️ N'OUBLIE PAS DE METTRE TON VRAI NUMÉRO ICI !
    window.open(`https://wa.me/213000000000?text=${message}`, '_blank');
}