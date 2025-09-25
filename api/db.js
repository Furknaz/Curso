const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuração explícita da conexão com o banco de dados
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

const createTables = async () => {
  const usersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const coursesTableQuery = `
    CREATE TABLE IF NOT EXISTS courses (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2) NOT NULL
    );
  `;

  const userCoursesTableQuery = `
    CREATE TABLE IF NOT EXISTS user_courses (
      user_id INT,
      course_id VARCHAR(255),
      PRIMARY KEY (user_id, course_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );
  `;

  let connection;
  try {
    connection = await pool.getConnection();
    console.log("Conexão com o banco de dados bem-sucedida!");
    await connection.query(usersTableQuery);
    console.log('Tabela de usuários pronta.');

    await connection.query(coursesTableQuery);
    console.log('Tabela de cursos pronta.');

    await connection.query(userCoursesTableQuery);
    console.log('Tabela user_courses pronta.');
  } catch (err) {
    console.error('Erro ao criar tabelas:', err);
  } finally {
    if (connection) connection.release();
  }
};

const populateCourses = async () => {
    const courses = [
        { id: 'modulo1', title: 'Módulo 1: Contornar Objeções', price: 49.90 },
        { id: 'modulo2', title: 'Módulo 2: Técnica de Vendas', price: 59.90 },
        { id: 'modulo3', title: 'Módulo 3: Técnicas de Persuasão', price: 49.90 },
        { id: 'modulo4', title: 'Módulo 4: Produtos', price: 69.90 },
        { id: 'modulo5', title: 'Módulo 5: Mapeamento de Metas', price: 39.90 },
        { id: 'modulo6', title: 'Módulo 6: Digitação Banco e Ecorban', price: 79.90 },
        { id: 'modulo7', title: 'Módulo 7: Acompanhamento de Esteira', price: 89.90 },
    ];

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        for (const course of courses) {
            const { id, title, price } = course;
            await connection.query(
                'INSERT INTO courses (id, title, price) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE title = ?, price = ?',
                [id, title, price, title, price]
            );
        }
        await connection.commit();
        console.log('Tabela de cursos populada/atualizada.');
    } catch (err) {
        await connection.rollback();
        console.error('Erro ao popular a tabela de cursos:', err);
    } finally {
        if (connection) connection.release();
    }
};

const initializeDatabase = async () => {
    await createTables();
    await populateCourses();
};

// Verifica se o script está sendo executado diretamente
if (require.main === module) {
  initializeDatabase().then(() => {
    console.log('Inicialização do banco de dados completa.');
    pool.end();
  });
}

module.exports = pool;
