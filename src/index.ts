import { program } from 'commander';

// Define the Todo interface
interface Todo {
  id: number;
  task: string;
  completed: boolean;
}

// Initialize todos array
let todos: Todo[] = [];

// Add a new todo
program
  .command('add <task>')
  .description('Add a new todo')
  .action((task) => {
    const newTodo: Todo = {
      id: todos.length + 1,
      task,
      completed: false
    };
    todos.push(newTodo);
    console.log(`Added todo: ${task}`);
  });

// List all todos
program
  .command('list')
  .description('List all todos')
  .action(() => {
    if (todos.length === 0) {
      console.log('No todos found.');
      return;
    }
    todos.forEach(todo => {
      console.log(`[${todo.completed ? 'X' : ' '}] ${todo.id}: ${todo.task}`);
    });
  });

// Mark todo as complete
program
  .command('complete <id>')
  .description('Mark a todo as complete')
  .action((idStr) => {
    const id = parseInt(idStr);
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.completed = true;
      console.log(`Marked todo ${id} as complete`);
    } else {
      console.log(`Todo with id ${id} not found`);
    }
  });

// Parse the command line arguments
program.parse(process.argv);