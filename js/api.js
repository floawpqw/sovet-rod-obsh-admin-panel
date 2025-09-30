// Базовые API функции
async function makeAuthRequest(url, options = {}) {
    const headers = {
        'Authorization': `Bearer ${authToken}`,
        ...options.headers
    };
    
    try {
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
    } catch (error) {
        console.error('API Request error:', error);
        throw error;
    }
}

// Выход из системы на стороне API
async function apiLogout() {
    try {
        const response = await makeAuthRequest('/api/auth/logout/', { method: 'POST' });
        // Даже если сервер вернул не 2xx, локально мы все равно завершим выход
        return response.ok;
    } catch (_) {
        return false;
    }
}

async function createItem(endpoint, data, type) {
    const btn = document.getElementById(`${type}-submit-btn`);
    const originalText = showLoading(btn);
    
    try {
        const response = await makeAuthRequest(`/api/${endpoint}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showNotification(`${getTypeName(type).capitalize()} успешно создан!`);
            toggleForm(type);
            if (typeof refreshData === 'function') {
                refreshData(endpoint);
            }
            return true;
        } else {
            const errorData = await response.json().catch(() => ({}));
            showNotification(errorData.detail || `Ошибка создания ${getTypeName(type)}`, 'error');
            return false;
        }
    } catch (error) {
        showNotification(`Ошибка: ${error.message}`, 'error');
        return false;
    } finally {
        hideLoading(btn, originalText);
    }
}

async function createItemWithFile(endpoint, formData, type) {
    const btn = document.getElementById(`${type}-submit-btn`);
    const originalText = showLoading(btn);
    
    try {
        const response = await makeAuthRequest(`/api/${endpoint}/`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            showNotification(`${getTypeName(type).capitalize()} успешно создан!`);
            toggleForm(type);
            if (typeof refreshData === 'function') {
                refreshData(endpoint);
            }
            return true;
        } else {
            const errorData = await response.json().catch(() => ({}));
            showNotification(errorData.detail || `Ошибка создания ${getTypeName(type)}`, 'error');
            return false;
        }
    } catch (error) {
        showNotification(`Ошибка: ${error.message}`, 'error');
        return false;
    } finally {
        hideLoading(btn, originalText);
    }
}

function getDeletePathByType(type, id) {
    switch (type) {
        case 'user': return `/api/users/${id}/delete/`;
        case 'news': return `/api/news/${id}/`;
        case 'project': return `/api/projects/${id}/`;
        case 'banner': return `/api/banners/${id}/`;
        case 'partner': return `/api/partners/${id}/`;
        case 'poll': return `/api/polls/${id}/`;
        case 'subscription': return `/api/subscribers/${id}/`;
        case 'document': return `/api/documents/${id}/`;
        case 'event': return `/api/events/${id}/`;
        case 'question': return `/api/feedbacks/${id}/`;
        default: return null;
    }
}

async function deleteItem(endpoint, id, type) {
    if (!confirm(`Вы уверены, что хотите удалить этот ${getTypeName(type)}?`)) return false;
    const path = getDeletePathByType(type, id);
    if (!path) {
        showNotification('Удаление для данного типа не поддерживается', 'error');
        return false;
    }
    
    try {
        const response = await makeAuthRequest(path, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification(`${getTypeName(type).capitalize()} успешно удален!`);
            if (typeof refreshData === 'function') {
                refreshData(endpoint);
            }
            return true;
        } else {
            showNotification(`Ошибка удаления ${getTypeName(type)}`, 'error');
            return false;
        }
    } catch (error) {
        showNotification(`Ошибка: ${error.message}`, 'error');
        return false;
    }
}

// Глобальные функции
window.deleteItem = deleteItem;
window.apiLogout = apiLogout;
// Экспорт базовых API-хелперов в глобальную область видимости
window.makeAuthRequest = makeAuthRequest;
window.createItem = createItem;
window.createItemWithFile = createItemWithFile;