const express = require('express');
const cors = require('cors');
const path = require('path');

// 1. Importação das rotas da API
const loginHandler = require('./api/login');
const registerHandler = require('./api/register');
const getUserCoursesHandler = require('./api/get-user-courses');
const createCheckoutSessionHandler = require('./api/create-checkout-session');
const verifyPaymentHandler = require('./api/verify-payment');

const app = express();

// 2. Middlewares essenciais
app.use(cors());
app.use(express.json());

// 3. Definição da Política de Segurança de Conteúdo (CSP)
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

// 4. Definição das rotas específicas da API
app.post('/api/login', loginHandler);
app.post('/api/register', registerHandler);
app.get('/api/get-user-courses', getUserCoursesHandler);
app.post('/api/create-checkout-session', createCheckoutSessionHandler);
app.post('/api/verify-payment', verifyPaymentHandler);

// 5. Servir os arquivos estáticos (HTML, CSS, JS do cliente, imagens)
app.use(express.static(path.join(__dirname)));

// 6. Rota de Fallback (Catch-all) com Expressão Regular
//    Esta sintaxe é mais explícita e resolve o erro "PathError".
//    Ela garante que qualquer rota GET não capturada acima sirva o app principal.
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// 7. Inicialização do Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});