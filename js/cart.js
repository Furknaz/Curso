// =================================================================================
// FUNÇÕES GLOBAIS E DE INICIALIZAÇÃO
// =================================================================================

// Variável global para a instância do Stripe, inicializada quando necessário.
let stripe;

/**
 * Ponto de entrada do script. É executado quando o DOM está totalmente carregado.
 * Direciona a execução com base na página atual.
 */
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname;

    // Se estiver na página inicial, configura os botões de "Comprar".
    if (currentPage.endsWith('/') || currentPage.endsWith('index.html')) {
        setupAddToCartButtons();
    }

    // Se estiver na página do carrinho, renderiza o carrinho.
    if (currentPage.endsWith('cart.html')) {
        renderCartPage();
    }
});


// =================================================================================
// LÓGICA DA PÁGINA INICIAL (index.html)
// =================================================================================

/**
 * Adiciona os "event listeners" a todos os botões de "Comprar" na página inicial.
 */
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

/**
 * Lida com a lógica de adicionar um item ao carrinho.
 * 1. Verifica se o usuário está logado.
 * 2. Se não, redireciona para a página de login.
 * 3. Se sim, adiciona o item ao localStorage e redireciona para o carrinho.
 */
function handleAddToCart(moduleId, moduleName, modulePrice) {
    if (!isLoggedIn()) {
        alert('Você precisa estar logado para comprar um produto.');
        window.location.href = 'login.html';
        return;
    }

    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const isAlreadyInCart = cart.some(item => item.id === moduleId);

    if (!isAlreadyInCart) {
        cart.push({
            id: moduleId,
            name: moduleName,
            price: parseFloat(modulePrice)
        });
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    }

    window.location.href = 'cart.html';
}


// =================================================================================
// LÓGICA DA PÁGINA DO CARRINHO (cart.html)
// =================================================================================

/**
 * Função principal que renderiza todo o conteúdo da página do carrinho.
 */
function renderCartPage() {
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-button');

    if (!cartItemsContainer || !cartTotalSpan || !checkoutButton) {
        console.error('Elementos essenciais do carrinho não encontrados na página.');
        return;
    }

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

/**
 * Configura os "event listeners" para os botões "Remover" e "Finalizar Compra".
 */
function setupCartActionButtons() {
    document.getElementById('cart-items').addEventListener('click', function(event) {
        if (event.target.classList.contains('remove-from-cart')) {
            const moduleId = event.target.dataset.moduleId;
            let currentCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
            currentCart = currentCart.filter(item => item.id !== moduleId);
            localStorage.setItem('shoppingCart', JSON.stringify(currentCart));
            renderCartPage();
        }
    });

    document.getElementById('checkout-button').addEventListener('click', handleCheckout);
}

/**
 * Lida com o processo de checkout, criando uma sessão no Stripe e redirecionando.
 */
async function handleCheckout() {
    const user = getLoggedInUser();
    if (!user) {
        alert('Sua sessão expirou. Por favor, faça login novamente para finalizar a compra.');
        window.location.href = 'login.html';
        return;
    }

    // Inicializa o Stripe SÓ QUANDO NECESSÁRIO
    if (!stripe) {
        try {
            // A variável 'Stripe' vem do script <script src="https://js.stripe.com/v3/"></script>
            stripe = Stripe('pk_test_51SAVZF4G62TEORgEfogL0XbHImRC9KDwB4xUGqlBpWtmvAhZml4vfWL9YgNGIUYERNCrGvlj9wQADjCVYUHn648j00ppoPHDqR');
        } catch (e) {
            console.error('Erro: O script do Stripe não foi carregado corretamente.', e);
            alert('Erro ao carregar o sistema de pagamento. Por favor, verifique sua conexão com a internet e recarregue a página.');
            return;
        }
    }

    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    if (cart.length === 0) {
        alert('Seu carrinho está vazio.');
        return;
    }

    try {
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart, user: user }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Falha ao criar a sessão de checkout.');
        }

        const { sessionId } = await response.json();
        const { error } = await stripe.redirectToCheckout({ sessionId });

        if (error) {
            console.error('Erro ao redirecionar para o Stripe:', error);
            alert('Não foi possível redirecionar para o pagamento. Tente novamente.');
        }
    } catch (err) {
        console.error('Erro no processo de checkout:', err);
        alert('Ocorreu um erro ao processar seu pedido. Tente novamente mais tarde.');
    }
}

// Funções de utilidade que dependem de `auth.js`
// É esperado que `auth.js` seja carregado antes deste script.
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

