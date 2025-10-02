const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('./db');

module.exports = async (req, res) => {
  // Garante que a requisição seja do tipo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { session_id } = req.body;

  // Valida se o ID da sessão foi enviado
  if (!session_id) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  try {
    // 1. Recupera a sessão de checkout do Stripe para verificar o status
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // 2. Verifica se o pagamento foi de fato concluído
    if (session.payment_status === 'paid') {
      const userId = session.metadata.userId;
      const courseIds = JSON.parse(session.metadata.items); // IDs dos cursos comprados

      // 3. Itera sobre cada curso comprado e o insere no banco de dados
      for (const courseId of courseIds) {
        // Usa 'INSERT IGNORE' (sintaxe do MySQL) para evitar erros se o registro já existir
        const queryText = 'INSERT IGNORE INTO user_courses (user_id, course_id) VALUES (?, ?)';
        await db.query(queryText, [userId, courseId]);
      }

      console.log(`Cursos liberados para o usuário ${userId}:`, courseIds);
      
      // 4. Retorna uma mensagem de sucesso para o front-end
      return res.status(200).json({ message: 'Pagamento verificado e cursos liberados com sucesso!' });
    } else {
      // Se o pagamento não foi concluído, retorna um erro
      return res.status(400).json({ error: 'Pagamento não foi bem-sucedido.' });
    }
  } catch (error) {
    console.error('Erro ao verificar o pagamento e liberar cursos:', error);
    return res.status(500).json({ error: 'Erro interno do servidor ao liberar os cursos.' });
  }
};

