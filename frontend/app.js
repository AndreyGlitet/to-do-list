const API_URL = '/api/tasks';
const todoList = document.getElementById('todo-list');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');

// ИЗМЕНЕНО: Добавили глобальные переменные для управления фильтрами
let allTasks = []; 
let currentFilter = 'all'; // Возможные значения: 'all', 'active', 'completed'

async function fetchTasks() {
  try {
    const response = await fetch(API_URL);
    allTasks = await response.json(); // ИЗМЕНЕНО: Запоминаем все задачи в глобальный массив
    applyFilter();                    // ИЗМЕНЕНО: Вместо прямого рендера применяем текущий фильтр
  } catch (error) {
    console.error('Ошибка:', error);
    todoList.innerHTML = '<p class="loading" style="color: #ff7c7c;">Ошибка подключения к бэкенду</p>';
  }
}

// ИЗМЕНЕНО: Новая функция для фильтрации массива перед выводом на экран
function applyFilter() {
  let filteredTasks = allTasks;

  if (currentFilter === 'active') {
    filteredTasks = allTasks.filter(task => !task.completed);  // Только невыполненные
  } else if (currentFilter === 'completed') {
    filteredTasks = allTasks.filter(task => task.completed);   // Только выполненные
  }

  renderTasks(filteredTasks);
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
    taskEl.className = `task-item ${task.is_important ? 'urgent-task' : ''}`;

    const titleSpan = document.createElement('span');
    titleSpan.className = `task-title ${task.completed ? 'completed' : ''} ${task.is_important ? 'urgent-title' : ''}`;
    titleSpan.textContent = task.title;

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = `btn-toggle ${task.completed ? 'done' : ''}`;
    toggleBtn.textContent = task.completed ? '✅ Готово' : '⬜ В процессе';
    toggleBtn.addEventListener('click', () => toggleTask(task.id, task.completed));

    const urgentBtn = document.createElement('button');
    urgentBtn.className = `btn-urgent ${task.is_important ? 'active' : ''}`;
    urgentBtn.textContent = task.is_important ? '⭐ Важно!' : '☆ Важная';
    urgentBtn.addEventListener('click', () => toggleUrgent(task.id, task.is_important));

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


document.getElementById('filter-all').addEventListener('click', (e) => {
  switchActiveFilterButton(e.target);
  currentFilter = 'all';
  applyFilter();
});

document.getElementById('filter-active').addEventListener('click', (e) => {
  switchActiveFilterButton(e.target);
  currentFilter = 'active';
  applyFilter();
});

document.getElementById('filter-completed').addEventListener('click', (e) => {
  switchActiveFilterButton(e.target);
  currentFilter = 'completed';
  applyFilter();
});


function switchActiveFilterButton(clickedButton) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  clickedButton.classList.add('active');
}

taskForm.addEventListener('submit', addTask);

fetchTasks();
