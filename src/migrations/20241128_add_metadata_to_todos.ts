// src/migrations/20241128_add_metadata_to_todos.ts
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('todos')
    .addColumn('metadata', 'json', (col) => col.defaultTo(sql`NULL`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('todos')
    .dropColumn('metadata')
    .execute();
}