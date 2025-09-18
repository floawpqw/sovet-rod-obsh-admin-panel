// Базовые API функции
async function makeAuthRequest(url, options = {}) {
    const headers = {
        'Authorization': `Bearer ${authToken}`,
        ...options.headers
    };
    
    const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers
    });
    
    if (response.status === 401) {
        authToken = null;
        localStorage.removeItem('authToken');
        showAuthForm();
        throw new Error('Требуется авторизация');
    }
    
    return response;
}

async function createItem(endpoint, data, type) {
    const btn = document.getElementById(`${type}-submit-btn`);
    const originalText = showLoading(btn);
    
    try {
        const response = await makeAuthRequest(`/api/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showNotification(`${getTypeName(type).capitalize()} успешно создан!`);
            toggleForm(type);
            refreshData(endpoint);
            return true;
        } else {
            const errorData = await response.json();
            showNotification(errorData.detail || 'Ошибка создания', 'error');
            return false;
        }
    } catch (error) {
        showNotification('Ошибка: ' + error.message, 'error');
        return false;
    } finally {
        hideLoading(btn, originalText);
    }
}

async function createItemWithFile(endpoint, formData, type) {
    const btn = document.getElementById(`${type}-submit-btn`);
    const originalText = showLoading(btn);
    
    try {
        const response = await makeAuthRequest(`/api/${endpoint}`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            showNotification(`${getTypeName(type).capitalize()} успешно создан!`);
            toggleForm(type);
            refreshData(endpoint);
            return true;
        } else {
            const errorData = await response.json();
            showNotification(errorData.detail || 'Ошибка создания', 'error');
            return false;
        }
    } catch (error) {
        showNotification('Ошибка: ' + error.message, 'error');
        return false;
    } finally {
        hideLoading(btn, originalText);
    }
}

async function deleteItem(endpoint, id, type) {
    if (!confirm(`Вы уверены, что хотите удалить этот ${getTypeName(type)}?`)) return false;
    
    try {
        const response = await makeAuthRequest(`/api/${endpoint}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification(`${getTypeName(type).capitalize()} успешно удален!`);
            refreshData(endpoint);
            return true;
        } else {
            showNotification('Ошибка удаления', 'error');
            return false;
        }
    } catch (error) {
        showNotification('Ошибка: ' + error.message, 'error');
        return false;
    }
}

async function toggleItemStatus(endpoint, id, currentStatus, type) {
    try {
        const response = await makeAuthRequest(`/api/${endpoint}/${id}/toggle-status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: !currentStatus })
        });
        
        if (response.ok) {
            showNotification('Статус успешно изменен!');
            refreshData(endpoint);
            return true;
        }
    } catch (error) {
        showNotification('Ошибка изменения статуса', 'error');
        return false;
    }
}

function refreshData(endpoint) {
    switch(endpoint) {
        case 'users': loadUsers(); break;
        case 'news': loadNews(); break;
        case 'projects': loadProjects(); break;
        case 'services': loadServices(); break;
        case 'questions': loadQuestions(); break;
    }
    loadSystemStats();
}

// Глобальные функции
window.deleteItem = deleteItem;
window.toggleItemStatus = toggleItemStatus;