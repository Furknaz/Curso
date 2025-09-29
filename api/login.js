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
    console.log('Attempting to log in user:', email);
    const queryText = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.query(queryText, [email]);

    if (rows.length === 0) {
      console.warn(`Login failed for email ${email}: User not found.`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      console.warn(`Login failed for email ${email}: Password mismatch.`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Don't send the password back
    delete user.password;

    console.log(`User logged in successfully:`, email);
    res.status(200).json({ user });

  } catch (error) {
    console.error('[API_LOGIN_ERROR] Failed to log in user:', email);
    console.error('[API_LOGIN_ERROR] Full error object:', JSON.stringify(error, null, 2));

    if (error.code === 'ECONNREFUSED') {
      console.error('[API_LOGIN_ERROR] Database connection was refused. This is a network or firewall issue.');
      return res.status(500).json({ 
        error: 'Database connection failed.', 
        details: 'The server could not connect to the database. Please contact support.' 
      });
    }
    
    res.status(500).json({ error: 'An internal server error occurred.', details: error.code });
  }
};