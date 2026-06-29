import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = new pg.Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});


pool.connect((err, client, release) => {
  if (err) {
    console.error(' ОШИБКА ПОДКЛЮЧЕНИЯ К БД:', err.message);
  } else {
    console.log(' БД ПОДКЛЮЧЕНА!');
    release();
  }
});

export default pool;
