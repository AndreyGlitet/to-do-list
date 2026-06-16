const API_URL = 'http://localhost:3000/api/tasks';
const todoList = document.getElementById('todo-list');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');

async function fetchTasks() {
  try {
    const response = await fetch(API_URL);
    const tasks = await response.json();
    renderTasks(tasks);
  } catch (error) {
    console.error('Ошибка:', error);
    todoList.innerHTML = '<p style="color: red;">Ошибка подключения к бэкенду</p>';
  }
}

// 2. Отправка новой задачи на бэкенд
async function addTask(event) {
  event.preventDefault(); 

  const title = taskInput.value.trim();
  if (!title) return;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title })
    });

    if (response.ok) {
      taskInput.value = ''; 
      await fetchTasks();   
    }
  } catch (error) {
    console.error('Ошибка добавления задачи:', error);
    alert('Не удалось добавить задачу');
  }
}


function renderTasks(tasks) {
  todoList.innerHTML = '';

  if (tasks.length === 0) {
    todoList.innerHTML = '<p>Задач пока нет</p>';
    return;
  }

  tasks.forEach(task => {
    const taskEl = document.createElement('div');
    taskEl.className = 'task-item';
    
    taskEl.innerHTML = `
      <span class="${task.completed ? 'completed' : ''}">${task.title}</span>
      <input type="checkbox" ${task.completed ? 'checked' : ''} disabled>
    `;
    
    todoList.appendChild(taskEl);
  });
}


taskForm.addEventListener('submit', addTask);

fetchTasks();
