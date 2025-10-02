document.addEventListener('DOMContentLoaded', function() {
    console.log('cart.js: DOMContentLoaded');

    // Replace with your Stripe publishable key
    const stripe = Stripe('pk_test_51SAVZF4G62TEORgEfogL0XbHImRC9KDwB4xUGqlBpWtmvAhZml4vfWL9YgNGIUYERNCrGvlj9wQADjCVYUHn648j00ppoPHDqR');

    // Global addToCart function
    window.addToCart = function(moduleId, moduleName, modulePrice) {
        console.log('cart.js: window.addToCart called');
        console.log(`addToCart function called for: ${moduleName} (${moduleId}, R$${modulePrice})`);
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        const existingItem = cart.find(item => item.id === moduleId);

        if (existingItem) {
            console.log(`cart.js: Item already in cart: ${moduleName}`);
            return;
        }

        cart.push({ id: moduleId, name: moduleName, price: parseFloat(modulePrice) });
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        console.log('cart.js: Item added to cart. New cart:', cart);
        window.location.href = 'cart.html';
    };

    // Add to cart button event listener
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const moduleId = this.dataset.moduleId;
            const moduleName = this.dataset.moduleName;
            const modulePrice = this.dataset.price;
            window.addToCart(moduleId, moduleName, modulePrice);
        });
    });

    // The rest of the script is for the cart.html page
    if (window.location.pathname.endsWith('cart.html')) {
        console.log('cart.js: on cart.html, rendering cart');
        renderCartPage();
    }
});

function renderCartPage() {
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    console.log('cart.js: Initial cart state:', cart);

    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-button');

    if (!cartItemsContainer || !cartTotalSpan || !checkoutButton) {
        console.error('Error: One or more cart elements not found on cart.html.');
        return;
    }

    function saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        console.log('cart.js: Cart saved. Current cart:', cart);
        renderCart();
    }

    function renderCart() {
        console.log('cart.js: Rendering cart. Cart content:', cart);
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
            checkoutButton.disabled = true;
        } else {
            cart.forEach(item => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                cartItemDiv.innerHTML = `
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">R$ ${item.price.toFixed(2)}</span>
                    <button class="remove-from-cart" data-module-id="${item.id}">Remover</button>
                `;
                cartItemsContainer.appendChild(cartItemDiv);
                total += item.price;
            });
            checkoutButton.disabled = false;
        }

        cartTotalSpan.textContent = `R$ ${total.toFixed(2)}`;
        attachRemoveListeners();
    }

    function attachRemoveListeners() {
        document.querySelectorAll('.remove-from-cart').forEach(button => {
            button.addEventListener('click', function() {
                const moduleId = this.dataset.moduleId;
                removeFromCart(moduleId);
            });
        });
    }

    function removeFromCart(moduleId) {
        console.log('cart.js: Removing item:', moduleId);
        cart = cart.filter(item => item.id !== moduleId);
        saveCart();
    }

    checkoutButton.onclick = async function() {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (!loggedInUser) {
            alert('Você precisa estar logado para finalizar a compra.');
            window.location.href = 'login.html';
            return;
        }

        // Replace with your Stripe publishable key


        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items: cart, user: JSON.parse(loggedInUser) }),
            });

            const { sessionId } = await response.json();

            const { error } = await stripe.redirectToCheckout({
                sessionId: sessionId,
            });

            if (error) {
                console.error('Error redirecting to checkout:', error);
                alert('Ocorreu um erro ao redirecionar para o pagamento.');
            }
        } catch (error) {
            console.error('Error during checkout:', error);
            alert('Ocorreu um erro ao finalizar a compra.');
        }
    };

    renderCart(); // Initial render when the page loads
}
