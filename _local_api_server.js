
// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const createCheckoutSession = require('./api/create-checkout-session.js');

const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors());

// Use express.json middleware to parse JSON bodies
app.use(express.json());

// Define the API route
app.post('/api/create-checkout-session', createCheckoutSession);

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
  console.log('Make sure your .env file has the STRIPE_SECRET_KEY set.');
});
