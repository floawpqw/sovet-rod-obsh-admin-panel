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
        const response = await makeAuthRequest('/api/auth/logout', { method: 'POST' });
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
            showNotification(`Ошибка удаления ${getTypeName(type)}`, 'error');
            return false;
        }
    } catch (error) {
        showNotification(`Ошибка: ${error.message}`, 'error');
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
        } else {
            showNotification('Ошибка изменения статуса', 'error');
            return false;
        }
    } catch (error) {
        showNotification('Ошибка изменения статуса', 'error');
        return false;
    }
}

function refreshData(endpoint) {
    switch(endpoint) {
        case 'users': typeof loadUsers === 'function' && loadUsers(); break;
        case 'news': typeof loadNews === 'function' && loadNews(); break;
        case 'projects': typeof loadProjects === 'function' && loadProjects(); break;
        case 'banners': typeof loadBanners === 'function' && loadBanners(); break;
        case 'partners': typeof loadPartners === 'function' && loadPartners(); break;
        case 'polls': typeof loadPolls === 'function' && loadPolls(); break;
        case 'questions': typeof loadQuestions === 'function' && loadQuestions(); break;
        case 'feedbacks': typeof loadQuestions === 'function' && loadQuestions(); break;
    }
    typeof loadSystemStats === 'function' && loadSystemStats();
}

// Глобальные функции
window.deleteItem = deleteItem;
window.toggleItemStatus = toggleItemStatus;
window.apiLogout = apiLogout;