


// --------------===== KAZEOVER - JAVASCRIPT FUNCTIONALITY ====-----------------


const productsCount = document.getElementById('products-count');
const categoryFilter = document.getElementById('category-filter');
const priceFilter = document.getElementById('price-filter');
const sortFilter = document.getElementById('sort-filter');
const cartDrawer = document.getElementById('cart-drawer');
const cartToggle = document.getElementById('cart-toggle');
const cartOverlay = document.getElementById('cart-overlay');
const cartClose = document.getElementById('cart-close');
const cartBadge = document.getElementById('cart-badge');
const cartEmpty = document.getElementById('cart-empty');
const cartFooter = document.getElementById('cart-footer');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartTotal = document.getElementById('cart-total');
const cartItemCount = document.getElementById('cart-item-count');
const clearCartBtn = document.getElementById('clear-cart');
const checkoutBtn = document.getElementById('checkout');
const continueShoppingBtn = document.getElementById('continue-shopping');
const productsGrid = document.getElementById('.products-grid');
const store = null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = []



//FINALIZAR COMPRA
function checkout() {
    let cartContent = '<ul style="list-style: none; padding: 0;">';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal
        cartContent += `
       <li>
    <span>${item.name} x ${item.quantity}</span>
    <span>$ ${itemTotal.toFixed(2)}</span>
    <button data-id="${item.id}" class="remove-from-cart-btn">❌</button>
  </li>
        `;
    })
    cartContent += '</ul>'
    cartContent += `<p style="font-weight: bold; font-size: 1.2rem; text-align: right; margin-top: 20px;">Total: $${total.toFixed(
        2
    )}</p>`;

    Swal.fire({
        title: "Tu Carrito de Compras",
        html: cartContent,
        width: 600,
        showCancelButton: true,
        confirmButtonText: "Finalizar Compra",
        cancelButtonText: "Seguir Comprando",


        didOpen: () => {
            document.querySelectorAll(".remove-from-cart-btn").forEach((button) => {
                button.addEventListener("click", (event) => {
                    const keyToRemove = event.target.dataset.id; // <-- no parseInt
                    removeFromCart(keyToRemove);
                    checkout(); // re-render del modal
                });
            });
        },
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                icon: "success",
                title: "Compra realizada",
                text: `Gracias por tu compra!`,
            });
            // Limpiar el carrito
            cart = [];
            localStorage.removeItem("cart");
            renderCartItems();
        }
    });
};


function removeFromCart(target) {
    const current = JSON.parse(localStorage.getItem('cart')) || [];

    const next = current.filter(item => {
        // Si me pasan la clave exacta de línea de carrito
        if (typeof target === 'string') {
            return item.id !== target;
        }
        // Si me pasan un productId numérico, borro todas las líneas de ese producto
        if (typeof target === 'number') {
            return Number(item.product?.id) !== Number(target);
        }
        return true; // fallback (no borra nada si el tipo no coincide)
    });

    localStorage.setItem('cart', JSON.stringify(next));
    cart = next;
    updateCartCount();   // 🔢 baja el badge y el contador del drawer
    renderCartItems();   // ♻️ re-render de la lista
}




function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function renderCartItems() {

    const cartcontent = document.querySelector('#cart-content');
    cartcontent.replaceChildren();
    cartcontent.innerHTML = ''




    cart.forEach(item => {
        const cartcontentproduct = document.createElement('div');

        cartcontentproduct.className = 'cart-items';
        cartcontentproduct.innerHTML = `
      <img src="${item.image}" class="cart-item-image">
      <div class="cart-item-info">
        <h4 class="cart-item-name">${item.nombre}</h4>
        <p class="text-sm text-gray-500">Talle: ${item.size}</p>
        <p class="text-sm text-gray-500">Cantidad: ${item.quantity}</p>
        <p class="cart-item-price">$${item.price * item.quantity}</p>
      </div>
      <button class="text-red-500 hover:text-red-700" onclick="removeFromCart('${item.id}')">
        🗑️
      </button>
    `;
        cartcontent.appendChild(cartcontentproduct);
    });
}

function updateCartCount() {
    // 1) sacar el número real del carrito
    const itemCount = (typeof store?.getCartItemCount === 'function')
        ? store.getCartItemCount()
        : cart.reduce((acc, item) => acc + (item.quantity ?? 1), 0);

    // 2) escribirlo en el badge y en el contador del drawer
    cartBadge.textContent = String(itemCount);
    cartBadge.style.display = itemCount > 0 ? 'flex' : 'none'; // mostrar/ocultar
    cartItemCount.textContent = String(itemCount);

    const total = getCartTotal();
    cartSubtotal.textContent = formatCurrency(total);
    cartTotal.textContent = formatCurrency(total);
}



//Funcion si no hay nada en el carrito


//Funcion cerrar carrito
function closeCart() {
    cartDrawer.setAttribute('aria-hidden', 'true');
    cartOverlay.setAttribute('aria-hidden', 'true');
    cartToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}


//Funcion Abrir carrito de aside
function openCart() {
    if (cart.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Carrito vacio',
            text: 'No hay productos al carrito'

        })
    } else {
        cartDrawer.setAttribute('aria-hidden', 'false');
        cartOverlay.setAttribute('aria-hidden', 'false');
        cartToggle.setAttribute('aria-expanded', 'true');
        cartFooter.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
}




//Aumentar cantidad de producto en carrito
function updateQuantity(itemId, quantity) {
    store.updateQuantity(itemId, quantity);
    renderCartItems();
}

//Elimnar productos de CARRITO
function clearCart() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount(); //Actualiza contador
    renderCartItems(); //Acutaliza carrito
}





//Funcion aumentar contador de carrito
function getCartItemCount() {
    return cart.reduce((count, item) => count + item.quantity, 0);
}



//FUNCION AGREGAR PRODUCTO A CARRITO 
function addToCart(productToAdd, size = 'M', quantity = 1) {
    if (!productToAdd || !('id' in productToAdd)) { console.error('❌ Producto no encontrado:', productToAdd); return false; }

    const key = `${productToAdd.id}-${size}`;
    const existing = cart.find(i => i.id === key);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            id: key,
            product: productToAdd,
            name: productToAdd.nombre ?? productToAdd.nombre ?? '',
            price: productToAdd.price,
            size,
            quantity,
            image: productToAdd.image,
        });
    }
    localStorage.setItem("cart", JSON.stringify(cart))
    updateCartCount()
    renderCartItems()

    Toastify({
        text: `${productToAdd.nombre} agregado al carrito`,
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

//funcion q Convierte un número en un texto con formato de pesos argentinos (ARS)
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

            if (!productToAdd) return console.error('Producto no existe:', productId);
            addToCart(productToAdd) //Si existe el ID se inicia la funcion addToCart
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
        products = data.products || [];
        categories = data.categories || [];
        displayProduct(data)

    } catch (error) {
        console.error('❌ Error inicializando la aplicación:', error);
    }
};


//INIACIANDO CARRITO
cartClose.addEventListener('click', closeCart);
cartToggle.addEventListener("click", openCart)
continueShoppingBtn.addEventListener('click', closeCart);

//
clearCartBtn.addEventListener('click', clearCart); //Escuchar vaciar carrito
checkoutBtn.addEventListener('click', checkout); //

fetchProductos()
updateCartCount()