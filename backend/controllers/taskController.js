import pool from '../config/db.js';

export const getTasks = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY is_important DESC, id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error(' Ошибка GET /api/tasks:', error.message);
    res.status(500).json({ error: 'Ошибка при получении задач: ' + error.message });
  }
};


export const createTask = async (req, res) => { 
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
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { completed, is_important } = req.body;
    
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
};
