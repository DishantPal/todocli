import { Migrator, FileMigrationProvider } from 'kysely';
import { db } from '../database';
import * as path from 'path';
import { promises as fs } from 'fs';

async function migrateToLatest() {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      // Fix: Point directly to the migrations directory
      migrationFolder: path.join(__dirname)
    })
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error('failed to migrate');
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

async function runMigration(command: string) {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      // Fix: Point directly to the migrations directory
      migrationFolder: path.join(__dirname)
    })
  });

  switch(command) {
    case 'latest':
      await migrateToLatest();
      break;
    case 'up':
      const upResult = await migrator.migrateUp();
      console.log(upResult);
      break;
    case 'down':
      const downResult = await migrator.migrateDown();
      console.log(downResult);
      break;
    default:
      console.log('Invalid migration command. Use latest, up, or down.');
      process.exit(1);
  }

  await db.destroy();
}

const command = process.argv[2];
runMigration(command || 'latest').catch(console.error);