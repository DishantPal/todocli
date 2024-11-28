import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('todos')
    .addColumn('id', 'integer', (col) => 
      col.primaryKey().autoIncrement()  // Fixed: primaryKey() is a method call
    )
    .addColumn('task', 'varchar(255)', (col) => col.notNull())
    .addColumn('completed', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('todos').execute();
}