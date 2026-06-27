const API_URL = 'http://localhost:3000/api/tasks';
const todoList = document.getElementById('todo-list');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');

async function fetchTasks() {
  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const tasks = await response.json();
    
    if (!Array.isArray(tasks)) {
      console.error('Ответ не является массивом:', tasks);
      todoList.innerHTML = '<p class="loading" style="color: #ff7c7c;">Ошибка: сервер вернул некорректные данные</p>';
      return;
    }
    
    renderTasks(tasks);
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    todoList.innerHTML = '<p class="loading" style="color: #ff7c7c;">❌ Ошибка подключения к бэкенду</p>';
  }
}

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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    taskInput.value = '';
    await fetchTasks();
  } catch (error) {
    console.error('Ошибка добавления задачи:', error);
    alert('❌ Не удалось добавить задачу');
  }
}

async function toggleTask(id, currentStatus) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ completed: !currentStatus })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    await fetchTasks();
  } catch (error) {
    console.error('Ошибка обновления:', error);
    alert('❌ Не удалось обновить статус');
  }
}

async function deleteTask(id) {
  if (!confirm('🗑 Удалить задачу?')) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    await fetchTasks();
  } catch (error) {
    console.error('Ошибка удаления:', error);
    alert('❌ Не удалось удалить задачу');
  }
}

function renderTasks(tasks) {
  todoList.innerHTML = '';

  if (!tasks || tasks.length === 0) {
    todoList.innerHTML = `
      <div class="empty-message">
        <span class="icon">📋</span>
        <span>Задач пока нет</span>
      </div>
    `;
    return;
  }

  tasks.forEach(task => {
    const taskEl = document.createElement('div');
    taskEl.className = 'task-item';

    const titleSpan = document.createElement('span');
    titleSpan.className = `task-title ${task.completed ? 'completed' : ''}`;
    titleSpan.textContent = task.title;

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = `btn-toggle ${task.completed ? 'done' : ''}`;
    toggleBtn.textContent = task.completed ? '✅ Готово' : '⬜ В процессе';
    toggleBtn.addEventListener('click', () => toggleTask(task.id, task.completed));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = '🗑 Удалить';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    actionsDiv.appendChild(toggleBtn);
    actionsDiv.appendChild(deleteBtn);

    taskEl.appendChild(titleSpan);
    taskEl.appendChild(actionsDiv);
    todoList.appendChild(taskEl);
  });
}

taskForm.addEventListener('submit', addTask);

fetchTasks();