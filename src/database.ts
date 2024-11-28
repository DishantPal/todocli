import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define the database interface
export interface Database {
  todos: {
    id: number;
    task: string;
    completed: boolean;
    created_at: Date;
  }
}

// Create the database connection
export const db = new Kysely<Database>({
  dialect: new MysqlDialect({
    pool: createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'todo_app',
      port: parseInt(process.env.DB_PORT || '3306')
    })
  })
});