// ===== REMERA STORE - JAVASCRIPT FUNCTIONALITY =====

// ===== GLOBAL STATE =====
class StoreState {
    constructor() {
        this.cart = this.loadCartFromStorage();
        this.products = [];
        this.categories = [];
        this.priceRanges = [];
        this.sortOptions = [];
        this.filters = {
            category: '',
            price: '',
            sort: 'featured'
        };
        this.currentView = 'grid';
        this.isLoading = false;
        this.error = null;
    }

    // Cargando los productos de productos.JSON
    async loadProducts() {
        try {
            this.isLoading = true;
            this.error = null;
            
            const response = await fetch('./products.json');

            if (!response.ok) {
                throw new Error(`Error en la respuesta de la API ${response.status}`);
            }
            
            const data = await response.json();
            this.products = data.products || [];
            this.categories = data.categories || [];
            this.priceRanges = data.priceRanges || [];
            this.sortOptions = data.sortOptions || [];
            
            console.log(`✅ Cargados ${this.products.length} productos desde JSON`);
            return true;
            


        } catch (error) {
            console.error('❌ Error cargando productos:', error);
            this.error = error.message;
            this.products = this.getFallbackProducts();
            return false;
        } finally {
            this.isLoading = false;
        }
    }



    // GESTION DE CARRITO
    addToCart(productId, size = 'M', quantity = 1) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            console.error('❌ Producto no encontrado:', productId);
            return false;
        }

        const cartItem = {
            id: `${productId}-${size}`,
            productId,
            name: product.nombre,
            price: product.price,
            size,
            quantity,
            image: product.image
        };

        console.log('🛒 Agregando al carrito:', cartItem);

        const existingItem = this.cart.find(item => item.id === cartItem.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push(cartItem);
        }

        this.saveCartToStorage();
        return true;
    }

    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCartToStorage();
    }

    updateQuantity(itemId, quantity) {
        const item = this.cart.find(item => item.id === itemId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(itemId);
            } else {
                item.quantity = quantity;
                this.saveCartToStorage();
            }
        }
    }

    clearCart() {
        this.cart = [];
        this.saveCartToStorage();
    }


    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getCartItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }





    // Local storage
    saveCartToStorage() {
        localStorage.setItem('remeraStore_cart', JSON.stringify(this.cart));
    }

    loadCartFromStorage() {
        const saved = localStorage.getItem('remeraStore_cart');
        return saved ? JSON.parse(saved) : [];
    }






    // Product filtering
    getFilteredProducts() {
        let filtered = [...this.products];

        // Category filter
        if (this.filters.category) {
            filtered = filtered.filter(product => product.category === this.filters.category);
        }

        // Price filter
        if (this.filters.price) {
            const [min, max] = this.filters.price.split('-').map(Number);
            filtered = filtered.filter(product => {
                if (max) {
                    return product.price >= min && product.price <= max;
                } else {
                    return product.price >= min;
                }
            });
        }

        // Sort
        switch (this.filters.sort) {
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                filtered.sort((a, b) => b.id - a.id);
                break;
            case 'featured':
            default:
                filtered.sort((a, b) => b.featured - a.featured);
                break;
        }

        return filtered;
    }
}





// ===== UI COMPONENTS =====
class UIComponents {
    constructor() {
        this.toastContainer = document.getElementById('toast-container');
        this.currentYear = new Date().getFullYear();
    }

    // Toast notifications
    showToast(message, type = 'success', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = type === 'success' ? 
            '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 12l2 2 4-4"></path><circle cx="12" cy="12" r="10"></circle></svg>' :
            '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18"></path><path d="M6 6l12 12"></path></svg>';

        toast.innerHTML = `
            ${icon}
            <div class="toast-content">
                <div class="toast-title">${type === 'success' ? 'Éxito' : 'Error'}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;

        this.toastContainer.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);

        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(amount);
    }

    // Generate star rating HTML
    generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let starsHTML = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<span class="star filled">★</span>';
        }
        
        // Half star
        if (hasHalfStar) {
            starsHTML += '<span class="star half">★</span>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<span class="star">★</span>';
        }

        return starsHTML;
    }

    // Update current year in footer
    updateCurrentYear() {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = this.currentYear;
        }
    }
}




// ===== CART MANAGER =====
class CartManager {
    constructor(storeState, uiComponents) {
        this.store = storeState;
        this.ui = uiComponents;
        this.cartDrawer = document.getElementById('cart-drawer');
        this.cartOverlay = document.getElementById('cart-overlay');
        this.cartToggle = document.getElementById('cart-toggle');
        this.cartClose = document.getElementById('cart-close');
        this.cartBadge = document.getElementById('cart-badge');
        this.cartItems = document.getElementById('cart-items');
        this.cartEmpty = document.getElementById('cart-empty');
        this.cartFooter = document.getElementById('cart-footer');
        this.cartSubtotal = document.getElementById('cart-subtotal');
        this.cartTotal = document.getElementById('cart-total');
        this.cartItemCount = document.getElementById('cart-item-count');
        this.clearCartBtn = document.getElementById('clear-cart');
        this.checkoutBtn = document.getElementById('checkout');
        this.continueShoppingBtn = document.getElementById('continue-shopping');

        this.initializeCart();
    }

    initializeCart() {
        this.setupEventListeners();
        this.updateCartUI();
    }

    setupEventListeners() {
        // Cart toggle
        this.cartToggle?.addEventListener('click', () => this.openCart());
        this.cartClose?.addEventListener('click', () => this.closeCart());
        this.cartOverlay?.addEventListener('click', () => this.closeCart());
        this.continueShoppingBtn?.addEventListener('click', () => this.closeCart());

        // Cart actions
        this.clearCartBtn?.addEventListener('click', () => this.clearCart());
        this.checkoutBtn?.addEventListener('click', () => this.checkout());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isCartOpen()) {
                this.closeCart();
            }
        });
    }

    openCart() {
        this.cartDrawer.setAttribute('aria-hidden', 'false');
        this.cartOverlay.setAttribute('aria-hidden', 'false');
        this.cartToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        this.cartDrawer.setAttribute('aria-hidden', 'true');
        this.cartOverlay.setAttribute('aria-hidden', 'true');
        this.cartToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    isCartOpen() {
        return this.cartDrawer.getAttribute('aria-hidden') === 'false';
    }

    addToCart(productId, size = 'M') {
        const success = this.store.addToCart(productId, size, 1);
        if (success) {
            this.updateCartUI();
            this.ui.showToast('Producto agregado al carrito', 'success');
        }
        return success;
    }

    removeFromCart(itemId) {
        this.store.removeFromCart(itemId);
        this.updateCartUI();
        this.ui.showToast('Producto eliminado del carrito', 'success');
    }

    updateQuantity(itemId, quantity) {
        this.store.updateQuantity(itemId, quantity);
        this.updateCartUI();
    }

    clearCart() {
        if (this.store.cart.length === 0) return;
        
        if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
            this.store.clearCart();
            this.updateCartUI();
            this.ui.showToast('Carrito vaciado', 'success');
        }
    }

    checkout() {
        if (this.store.cart.length === 0) return;
        
        const total = this.store.getCartTotal();
        this.ui.showToast(`Redirigiendo al checkout. Total: ${this.ui.formatCurrency(total)}`, 'success', 2000);
        
        // Simulate checkout process
        setTimeout(() => {
            this.store.clearCart();
            this.updateCartUI();
            this.closeCart();
        }, 2000);
    }

    updateCartUI() {
        const itemCount = this.store.getCartItemCount();
        const total = this.store.getCartTotal();

        console.log('🔄 Actualizando UI del carrito:', {
            cartLength: this.store.cart.length,
            itemCount,
            total
        });

        // Update badge
        this.cartBadge.textContent = itemCount;
        this.cartBadge.style.display = itemCount > 0 ? 'flex' : 'none';

        // Update cart item count
        this.cartItemCount.textContent = `(${itemCount})`;

        // Update totals
        this.cartSubtotal.textContent = this.ui.formatCurrency(total);
        this.cartTotal.textContent = this.ui.formatCurrency(total);

        // Show/hide empty state
        if (this.store.cart.length === 0) {
            console.log('📭 Carrito vacío - mostrando estado vacío');
            this.cartEmpty.setAttribute('aria-hidden', 'false');
            this.cartFooter.setAttribute('aria-hidden', 'true');
            this.cartItems.innerHTML = '';
        } else {
            console.log('🛒 Carrito con productos - ocultando estado vacío');
            this.cartEmpty.setAttribute('aria-hidden', 'true');
            this.cartFooter.setAttribute('aria-hidden', 'false');
            this.renderCartItems();
        }
    }

    renderCartItems() {
        console.log('🛒 Renderizando items del carrito:', this.store.cart);
        
        this.cartItems.innerHTML = this.store.cart.map(item => {
            console.log(`🖼️ Renderizando imagen para ${item.name}: ${item.image}`);
            
            return `
                <div class="cart-item" role="listitem">
                    <img src="${item.image}" 
                         alt="${item.name}" 
                         class="cart-item-image" 
                         loading="lazy"
                         onload="console.log('✅ Imagen cargada:', '${item.image}')"
                         onerror="console.log('❌ Error cargando imagen:', '${item.image}'); this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjNGNEY2IiBzdHJva2U9IiNEMUQ1REIiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSIzMCIgeT0iMzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2VuPC90ZXh0Pgo8dGV4dCB4PSIzMCIgeT0iNDciIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4IiBmaWxsPSIjOUNBM0FGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ubyBkaXNwPC90ZXh0Pgo8L3N2Zz4='; this.alt='Imagen no disponible';">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">Talle: ${item.size} - ${this.ui.formatCurrency(item.price)}</div>
                        <div class="cart-item-controls">
                            <button class="quantity-btn" onclick="cartManager.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn" onclick="cartManager.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                            <button class="remove-btn" onclick="cartManager.removeFromCart('${item.id}')">Eliminar</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// ===== PRODUCT MANAGER =====
class ProductManager {
    constructor(storeState, uiComponents, cartManager) {
        this.store = storeState;
        this.ui = uiComponents;
        this.cartManager = cartManager;
        this.productsGrid = document.getElementById('products-grid');
        this.productsCount = document.getElementById('products-count');
        this.categoryFilter = document.getElementById('category-filter');
        this.priceFilter = document.getElementById('price-filter');
        this.sortFilter = document.getElementById('sort-filter');
        this.viewToggle = document.querySelectorAll('.view-btn');

        this.initializeProducts();
    }

    initializeProducts() {
        this.setupEventListeners();
        this.renderProducts();
    }

    setupEventListeners() {
        // Filters
        this.categoryFilter?.addEventListener('change', (e) => {
            this.store.filters.category = e.target.value;
            this.renderProducts();
        });

        this.priceFilter?.addEventListener('change', (e) => {
            this.store.filters.price = e.target.value;
            this.renderProducts();
        });

        this.sortFilter?.addEventListener('change', (e) => {
            this.store.filters.sort = e.target.value;
            this.renderProducts();
        });

        // View toggle
        this.viewToggle.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.viewToggle.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.store.currentView = e.target.dataset.view;
                this.renderProducts();
            });
        });

        // Product interactions
        this.productsGrid?.addEventListener('click', (e) => {
            const addToCartBtn = e.target.closest('.add-to-cart-btn');
            const sizeBtn = e.target.closest('.size-btn');
            const wishlistBtn = e.target.closest('.wishlist-btn');
            const quickViewBtn = e.target.closest('.quick-view-btn');

            if (addToCartBtn) {
                const productId = parseInt(addToCartBtn.dataset.productId);
                const selectedSize = addToCartBtn.closest('.product-card').querySelector('.size-btn.active')?.dataset.size || 'M';
                this.cartManager.addToCart(productId, selectedSize);
            }

            if (sizeBtn) {
                const productCard = sizeBtn.closest('.product-card');
                productCard.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
                sizeBtn.classList.add('active');
            }

            if (wishlistBtn) {
                this.toggleWishlist(wishlistBtn);
            }

            if (quickViewBtn) {
                this.showQuickView(quickViewBtn);
            }
        });
    }

    renderProducts() {
        if (this.store.isLoading) {
            this.showLoadingState();
            return;
        }

        if (this.store.error) {
            this.showErrorState();
            return;
        }

        const filteredProducts = this.store.getFilteredProducts();
        this.productsCount.textContent = `(${filteredProducts.length} productos)`;

        if (filteredProducts.length === 0) {
            this.showEmptyState();
            return;
        }

        this.productsGrid.innerHTML = filteredProducts.map(product => this.createProductCard(product)).join('');
    }

    showLoadingState() {
        this.productsCount.textContent = '(Cargando...)';
        this.productsGrid.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Cargando productos...</p>
            </div>
        `;
    }

    showErrorState() {
        this.productsCount.textContent = '(Error al cargar)';
        this.productsGrid.innerHTML = `
            <div class="error-state">
                <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <h3>Error al cargar productos</h3>
                <p>${this.store.error}</p>
                <button class="btn btn-primary" onclick="location.reload()">Reintentar</button>
            </div>
        `;
    }

    showEmptyState() {
        this.productsCount.textContent = '(Sin resultados)';
        this.productsGrid.innerHTML = `
            <div class="empty-state">
                <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <h3>No se encontraron productos</h3>
                <p>Intenta ajustar los filtros de búsqueda</p>
                <button class="btn btn-primary" onclick="productManager.clearFilters()">Limpiar filtros</button>
            </div>
        `;
    }

    clearFilters() {
        this.store.filters = {
            category: '',
            price: '',
            sort: 'featured'
        };
        
        // Reset filter UI
        this.categoryFilter.value = '';
        this.priceFilter.value = '';
        this.sortFilter.value = 'featured';
        
        this.renderProducts();
    }

    createProductCard(product) {
        const discount = product.originalPrice ? 
            Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

        return `
            <article class="product-card" 
                     role="gridcell" 
                     data-product-id="${product.id}" 
                     data-category="${product.category}"
                     data-price="${product.price}"
                     data-featured="${product.featured}">
                <div class="product-image-container">
                    <img src="${product.image}" 
                         alt="${product.name}" 
                         class="product-image"
                         loading="lazy"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzE2NS40NjQgMTAwIDE3OCAxMTIuNTM2IDE3OCAxMjhDMTc4IDE0My40NjQgMTY1LjQ2NCAxNTYgMTUwIDE1NkMxMzQuNTM2IDE1NiAxMjIgMTQzLjQ2NCAxMjIgMTI4QzEyMiAxMTIuNTM2IDEzNC41MzYgMTAwIDE1MCAxMDBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xMjIgMTY4SDE3OFYyMDBIMTIyVjE2OFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'; this.alt='Imagen no disponible';">
                    <div class="product-badges">
                        ${product.featured ? '<span class="badge badge-featured">Destacado</span>' : ''}
                        ${product.id > 3 ? '<span class="badge badge-new">Nuevo</span>' : ''}
                        ${discount > 0 ? `<span class="badge badge-discount">-${discount}%</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="action-btn wishlist-btn" 
                                aria-label="Agregar a favoritos"
                                title="Agregar a favoritos">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                        <button class="action-btn quick-view-btn" 
                                aria-label="Vista rápida"
                                title="Vista rápida">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="product-content">
                    <div class="product-category">${this.getCategoryName(product.category)}</div>
                        <h3 class="product-title">${product.nombre}</h3>
                    <p class="product-description">${product.description}</p>
                    
                    <div class="product-rating">
                        <div class="stars" aria-label="${product.rating} de 5 estrellas">
                            ${this.ui.generateStarRating(product.rating)}
                        </div>
                        <span class="rating-count">(${product.reviews})</span>
                    </div>
                    
                    <div class="product-pricing">
                        <span class="current-price">${this.ui.formatCurrency(product.price)}</span>
                        ${product.originalPrice ? `<span class="original-price">${this.ui.formatCurrency(product.originalPrice)}</span>` : ''}
                        ${discount > 0 ? `<span class="discount-badge">-${discount}%</span>` : ''}
                    </div>
                    
                    <div class="product-sizes">
                        <span class="size-label">Talle:</span>
                        <div class="size-options">
                            ${product.sizes.map(size => `
                                <button class="size-btn ${size === 'M' ? 'active' : ''}" data-size="${size}">${size}</button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <button class="add-to-cart-btn" 
                            data-product-id="${product.id}"
                            aria-label="Agregar ${product.nombre} al carrito">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-6m8 0V9a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4.01"></path>
                        </svg>
                        Agregar al carrito
                    </button>
                </div>
            </article>
        `;
    }

    getCategoryName(category) {
        const categories = {
            'basicas': 'Básicas',
            'oversize': 'Oversize',
            'vintage': 'Vintage',
            'estampadas': 'Estampadas'
        };
        return categories[category] || category;
    }

    toggleWishlist(btn) {
        btn.classList.toggle('active');
        const isActive = btn.classList.contains('active');
        this.ui.showToast(
            isActive ? 'Agregado a favoritos' : 'Eliminado de favoritos', 
            'success'
        );
    }

    showQuickView(btn) {
        const productCard = btn.closest('.product-card');
        const productId = parseInt(productCard.dataset.productId);
        const product = this.store.products.find(p => p.id === productId);
        
        if (product) {
            this.ui.showToast(`Vista rápida: ${product.nombre}`, 'success', 2000);
            // Here you could implement a modal with product details
        }
    }
}

// ===== SEARCH FUNCTIONALITY =====
class SearchManager {
    constructor(storeState, productManager) {
        this.store = storeState;
        this.productManager = productManager;
        this.searchToggle = document.querySelector('.search-toggle');
        this.setupSearch();
    }

    setupSearch() {
        this.searchToggle?.addEventListener('click', () => {
            this.showSearchModal();
        });
    }

    showSearchModal() {
        // Simple search implementation
        const searchTerm = prompt('Buscar productos:');
        if (searchTerm) {
            this.searchProducts(searchTerm);
        }
    }

    searchProducts(term) {
        const filtered = this.store.products.filter(product => 
            product.nombre.toLowerCase().includes(term.toLowerCase()) ||
            product.description.toLowerCase().includes(term.toLowerCase()) ||
            product.category.toLowerCase().includes(term.toLowerCase())
        );

        // Update products display
        this.productManager.productsGrid.innerHTML = filtered.map(product => 
            this.productManager.createProductCard(product)
        ).join('');

        this.productManager.productsCount.textContent = `(${filtered.length} productos encontrados)`;
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize global state
        window.storeState = new StoreState();
        window.uiComponents = new UIComponents();
        
        // Initialize managers
        window.cartManager = new CartManager(window.storeState, window.uiComponents);
        window.productManager = new ProductManager(window.storeState, window.uiComponents, window.cartManager);
        window.searchManager = new SearchManager(window.storeState, window.productManager);
        
        // Update UI
        window.uiComponents.updateCurrentYear();
        window.cartManager.updateCartUI();
        
        // Load products from JSON
        console.log('📦 Cargando productos desde JSON...');
        const success = await window.storeState.loadProducts();
        
        if (success) {
            console.log('✅ Productos cargados exitosamente');
            window.productManager.renderProducts();
        } else {
            console.log('⚠️ Usando productos de fallback');
            window.productManager.renderProducts();
        }
        
        // Add loading animation
        document.body.classList.add('loaded');
        
        console.log('🚀 RemeraStore initialized successfully!');
        
        // Debug function to test images
        window.testImages = () => {
            console.log('🔍 Probando carga de imágenes...');
            const testImages = [
                'img/M.jpg',
                'img/card-oversize-index1.jpg',
                'img/carrusel2index.jpg',
                'img/carrusel4index.jpg',
                'img/carrusel5index.jpg',
                'img/newyork.jpeg'
            ];
            
            testImages.forEach(src => {
                const img = new Image();
                img.onload = () => console.log(`✅ ${src} - OK`);
                img.onerror = () => console.log(`❌ ${src} - ERROR`);
                img.src = src;
            });
        };
        
        // Run image test automatically
        setTimeout(() => {
            window.testImages();
        }, 1000);
        
    } catch (error) {
        console.error('❌ Error inicializando la aplicación:', error);
        window.uiComponents.showToast('Error al cargar la aplicación', 'error');
    }
});

// ===== UTILITY FUNCTIONS =====
window.formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0
    }).format(amount);
};

// Image utility functions
window.checkImageExists = (src) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = src;
    });
};

window.getImageFallback = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMCAyMEMzNi42MjcgMjAgNDIgMjUuMzczIDQyIDMyQzQyIDM4LjYyNyAzNi42MjcgNDQgMzAgNDRDMjMuMzczIDQ0IDE4IDM4LjYyNyAxOCAzMkMxOCAyNS4zNzMgMjMuMzczIDIwIDMwIDIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMjQgMzZIMzZWNDRIMjRWMzZaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg==';
};

// ===== PERFORMANCE OPTIMIZATIONS =====
// Lazy loading for images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
