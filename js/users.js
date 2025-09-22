// Функции для работы с пользователями
async function loadUsers() {
    try {
        const response = await makeAuthRequest('/api/users');
        if (response.ok) {
            const users = await response.json();
            renderUsers(users);
        } else {
            showNotification('Ошибка загрузки пользователей', 'error');
        }
    } catch (error) {
        showNotification('Ошибка загрузки пользователей: ' + error.message, 'error');
    }
}

function renderUsers(users) {
    const container = document.getElementById('users-list');
    if (!container) return;
    
    if (!users || users.length === 0) {
        container.innerHTML = '<tr><td colspan="7" style="text-align: center;">Пользователей нет</td></tr>';
        return;
    }
    
    container.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name || 'Не указано'}</td>
            <td>${user.email}</td>
            <td>${user.username}</td>
            <td>${user.role}</td>
            <td><span class="status-badge ${user.is_active ? 'status-published' : 'status-draft'}">${user.is_active ? 'Активен' : 'Неактивен'}</span></td>
            <td class="actions">
                <button class="action-btn warning" onclick="editUser(${user.id})">Редактировать</button>
                <button class="action-btn danger" onclick="deleteItem('users', ${user.id}, 'user')">Удалить</button>
                <button class="action-btn secondary" onclick="toggleUserStatus(${user.id}, ${user.is_active})">${user.is_active ? 'Деактивировать' : 'Активировать'}</button>
            </td>
        </tr>
    `).join('');
}

async function handleUserCreate(e) {
    e.preventDefault();
    
    const formData = {
        email: document.getElementById('user-email').value,
        username: document.getElementById('user-username').value,
        password: document.getElementById('user-password').value,
        name: document.getElementById('user-name').value,
        role: document.getElementById('user-role').value
    };
    
    await createItem('users', formData, 'user');
}

async function toggleUserStatus(id, currentStatus) {
    await toggleItemStatus('users', id, currentStatus, 'user');
}

async function editUser(id) {
    try {
        const response = await makeAuthRequest(`/api/users/${id}`);
        if (response.ok) {
            const user = await response.json();
            showEditModal('user', user);
        }
    } catch (error) {
        showNotification('Ошибка загрузки пользователя', 'error');
    }
}

// Глобальные функции
window.editUser = editUser;
window.toggleUserStatus = toggleUserStatus;