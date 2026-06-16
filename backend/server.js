import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let tasks = [
  { id: 1, title: 'Изучить требования к практике', completed: true },
  { id: 2, title: 'Настроить структуру проекта', completed: true },
  { id: 3, title: 'Написать базовый бэкенд', completed: false }
];

app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.listen(PORT, () => {
  console.log(`Сервер успешно запущен на http://localhost:${PORT}`);
});
