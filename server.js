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

// Define o Content Security Policy
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

// --- ROTAS ---

// 1. Rotas da API (devem vir primeiro)
app.post('/api/login', (req, res) => loginHandler(req, res));
app.post('/api/register', (req, res) => registerHandler(req, res));
app.get('/api/get-user-courses', (req, res) => getUserCoursesHandler(req, res));
app.post('/api/create-checkout-session', (req, res) => createCheckoutSessionHandler(req, res));
app.post('/api/verify-payment', (req, res) => verifyPaymentHandler(req, res));

// 2. Servir arquivos estáticos (CSS, JS, imagens, etc.)
// Isso vai servir automaticamente arquivos como index.html, cart.html, etc.
app.use(express.static(path.join(__dirname)));

// 3. Rota "catch-all" para Single Page Applications (SPA)
// Qualquer requisição GET que não seja para a API e não encontrou um arquivo estático,
// receberá o index.html. Isso permite que o roteamento do lado do cliente funcione.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// --- INICIALIZAÇÃO DO SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});