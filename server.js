const express = require('express');
const cors = require('cors');
const path = require('path');

// Importa as rotas da API
const loginHandler = require('./api/login');
const registerHandler = require('./api/register');
const getUserCoursesHandler = require('./api/get-user-courses');
const createCheckoutSessionHandler = require('./api/create-checkout-session');
const verifyPaymentHandler = require('./api/verify-payment');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Define o Content Security Policy (CSP)
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://js.stripe.com; " +
    "frame-src 'self' https://js.stripe.com; " +
    "connect-src 'self' https://api.stripe.com https://*.google-analytics.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data:;"
  );
  next();
});

// --- ESTRUTURA DE ROTAS ---

// 1. Rotas da API: O servidor verifica estas primeiro.
app.post('/api/login', loginHandler);
app.post('/api/register', registerHandler);
app.get('/api/get-user-courses', getUserCoursesHandler);
app.post('/api/create-checkout-session', createCheckoutSessionHandler);
app.post('/api/verify-payment', verifyPaymentHandler);

// 2. Servir Arquivos Estáticos: Se não for uma rota da API, o servidor procura por um arquivo correspondente (css, js, html).
app.use(express.static(path.join(__dirname)));

// 3. Rota de Fallback (Catch-all): Se a requisição não corresponder a nenhuma rota da API ou arquivo estático,
// ela será direcionada para o index.html. Isso é essencial para que a navegação interna (SPA) funcione.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// --- INICIALIZAÇÃO DO SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});