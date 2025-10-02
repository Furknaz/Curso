let stripe;

async function waitForStripe() {
    return new Promise(resolve => {
        const checkStripe = () => {
            if (window.Stripe) {
                stripe = Stripe('pk_test_51SAVZF4G62TEORgEfogL0XbHImRC9KDwB4xUGqlBpWtmvAhZml4vfWL9YgNGIUYERNCrGvlj9wQADjCVYUHn648j00ppoPHDqR');
                console.log('Stripe initialized successfully.');
                resolve();
            } else {
                console.log('Stripe.js not yet loaded, retrying...');
                setTimeout(checkStripe, 100);
            }
        };
        checkStripe();
    });
}

// Global addToCart function
window.addToCart = function(moduleId, moduleName, modulePrice) {
    console.log(`addToCart function called for: ${moduleName} (${moduleId}, R$${modulePrice})`);
    console.log('cart.js: Attempting to retrieve shoppingCart from localStorage.');
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    console.log('cart.js: Current cart state from localStorage:', cart);
    const existingItem = cart.find(item => item.id === moduleId);

    if (existingItem) {
        console.log(`cart.js: Item already in cart: ${moduleName}`);
        return;
    }

    cart.push({ id: moduleId, name: moduleName, price: parseFloat(modulePrice) });
    console.log('cart.js: Item added to cart array. Saving to localStorage.');
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    console.log('cart.js: Item added to cart. New cart in localStorage:', JSON.parse(localStorage.getItem('shoppingCart')));
    console.log('cart.js: Redirecting to cart.html.');
    window.location.href = 'cart.html';
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('cart.js: DOMContentLoaded event fired.');

    // Check if on index.html to attach add-to-cart button listeners
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        console.log('cart.js: On index.html, attaching add-to-cart listeners.');
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        console.log(`cart.js: Found ${addToCartButtons.length} 'add-to-cart-btn' buttons.`);
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                console.log('cart.js: Add to cart button clicked.');
                const moduleId = this.dataset.moduleId;
                const moduleName = this.dataset.moduleName;
                const modulePrice = this.dataset.price;
                window.addToCart(moduleId, moduleName, modulePrice);
            });
        });
    }

    // Check if on cart.html to render the cart
    if (window.location.pathname.endsWith('cart.html')) {
        console.log('cart.js: on cart.html, rendering cart');
        waitForStripe().then(() => {
            renderCartPage();
        });
    }
});

function renderCartPage() {
    console.log('cart.js: renderCartPage function called.');
    console.log('cart.js: Attempting to retrieve shoppingCart from localStorage for rendering.');
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    console.log('cart.js: Cart state for rendering:', cart);

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
        console.log('cart.js: Starting renderCart function. Cart content:', cart);
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            console.log('cart.js: Cart is empty. Displaying empty message.');
            cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
            checkoutButton.disabled = true;
        } else {
            console.log('cart.js: Cart has items. Rendering items.');
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
            console.log('cart.js: Finished rendering cart items.');
        }

        cartTotalSpan.textContent = `R$ ${total.toFixed(2)}`;
        attachRemoveListeners();
        console.log('cart.js: Cart rendering complete. Total:', total.toFixed(2));
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