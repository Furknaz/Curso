const db = require('./db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    console.log('Attempting to register user:', email);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const queryText = 'INSERT INTO users(email, password) VALUES(?, ?)';
    const [result] = await db.query(queryText, [email, hashedPassword]);

    const insertedId = result.insertId;
    console.log(`User registered with ID: ${insertedId}`);

    const [rows] = await db.query('SELECT id, email FROM users WHERE id = ?', [insertedId]);

    res.status(201).json({ user: rows[0] });

  } catch (error) {
    console.error('[API_REGISTER_ERROR] Failed to register user:', email);
    console.error('[API_REGISTER_ERROR] Full error object:', JSON.stringify(error, null, 2));

    if (error.code === 'ECONNREFUSED') {
      console.error('[API_REGISTER_ERROR] Database connection was refused. This is a network or firewall issue.');
      return res.status(500).json({ 
        error: 'Database connection failed.', 
        details: 'The server could not connect to the database. Please contact support.' 
      });
    } 
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    
    res.status(500).json({ error: 'An internal server error occurred.', details: error.code });
  }
};