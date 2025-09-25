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
    "default-src 'self'; font-src 'self' https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' 'unsafe-inline' blob:; img-src 'self' data:;"
  );
  next();
});

app.use(express.static(path.join(__dirname))); // Serve arquivos estáticos da raiz

// Rotas da API
app.post('/api/login', (req, res) => loginHandler(req, res));
app.post('/api/register', (req, res) => registerHandler(req, res));
app.get('/api/get-user-courses', (req, res) => getUserCoursesHandler(req, res));
app.post('/api/create-checkout-session', (req, res) => createCheckoutSessionHandler(req, res));
app.get('/api/verify-payment', (req, res) => verifyPaymentHandler(req, res));

// Rota para servir o index.html na raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
