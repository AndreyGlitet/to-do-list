import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

console.log(' Проверка подключения к БД...');
console.log('URL:', process.env.SUPABASE_DB_URL ? 'Найден' : ' НЕ НАЙДЕН');

if (!process.env.SUPABASE_DB_URL) {
  console.log(' Переменная SUPABASE_DB_URL не найдена в .env');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000
});

console.log(' Пытаюсь подключиться...');

pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error(' Ошибка подключения:', err.message);
    console.error('Код ошибки:', err.code);
  } else {
    console.log(' Подключение работает! Время на сервере:', result.rows[0].now);
  }
  pool.end();
});