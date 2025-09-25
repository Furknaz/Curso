const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('./db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { items, user } = req.body;

    if (!items || !Array.isArray(items) || !user || !user.id) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    const line_items = await Promise.all(items.map(async (item) => {
      const [rows] = await pool.query('SELECT * FROM courses WHERE id = ?', [item.id]);
      if (rows.length === 0) {
        throw new Error(`Course with id ${item.id} not found`);
      }
      const price = rows[0].price;

      return {
        price_data: {
          currency: 'brl',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(price * 100), // Price in cents
        },
        quantity: 1,
      };
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      success_url: `${req.headers.origin}/profile.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cart.html`,
      metadata: {
        userId: user.id,
        items: JSON.stringify(items.map(item => item.id)),
      }
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};