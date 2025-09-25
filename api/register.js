const pool = require('./db');
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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const queryText = 'INSERT INTO users(email, password) VALUES(?, ?)';
    const [result] = await pool.query(queryText, [email, hashedPassword]);

    const insertedId = result.insertId;
    const [rows] = await pool.query('SELECT id, email FROM users WHERE id = ?', [insertedId]);

    res.status(201).json({ user: rows[0] });
  } catch (error) {
    console.error('Error registering user:', error);
    if (error.code === 'ER_DUP_ENTRY') { // Unique violation for MySQL
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
