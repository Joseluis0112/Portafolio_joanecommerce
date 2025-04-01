document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const productList = document.getElementById('product-list');
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const searchInput = document.getElementById('search-input');
    const quantityModal = new bootstrap.Modal(document.getElementById('quantityModal'));
    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    
    let products = [];
    let cart = [];

    // Cargar productos desde la FakeStore API
    fetch('https://fakestoreapi.com/products')
        .then(response => response.json())
        .then(data => {
            products = data;
            displayProducts(products);
        })
        .catch(error => console.error('Error al cargar productos:', error));

    // Mostrar productos en la interfaz
    function displayProducts(products) {
        productList.innerHTML = '';
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'col-md-4 col-sm-6 mb-4';
            card.innerHTML = `
                <div class="card">
                    <img src="${product.image}" class="card-img-top" alt="${product.title}">
                    <div class="card-body">
                        <h5 class="card-title">${product.title}</h5>
                        <p class="card-text">${product.price.toFixed(2)} €</p>
                        <button class="btn btn-primary add-to-cart" data-id="${product.id}">
                            <i class="fas fa-cart-plus"></i> Añadir al carrito
                        </button>
                    </div>
                </div>
            `;
            productList.appendChild(card);
        });

        // Añadir eventos a los botones
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.getAttribute('data-id');
                showQuantityModal(productId);
            });
        });
    }

    // Mostrar modal de cantidad
    function showQuantityModal(productId) {
        document.getElementById('add-to-cart-btn').onclick = () => {
            const quantity = parseInt(document.getElementById('quantity-input').value);
            if (quantity > 0) {
                addToCart(productId, quantity);
                quantityModal.hide();
            }
        };
        quantityModal.show();
    }

    // Añadir producto al carrito
    function addToCart(productId, quantity) {
        const product = products.find(p => p.id == productId);
        const cartItem = cart.find(item => item.product.id == productId);
        if (cartItem) {
            cartItem.quantity += quantity;
        } else {
            cart.push({ product, quantity });
        }
        updateCart();
    }

    // Actualizar el carrito
    function updateCart() {
        cartItems.innerHTML = '';
        let total = 0;
        cart.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.product.title}</td>
                <td>${item.quantity}</td>
                <td>${item.product.price.toFixed(2)} €</td>
                <td>${(item.product.price * item.quantity).toFixed(2)} €</td>
            `;
            cartItems.appendChild(row);
            total += item.product.price * item.quantity;
        });
        cartTotal.textContent = total.toFixed(2);
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    // Búsqueda dinámica
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredProducts = products.filter(product =>
            product.title.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
        displayProducts(filteredProducts);
    });

    // Mostrar modal del carrito
    document.querySelector('a[href="#carrito"]').addEventListener('click', (e) => {
        e.preventDefault();
        cartModal.show();
    });

    // Mostrar modal de pago
    document.getElementById('checkout-btn').addEventListener('click', () => {
        if (cart.length === 0) {
            alert('El carrito está vacío.');
            return;
        }
        cartModal.hide();
        paymentModal.show();
    });

    // Generar factura en PDF
    document.getElementById('pay-btn').addEventListener('click', () => {
        const name = document.getElementById('name').value;
        const cardNumber = document.getElementById('card-number').value;
        if (!name || !cardNumber) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Factura de Compra', 10, 10);
        doc.setFontSize(12);
        doc.text(`Cliente: ${name}`, 10, 20);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 10, 30);

        cart.forEach((item, index) => {
            doc.text(`${index + 1}. ${item.product.title} - Cantidad: ${item.quantity} - Total: ${(item.product.price * item.quantity).toFixed(2)} €`, 10, 40 + index * 10);
        });
        doc.text(`Total: ${cartTotal.textContent} €`, 10, 40 + cart.length * 10);
        doc.save('factura.pdf');

        paymentModal.hide();
        cart = [];
        updateCart();
        alert('¡Compra realizada con éxito! La factura ha sido descargada.');
    });
});