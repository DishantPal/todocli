import { program } from 'commander';
import { db } from './database';
import { DB } from './db';
import dotenv from 'dotenv';

dotenv.config();

// Parse metadata string into object
function parseMetadata(metadataStr: string): Record<string, string> {
  if (!metadataStr) return {};

  return metadataStr.split(',').reduce((acc, pair) => {
    const [key, value] = pair.trim().split(':');
    if (key && value) {
      acc[key.trim()] = value.trim();
    }
    return acc;
  }, {} as Record<string, string>);
}

// Format metadata for display
function formatMetadata(metadata: Record<string, unknown> | null): string {
  if (!metadata) return '';
  return Object.entries(metadata)
    .map(([key, value]) => `  ${key}: ${value}`)
    .join('\n');
}

// Define Todo type to avoid repetition
type TodoWithMetadata = {
  id: number;
  task: string;
  completed: boolean;
  created_at: Date;
  metadata?: Record<string, unknown> | null;
};

// Add version and description
program
  .version('1.0.0')
  .description('A CLI todo application with metadata support');

// Add a new todo
program
  .command('add <task>')
  .description('Add a new todo')
  .option('-m, --metadata <metadata>', 'Metadata as key:value pairs (comma-separated)')
  .action(async (task, options) => {
    try {
      const metadataStr = options.metadata;
      const metadata = parseMetadata(metadataStr || '');
      
      // Convert metadata to JSON string for storage
      const metadataJSON = Object.keys(metadata).length > 0 
        ? JSON.stringify(metadata)
        : null;

      const insertData = {
        task,
        completed: false,
        metadata: metadataJSON
      };

      const result = await db
        .insertInto('todos')
        .values(insertData)
        .executeTakeFirst();

      console.log(`Added todo: ${task}`);
      if (Object.keys(metadata).length > 0) {
        console.log('Metadata:');
        console.log(formatMetadata(metadata));
      }
      process.exit(0);
    } catch (error) {
      console.error('Error adding todo:', error);
      process.exit(1);
    }
  });

// List all todos
program
  .command('list')
  .description('List all todos')
  .action(async () => {
    try {
      const todos = await db
        .selectFrom('todos')
        .selectAll()
        .execute() as TodoWithMetadata[];

      if (todos.length === 0) {
        console.log('No todos found.');
        process.exit(0);
      }

      todos.forEach(todo => {
        console.log(`\nTODO #${todo.id}: ${todo.task}`);
        console.log(`Status: ${todo.completed ? 'Completed' : 'Pending'}`);
        if (todo.metadata) {
          console.log('Metadata:');
          console.log(formatMetadata(todo.metadata));
        }
        console.log('-'.repeat(40));
      });
      process.exit(0);
    } catch (error) {
      console.error('Error listing todos:', error);
      process.exit(1);
    }
  });

// Show a specific todo
program
  .command('show <id>')
  .description('Show details of a specific todo')
  .action(async (id) => {
    try {
      const todo = await db
        .selectFrom('todos')
        .selectAll()
        .where('id', '=', parseInt(id))
        .executeTakeFirst() as TodoWithMetadata;

      if (!todo) {
        console.log(`Todo with id ${id} not found`);
        process.exit(1);
      }

      // Print todo details
      console.log('\nTodo Details:');
      console.log('='.repeat(40));
      console.log(`ID: ${todo.id}`);
      console.log(`Task: ${todo.task}`);
      console.log(`Status: ${todo.completed ? 'Completed' : 'Pending'}`);
      console.log(`Created At: ${todo.created_at.toLocaleString()}`);

      // Print metadata in table format if exists
      if (todo.metadata && Object.keys(todo.metadata).length > 0) {
        console.log('\nMetadata:');
        console.log('-'.repeat(40));
        console.log('Key'.padEnd(20) + '| Value');
        console.log('-'.repeat(40));
        Object.entries(todo.metadata).forEach(([key, value]) => {
          console.log(`${key.padEnd(20)}| ${value}`);
        });
      } else {
        console.log('\nNo metadata available');
      }
      console.log('='.repeat(40));
      process.exit(0);
    } catch (error) {
      console.error('Error showing todo:', error);
      process.exit(1);
    }
  });

// Mark todo as complete
program
  .command('complete <id>')
  .description('Mark a todo as complete')
  .action(async (id) => {
    try {
      const result = await db
        .updateTable('todos')
        .set({
          completed: 1
        })
        .where('id', '=', parseInt(id))
        .executeTakeFirst();

      if ((result as any).numUpdatedRows > 0) {
        console.log(`Marked todo ${id} as complete`);
        process.exit(0);
      } else {
        console.log(`Todo with id ${id} not found`);
        process.exit(1);
      }
    } catch (error) {
      console.error('Error completing todo:', error);
      process.exit(1);
    }
  });

// Delete a todo
program
  .command('delete <id>')
  .description('Delete a todo')
  .action(async (id) => {
    try {
      const result = await db
        .deleteFrom('todos')
        .where('id', '=', parseInt(id))
        .executeTakeFirst();

      if ((result as any).numDeletedRows > 0) {
        console.log(`Deleted todo ${id}`);
        process.exit(0);
      } else {
        console.log(`Todo with id ${id} not found`);
        process.exit(1);
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      process.exit(1);
    }
  });

// Add help examples
program.addHelpText('after', `
Examples:
  $ todo add "Buy groceries" -m "priority:high,due:tomorrow"
  $ todo list
  $ todo show 1
  $ todo complete 1
  $ todo delete 1
`);

// Parse the command line arguments
program.parse(process.argv);

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}