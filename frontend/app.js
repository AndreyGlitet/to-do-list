const API_URL = '/api/tasks';
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
    todoList.innerHTML = '<p class="loading" style="color: #ff7c7c;">Ошибка подключения к бэкенду</p>';
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
      body: JSON.stringify({ title, is_important: false })
    });

    if (response.ok) {
      taskInput.value = '';
      await fetchTasks();
    } else {
      alert('Не удалось добавить задачу');
    }
  } catch (error) {
    console.error('Ошибка добавления задачи:', error);
    alert('Не удалось добавить задачу');
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

    if (response.ok) {
      await fetchTasks();
    } else {
      alert('Не удалось обновить статус');
    }
  } catch (error) {
    console.error('Ошибка обновления:', error);
    alert('Не удалось обновить статус');
  }
}

// Переключение маркера важности
async function toggleUrgent(id, currentUrgentStatus) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_important: !currentUrgentStatus })
    });

    if (response.ok) {
      await fetchTasks();
    } else {
      alert('Не удалось обновить важность');
    }
  } catch (error) {
    console.error('Ошибка обновления важности:', error);
    alert('Не удалось обновить важность');
  }
}

async function deleteTask(id) {
  if (!confirm('Удалить задачу?')) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      await fetchTasks();
    } else {
      alert('Не удалось удалить задачу');
    }
  } catch (error) {
    console.error('Ошибка удаления:', error);
    alert('Не удалось удалить задачу');
  }
}

function renderTasks(tasks) {
  todoList.innerHTML = '';

  if (tasks.length === 0) {
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
    // Добавляем класс 'urgent-task', если задача важная
    taskEl.className = `task-item ${task.is_important ? 'urgent-task' : ''}`;

    const titleSpan = document.createElement('span');
    titleSpan.className = `task-title ${task.completed ? 'completed' : ''} ${task.is_important ? 'urgent-title' : ''}`;
    titleSpan.textContent = task.title;

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';

    // Кнопка статуса
    const toggleBtn = document.createElement('button');
    toggleBtn.className = `btn-toggle ${task.completed ? 'done' : ''}`;
    toggleBtn.textContent = task.completed ? '✅ Готово' : '⬜ В процессе';
    toggleBtn.addEventListener('click', () => toggleTask(task.id, task.completed));

    // Кнопка важности (добавляем класс 'active', если true)
    const urgentBtn = document.createElement('button');
    urgentBtn.className = `btn-urgent ${task.is_important ? 'active' : ''}`;
    urgentBtn.textContent = task.is_important ? '⭐ Важно!' : '☆ Важная';
    urgentBtn.addEventListener('click', () => toggleUrgent(task.id, task.is_important));

    // Кнопка удаления
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = '🗑 Удалить';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    actionsDiv.appendChild(toggleBtn);
    actionsDiv.appendChild(urgentBtn);
    actionsDiv.appendChild(deleteBtn);

    taskEl.appendChild(titleSpan);
    taskEl.appendChild(actionsDiv);
    todoList.appendChild(taskEl);
  });
}

taskForm.addEventListener('submit', addTask);

fetchTasks();
