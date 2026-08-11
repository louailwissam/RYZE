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

// --- 2. MULTILINGUAL DICTIONARY (i18n) ---
const translations = {
    en: {
        entering: "ENTERING RYZE...", hero_title: "YOU ARE  IN CONTROL", explore: "EXPLORE COLLECTION ->",
        collections: "COLLECTIONS", winter: "WINTER", autumn: "AUTUMN", summer: "SUMMER", tops: "- Tops", bottoms: "- Bottoms",
        cargo: "CARGO (BAG)", total: "TOTAL:", checkout: "TRANSMIT TO WHATSAPP", empty_cart: "Your cargo is empty.",
        latest_drops: "LATEST DROPS", archives_btn: "EXPLORE THE ARCHIVES (PAST COLLECTIONS) ", add_bag: "ADD TO BAG", sold_out: "SOLD OUT"
    },
    fr: {
        entering: "CONNEXION À RYZE...", hero_title: "VOUS N'ÊTES  AUX COMMANDES", explore: "EXPLORER LA COLLECTION ->",
        collections: "COLLECTIONS", winter: "HIVER", autumn: "AUTOMNE", summer: "ÉTÉ", tops: "- Hauts", bottoms: "- Bas",
        cargo: "CARGO (PANIER)", total: "TOTAL:", checkout: "COMMANDER VIA WHATSAPP", empty_cart: "Votre cargo est vide.",
        latest_drops: "DERNIÈRES SORTIES", archives_btn: "EXPLORER LES ARCHIVES (ANCIENNES COLLECTIONS) ", add_bag: "AJOUTER", sold_out: "ÉPUISÉ"
    },
    ar: {
        entering: "دخول عالم رايز...", hero_title: "أنت  في موقع السيطرة", explore: "استكشف التشكيلة <-",
        collections: "التشكيلات", winter: "شتاء", autumn: "خريف", summer: "صيف", tops: "- ملابس علوية", bottoms: "- ملابس سفلية",
        cargo: "الحقيبة", total: "المجموع:", checkout: "أرسل الطلب عبر واتساب", empty_cart: "حقيبتك فارغة.",
        latest_drops: "أحدث الإصدارات", archives_btn: "استكشف الأرشيف (التشكيلات السابقة) ", add_bag: "أضف للحقيبة", sold_out: "نفدت الكمية"
    }
};

let currentLang = 'en';

function changeLanguage(lang) {
    currentLang = lang;
    document.getElementById('html-doc').dir = lang === 'ar' ? 'rtl' : 'ltr'; // Magic RTL flip for Arabic
    
    // Update all static text
    document.querySelectorAll('[data-i18n]').forEach(el => {
        let key = el.getAttribute('data-i18n');
        if(translations[lang][key]) el.innerText = translations[lang][key];
    });
    
    // Re-render products to update "Add to Bag" / "Sold Out" text
    if (currentFilter) filterProducts(currentFilter.season, currentFilter.type);
    else showLatestDrops();
    
    updateCartUI();
}

// --- 3. DATABASE (Added Stock, Season, Type) ---
const produits = [
    {
        id: 1, name: "ORBIT TEE", price: 3500, season: "summer", type: "top", stock: 15, isLatest: true,
        imgFront: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600", imgBack: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600"
    },
    {
        id: 2, name: "VOID HOODIE", price: 6500, season: "winter", type: "top", stock: 0, isLatest: true, // STOCK = 0 (SOLD OUT)
        imgFront: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600", imgBack: "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600"
    },
    {
        id: 3, name: "NEBULA JACKET", price: 9500, season: "autumn", type: "top", stock: 5, isLatest: false, // NOT LATEST
        imgFront: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600", imgBack: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600"
    },
    {
        id: 4, name: "CARGO PANTS", price: 5500, season: "autumn", type: "bottom", stock: 10, isLatest: true,
        imgFront: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600", imgBack: "https://images.unsplash.com/photo-1517423568366-8b83523034fd?w=600"
    }
];

// --- 4. RENDER & FILTER LOGIC ---
const grid = document.getElementById('product-grid');
let currentFilter = null;

function renderProducts(liste, titleKey) {
    grid.innerHTML = "";
    document.getElementById('section-title').innerText = translations[currentLang][titleKey] || titleKey;

    if(liste.length === 0) {
        grid.innerHTML = `<p style='text-align:center; width:100%; color: #888;'>No items found in this sector.</p>`;
        return;
    }

    liste.forEach((produit, index) => {
        let isSoldOut = produit.stock === 0;
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
    document.getElementById('archives-hint').style.display = 'block';
    let latest = produits.filter(p => p.isLatest);
    renderProducts(latest, "latest_drops");
    closeNavMenu();
}

function filterProducts(season, type) {
    currentFilter = { season, type };
    document.getElementById('main-header').style.display = 'none'; // Hide big header when exploring specific category
    document.getElementById('archives-hint').style.display = 'none';
    
    let filtered = produits.filter(p => p.season === season && p.type === type);
    renderProducts(filtered, `${translations[currentLang][season]} - ${translations[currentLang][type+'s']}`);
    closeNavMenu();
}

// Initial Load
showLatestDrops();

// Search logic
document.getElementById('search-bar').addEventListener('input', (e) => {
    let mot = e.target.value.toLowerCase();
    let filtrés = produits.filter(p => p.name.toLowerCase().includes(mot));
    renderProducts(filtrés, "SEARCH RESULTS");
});

// --- 5. SIDEBARS (MENU & CART) ---
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

// --- 6. CART MANAGEMENT ---
let cart = [];

function selectSize(btn) {
    let siblings = btn.parentElement.children;
    for(let i=0; i<siblings.length; i++) siblings[i].classList.remove('active');
    btn.classList.add('active');
}

function addToCart(productId, btnElement) {
    let product = produits.find(p => p.id === productId);
    let sizeBtn = btnElement.parentElement.querySelector('.size-btn.active');
    let size = sizeBtn ? sizeBtn.innerText : 'M';

    let existingItem = cart.find(item => item.id === productId && item.size === size);
    if (existingItem) {
        if(existingItem.qty < product.stock) existingItem.qty += 1;
        else alert("Stock limit reached!");
    } else {
        cart.push({ ...product, size: size, qty: 1 });
    }

    updateCartUI();
    toggleCart(); // Auto-open cart to show they added it
}

function changeQty(index, amount) {
    let item = cart[index];
    let originalProduct = produits.find(p => p.id === item.id);
    
    if (amount === 1 && item.qty >= originalProduct.stock) return; // Can't add more than stock
    
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
    let message = "🪐 *RYZE ORDER* 🪐%0A%0A";
    let total = 0;
    cart.forEach(i => { message += `▪️ ${i.qty}x ${i.name} (Size: ${i.size}) - ${i.price * i.qty} DA%0A`; total += i.price * i.qty; });
    message += `%0A*TOTAL : ${total} DA*%0A%0AInfos:%0ANom : %0AWilaya : %0ATel : `;
    window.open(`https://wa.me/213000000000?text=${message}`, '_blank');
}