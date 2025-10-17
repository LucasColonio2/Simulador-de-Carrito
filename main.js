// ===== REMERA STORE - JAVASCRIPT FUNCTIONALITY =====

// ===== GLOBAL STATE =====

/* class StoreState {
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

            products = data.products || [];
            categories = data.categories || [];

            return true;


        } catch (error) {
            console.error('❌ Error cargando productos:', error);
            this.error = error.message;
            return false;


        } finally {
            this.isLoading = false;
        }
    }



    // GESTOR DEL CARRITO

    //AGREGAR PRODUCTO A CARRITO
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

    //ELIMINAR PRODUCTO DEL CARRITO
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



    //ELIMINAR CARRITO
    clearCart() {
        this.cart = [];
        this.saveCartToStorage();
    }

    //OBTENER TOTAL DE CARRITO
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
    } */






// FILTRO DE PRODUCTOS 
/* getFilteredProducts() {
    let filtered = [...this.products];

    // FILTRO POR CATEGORIA
    if (this.filters.category) {
        filtered = filtered.filter(product => product.category === this.filters.category);
    }

    // FILTRO POR PRECIO
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

    // FILTRO ORDENAR por precio mas alto y mas bajo
    switch (this.filters.sort) {
        case 'precio-low':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'precio-high':
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
*/


/* 
//INICIALIZACION DE CARRITO
initializeCart() {
    this.setupEventListeners();
    this.updateCartUI();
}


setupEventListeners() {
    // Cart toggle
    const cartToggle?.addEventListener('click', () => this.openCart());
    const cartClose?.addEventListener('click', () => this.closeCart());



    const cartOverlay?.addEventListener('click', () => this.closeCart());
    const continueShoppingBtn?.addEventListener('click', () => this.closeCart());

    // Cart actions
    const clearCartBtn.addEventListener('click', () => this.clearCart());
    const checkoutBtn.addEventListener('click', () => this.checkout());

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
    }
}



}





// ===== PRODUCT MANAGER =====
class ProductManager {
    constructor(storeState) {
        this.store = storeState;
        this.productsGrid = document.getElementById('products-grid');
        this.productsCount = document.getElementById('products-count');
        this.categoryFilter = document.getElementById('category-filter');
        this.priceFilter = document.getElementById('price-filter');
        this.sortFilter = document.getElementById('sort-filter');

        this.initializeProducts();
    }

    initializeProducts() {
        this.setupEventListeners();
        this.renderProducts();
    }


    //Este método escucha los clics del usuario dentro del contenedor principal de los productos (this.productsGrid).
    setupEventListeners() {
        // Filters
        this.categoryFilter?.addEventListener('change', (e) => {
            this.store.filters.category = e.target.value;
            this.renderProducts(); //Llama a la funcion renderproducts ()
        });

        this.priceFilter?.addEventListener('change', (e) => {
            this.store.filters.price = e.target.value;
            this.renderProducts(); //Llama a la funcion renderproducts ()
        });

        this.sortFilter?.addEventListener('change', (e) => {
            this.store.filters.sort = e.target.value;
            this.renderProducts(); //Llama a la funcion renderproducts ()
        });


        // Product interactions
        this.productsGrid?.addEventListener('click', (e) => {
            const addToCartBtn = e.target.closest('.add-to-cart-btn');
            const sizeBtn = e.target.closest('.size-btn');


            if (addToCartBtn) {
                const productId = parseInt(addToCartBtn.dataset.productId);
                const selectedSize = addToCartBtn.closest('.product-card').querySelector('.size-btn.active')?.dataset.size || 'M';
                this.cartManager.addToCart(productId, selectedSize);
            }

            //Marca visualmente el talle que el usuario seleccionó:
            if (sizeBtn) {
                const productCard = sizeBtn.closest('.product-card');
                productCard.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
                sizeBtn.classList.add('active');
            }
        });
    }

    renderProducts() {
        const filteredProducts = this.store.getFilteredProducts();
        this.productsCount.textContent = `(${filteredProducts.length} productos)`;


        this.productsGrid.innerHTML = filteredProducts.map(product => this.createProductCard(product)).join('');
    }




    //Restablecer los filtros de búsqueda a su estado inicial.
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


    //Traduce el nombre “técnico” de la categoría (como viene en el JSON) a un nombre legible para mostrar en pantalla.
 

}
 */
//-------------------------------------------------------------------------

/* 
 */



//-----------------------------------------------------------------------------




const cartDrawer = document.getElementById('cart-drawer');
const cartToggle = document.getElementById('cart-toggle');
const cartOverlay = document.getElementById('cart-overlay');
const cartClose = document.getElementById('cart-close');
const cartBadge = document.getElementById('cart-badge');
const cartItems = document.getElementById('cart-items');
const cartEmpty = document.getElementById('cart-empty');
const cartFooter = document.getElementById('cart-footer');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartTotal = document.getElementById('cart-total');
const cartItemCount = document.getElementById('cart-item-count');
const clearCartBtn = document.getElementById('clear-cart');
const checkoutBtn = document.getElementById('checkout');
const continueShoppingBtn = document.getElementById('continue-shopping');
const productsGrid = document.getElementById('.products-grid');

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = []



function updateCartUI() {
    const itemCount = store.getCartItemCount();
    const total = store.getCartTotal();

    console.log('🔄 Actualizando UI del carrito:', {
        cartLength: store.cart.length,
        itemCount,
        total
    });

    // Update badge
    cartBadge.textContent = itemCount;
    cartBadge.style.display = itemCount > 0 ? 'flex' : 'none';

    // Update cart item count
    cartItemCount.textContent = `(${itemCount})`;

    // Update totals
    cartSubtotal.textContent = formatCurrency(total);
    cartTotal.textContent = formatCurrency(total);

    // Show/hide empty state
    if (store.cart.length === 0) {
        console.log('📭 Carrito vacío - mostrando estado vacío');
        cartEmpty.setAttribute('aria-hidden', 'false');
        cartFooter.setAttribute('aria-hidden', 'true');
        cartItems.innerHTML = '';
    } else {
        console.log('🛒 Carrito con productos - ocultando estado vacío');
        cartEmpty.setAttribute('aria-hidden', 'true');
        cartFooter.setAttribute('aria-hidden', 'false');
        renderCartItems();
    }
}




//Cerrar carrito
function closeCart(){
    cartDrawer.setAttribute('aria-hidden', 'true');
    cartOverlay.setAttribute('aria-hidden', 'true');
    cartToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

//Abrir carrito
function openCart() {
    cartDrawer.setAttribute('aria-hidden', 'false');
    cartOverlay.setAttribute('aria-hidden', 'false');
    cartToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
}




//Remover producto de carrito
function removeFromCart(itemId) {
    store.removeFromCart(itemId);
    updateCartUI();
}

//Aumentar cantidad de producto en carrito
function updateQuantity(itemId, quantity) {
    store.updateQuantity(itemId, quantity);
    updateCartUI();
}

//LIMPIAR CARRITO
function clearCart() {
    if (store.cart.length === 0) return;

    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        store.clearCart();
        updateCartUI();
    }}



function updateCartCount() {
    cartBadge.textContent = cart.reduce((acc, item) => acc + item.quantity, 0)
}



//FUNCION AGREGAR PRODUCTO A CARRITO 
function addToCart(product) {
    const existingProduct = cart.find(item => item.id === product.id)
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 })
    }
    localStorage.setItem("cart", JSON.stringify(cart))
    updateCartCount()

    Toastify({
        text: `${product.name} agregado al carrito`,
        duration: 3000,
        gravity: 'top',
        position: 'right',
        stopOnFocus: true,
    }).showToast();
}

//CATEGORIA DEL PRODUCTO
function getCategoryName(category) {
    const categories = {
        'basicas': 'Básicas',
        'oversize': 'Oversize',
        'vintage': 'Vintage',
        'estampadas': 'Estampadas'
    };
    return categories[category] || category;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
    }).format(amount);
}


//FUNCION MOSTRAR CARD PRODUCTO
function displayProduct(data) {
    const productsGrid = document.querySelector('#products-grid');

    productsGrid.innerHTML = '';

    // Verificamos que data.products exista y sea un array
    if (!data.products || !Array.isArray(data.products)) {
        console.error('❌ Error: data.products no es un array válido', data);
        return;
    }


    data.products.forEach(product => {
        const productCard = document.createElement('div');


        ///SE LE AGREGA DESCUENTO A LAS REMERAS CON DESCUENTO
        const discount = product.originalPrice
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 0;

        productCard.innerHTML = `
            <article class="product-card" 
                     data-product-id="${product.id}" 
                     data-category="${product.category}"
                     data-price="${product.price}"
                     data-featured="${product.featured}">
                <div class="product-image-container">
                    <img src="${product.image}" 
                         class="product-image">
                </div>
                
                <div class="product-content">
                    <div class="product-category">${getCategoryName(product.category)}</div>
                        <h3 class="product-title">${product.nombre}</h3>
                    <p class="product-description">${product.description}</p>
                    </div>
                    
                    <div class="product-pricing">
                        <span class="current-price">$${product.price}</span>
                        ${product.originalPrice ? `<span class="original-price">${formatCurrency(product.originalPrice)}</span>` : ''}
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
                            data-id="${product.id}">Agregar al carrito</button>
                </div>
            </article>
        `;
        productsGrid.appendChild(productCard)
    })






    document.querySelectorAll(".add-to-cart-btn").forEach(button => {
        button.addEventListener("click", (evt) => {
            const productId = parseInt(evt.target.dataset.id)
            const productToAdd = products.find(item => item.id === productId)
            if (productId) {
                addToCart(productToAdd) //Si existe el ID se inicia la funcion addToCart
            }
        })
    })
}




// ===== CARGANDO PRODUCTOS DE JSON =====
async function fetchProductos() {
    try {
        const res = await fetch('./products.json')
        if (!res.ok) {
            throw new Error(`Error en la respuesta de la API ${res.status}`);
        }
        const data = await res.json()
        console.log("data completa: ", data)
        console.log("array de productos: ", data.products)
        products = data.products;
        displayProduct(data)

    } catch (error) {
        console.error('❌ Error inicializando la aplicación:', error);
    }
};


//INIACIANDO CARRITO
cartClose.addEventListener('click', closeCart);
cartToggle.addEventListener("click", openCart)

fetchProductos()
updateCartCount()

