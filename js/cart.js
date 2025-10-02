// =================================================================================
// INICIALIZAÇÃO E LÓGICA PRINCIPAL
// =================================================================================

// Variável global para a instância do Stripe.
let stripe;

// Ponto de entrada do script: Roda quando o HTML da página está pronto.
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname;

    // Lógica para a página inicial
    if (currentPage.endsWith('/') || currentPage.endsWith('index.html')) {
        setupAddToCartButtons();
    }

    // Lógica para a página do carrinho
    if (currentPage.endsWith('cart.html')) {
        // Verifica se o script do Stripe foi carregado antes de continuar
        if (typeof Stripe === 'undefined') {
            handleStripeLoadingError();
        } else {
            // Se o Stripe carregou, inicializa e renderiza o carrinho
            initializeStripe();
            renderCartPage();
        }
    }
});

function handleStripeLoadingError() {
    console.error("ERRO CRÍTICO: O script do Stripe (js.stripe.com) não foi carregado. Verifique a conexão com a internet e as políticas de segurança (CSP) no arquivo server.js.");
    const cartItemsContainer = document.getElementById('cart-items');
    const checkoutButton = document.getElementById('checkout-button');
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '<p style="color: red; font-weight: bold;">Não foi possível carregar o sistema de pagamento. Verifique sua conexão e recarregue a página.</p>';
    }
    if (checkoutButton) {
        checkoutButton.disabled = true;
        checkoutButton.textContent = 'Pagamento Indisponível';
    }
}

function initializeStripe() {
    if (!stripe) {
        try {
            stripe = Stripe('pk_test_51SAVZF4G62TEORgEfogL0XbHImRC9KDwB4xUGqlBpWtmvAhZml4vfWL9YgNGIUYERNCrGvlj9wQADjCVYUHn648j00ppoPHDqR');
        } catch (e) {
            handleStripeLoadingError();
        }
    }
}


// =================================================================================
// FUNÇÕES DA PÁGINA INICIAL (index.html)
// =================================================================================

function setupAddToCartButtons() {
    document.body.addEventListener('click', function(event) {
        const buyButton = event.target.closest('.add-to-cart-btn');
        if (buyButton) {
            const card = buyButton.closest('.streaming-card');
            if (card) {
                const moduleId = card.dataset.moduleId;
                const moduleName = card.querySelector('.card-title').textContent;
                const modulePrice = card.dataset.price;
                
                handleAddToCart(moduleId, moduleName, modulePrice);
            }
        }
    });
}

function handleAddToCart(moduleId, moduleName, modulePrice) {
    if (!isLoggedIn()) {
        alert('Você precisa estar logado para comprar um produto.');
        window.location.href = 'login.html';
        return;
    }
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    if (!cart.some(item => item.id === moduleId)) {
        cart.push({ id: moduleId, name: moduleName, price: parseFloat(modulePrice) });
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    }
    window.location.href = 'cart.html';
}


// =================================================================================
// FUNÇÕES DA PÁGINA DO CARRINHO (cart.html)
// =================================================================================

function renderCartPage() {
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-button');

    if (!cartItemsContainer || !cartTotalSpan || !checkoutButton) return;

    cartItemsContainer.innerHTML = '';
    let currentTotal = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
        checkoutButton.disabled = true;
    } else {
        cart.forEach(item => {
            currentTotal += item.price;
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-price">R$ ${item.price.toFixed(2)}</span>
                <button class="remove-from-cart" data-module-id="${item.id}">Remover</button>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
        checkoutButton.disabled = false;
    }

    cartTotalSpan.textContent = `R$ ${currentTotal.toFixed(2)}`;
    setupCartActionButtons();
}

function setupCartActionButtons() {
    document.getElementById('cart-items').addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-from-cart')) {
            const moduleId = event.target.dataset.moduleId;
            let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
            cart = cart.filter(item => item.id !== moduleId);
            localStorage.setItem('shoppingCart', JSON.stringify(cart));
            renderCartPage();
        }
    });

    document.getElementById('checkout-button').addEventListener('click', handleCheckout);
}

async function handleCheckout() {
    if (!stripe) {
        alert('O sistema de pagamento não está pronto. Por favor, recarregue a página.');
        return;
    }
    const user = getLoggedInUser();
    if (!user) {
        alert('Sua sessão expirou. Faça login para finalizar a compra.');
        window.location.href = 'login.html';
        return;
    }
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    if (cart.length === 0) return;

    try {
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart, user: user }),
        });
        if (!response.ok) throw new Error('Falha ao criar sessão de checkout.');
        
        const { sessionId } = await response.json();
        const { error } = await stripe.redirectToCheckout({ sessionId });
        
        if (error) throw error;
    } catch (err) {
        console.error('Erro no Checkout:', err);
        alert('Ocorreu um erro ao processar seu pagamento. Tente novamente.');
    }
}

// =================================================================================
// FUNÇÕES AUXILIARES DE AUTENTICAÇÃO (devem corresponder ao auth.js)
// =================================================================================

function isLoggedIn() {
  return !!localStorage.getItem('loggedInUser');
}

function getLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem('loggedInUser'));
  } catch (e) {
    return null;
  }
}