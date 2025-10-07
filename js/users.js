// Функции для работы с пользователями
async function loadUsers() {
    try {
        const response = await makeAuthRequest('/api/users/');
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
        container.innerHTML = '<tr><td colspan="6" style="text-align: center;">Пользователей нет</td></tr>';
        return;
    }
    
    container.innerHTML = users.map(user => {
        const isSelf = window.currentUser && (String(window.currentUser.id) === String(user.id));
        const isAdmin = window.currentUser && (window.currentUser.role === 'admin' || window.currentUser.is_admin === true);
        return `
        <tr>
            <td>${user.username || 'Не указано'}</td>
            <td>${user.email || ''}</td>
            <td>${user.username || ''}</td>
            <td>${user.role || '—'}</td>
            <td><span class="status-badge ${user.is_active ? 'status-published' : 'status-draft'}">${user.is_active ? 'Активен' : 'Неактивен'}</span></td>
            <td class="actions">
                ${user.id ? `<button class="action-btn warning" onclick="editUser('${user.id}')">Редактировать</button>` : ''}
                ${user.id && !isSelf ? `<button class="action-btn danger" onclick="deleteItem('users', '${user.id}', 'user')">Удалить</button>` : ''}
                ${user.id && !isSelf ? `<button class="action-btn secondary" onclick="toggleUserStatus('${user.id}', ${user.is_active})">${user.is_active ? 'Деактивировать' : 'Активировать'}</button>` : ''}
            </td>
        </tr>`;
    }).join('');
}

async function handleUserInvite(e) {
    e.preventDefault();
    const btn = document.getElementById('user-submit-btn');
    const originalText = showLoading(btn);
    try {
        const email = document.getElementById('invite-email').value;
        const response = await makeAuthRequest(`/api/auth/send-register-invitation/?email=${encodeURIComponent(email)}`, {
            method: 'POST'
        });
        if (response.ok) {
            showNotification('Приглашение отправлено!', 'success');
            toggleForm('user');
        } else {
            const errorData = await response.json().catch(() => ({}));
            const detail = (errorData && (errorData.detail || errorData.message)) || '';
            const isDuplicate = typeof detail === 'string' && /exist|already|существ|дубликат/i.test(detail);
            showNotification(isDuplicate ? 'Пользователь уже существует' : (detail || 'Не удалось отправить приглашение'), 'error');
        }
    } catch (error) {
        showNotification('Ошибка: ' + error.message, 'error');
    } finally {
        hideLoading(btn, originalText);
    }
}

async function toggleUserStatus(id, currentStatus) {
    try {
        // предотвращаем само-деактивацию
        try {
            const me = window.currentUser || null;
            if (me && String(me.id) === String(id)) {
                showNotification('Нельзя деактивировать свой аккаунт', 'error');
                return;
            }
        } catch (_) {}

        const path = currentStatus ? `/api/users/${id}/deactivate/` : `/api/users/${id}/activate/`;
        const method = currentStatus ? 'DELETE' : 'PATCH';
        const response = await makeAuthRequest(path, { method });
        if (response.ok) {
            showNotification('Статус пользователя изменен!');
            loadUsers();
        } else {
            showNotification('Не удалось изменить статус пользователя', 'error');
        }
    } catch (error) {
        showNotification('Ошибка изменения статуса пользователя', 'error');
    }
}

async function editUser(id) {
    try {
        const response = await makeAuthRequest(`/api/users/${id}/`);
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