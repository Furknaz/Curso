const pool = require('./db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const queryText = `
      SELECT c.id, c.title, c.price
      FROM courses c
      JOIN user_courses uc ON c.id = uc.course_id
      WHERE uc.user_id = $1;
    `;
    const { rows } = await pool.query(queryText, [userId]);
    res.status(200).json({ courses: rows });
  } catch (error) {
    console.error('Error getting user courses:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
