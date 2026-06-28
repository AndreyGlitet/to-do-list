import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

const pool = new pg.Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

// ПРОВЕРКА ПОДКЛЮЧЕНИЯ ПРЯМО СЕЙЧАС
pool.connect((err, client, release) => {
  if (err) {
    console.error(' ОШИБКА ПОДКЛЮЧЕНИЯ К БД:', err.message);
  } else {
    console.log(' БД ПОДКЛЮЧЕНА!');
    release();
  }
});

// 1. ИЗМЕНЕНО: Сортировка сначала по важности (DESC — true выше false), затем по id
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY is_important DESC, id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error(' Ошибка GET /api/tasks:', error.message);
    res.status(500).json({ error: 'Ошибка при получении задач: ' + error.message });
  }
});

// 2. ИЗМЕНЕНО: Добавлено поле is_important при создании (по умолчанию false, если не передано)
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, is_important } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    
    const importance = is_important || false;
    
    const result = await pool.query(
      'INSERT INTO tasks (title, is_important) VALUES ($1, $2) RETURNING *',
      [title, importance]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(' Ошибка POST /api/tasks:', error.message);
    res.status(500).json({ error: 'Ошибка при добавлении задачи: ' + error.message });
  }
});

// 3. ИЗМЕНЕНО: Обновление динамически принимает и completed, и is_important
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed, is_important } = req.body;
    
    // Получаем текущие данные задачи, чтобы не затереть их, если пришло только одно поле
    const currentTask = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (currentTask.rows.length === 0) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    const updatedCompleted = completed !== undefined ? completed : currentTask.rows[0].completed;
    const updatedImportant = is_important !== undefined ? is_important : currentTask.rows[0].is_important;
    
    const result = await pool.query(
      'UPDATE tasks SET completed = $1, is_important = $2 WHERE id = $3 RETURNING *',
      [updatedCompleted, updatedImportant, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(' Ошибка PUT /api/tasks:', error.message);
    res.status(500).json({ error: 'Ошибка обновления задачи: ' + error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }
    
    res.json({ message: 'Задача удалена' });
  } catch (error) {
    console.error(' Ошибка DELETE /api/tasks:', error.message);
    res.status(500).json({ error: 'Ошибка удаления задачи: ' + error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(` Сервер запущен на порту ${PORT}`);
  console.log(` Открой: http://localhost:${PORT}`);
});

