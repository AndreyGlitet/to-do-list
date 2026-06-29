import express from 'express';
import cors from 'cors';
import path from 'url';
import { fileURLToPath } from 'url';
import pathModule from 'path';
import taskRoutes from './routes/taskRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathModule.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(pathModule.join(__dirname, '..', 'frontend')));

app.use('/api/tasks', taskRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(` Сервер запущен на порту ${PORT}`);
  console.log(` Открой: http://localhost:${PORT}`);
});
