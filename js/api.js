// Базовые API функции
async function refreshAccessToken() {
    if (!refreshToken) return false;
    try {
        const response = await fetch(`${API_BASE}/api/auth/refresh/`, {
            method: 'POST',
            headers: {
                'X-Refresh-Token': refreshToken
            }
        });
        if (!response.ok) return false;
        const data = await response.json().catch(() => ({}));
        const newAccess = data.access_token || null;
        const newRefresh = data.refresh_token || refreshToken || null;
        if (!newAccess) return false;
        setTokens(newAccess, newRefresh);
        return true;
    } catch (_) {
        return false;
    }
}

async function makeAuthRequest(url, options = {}) {
    const headers = {
        ...options.headers
    };
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    try {
        const response = await fetch(`${API_BASE}${url}`, {
            ...options,
            headers
        });
        // Try refresh on 401, and also on specific 400 for auth-check endpoint
        if (response.status !== 401 && !(response.status === 400 && typeof url === 'string' && url.startsWith('/api/users/me/'))) {
            return response;
        }
        // 401 or auth-check 400: try refresh once
        const didRefresh = await refreshAccessToken();
        if (didRefresh) {
            const retryHeaders = {
                ...options.headers
            };
            if (authToken) retryHeaders['Authorization'] = `Bearer ${authToken}`;
            const retryResponse = await fetch(`${API_BASE}${url}`, {
                ...options,
                headers: retryHeaders
            });
            if (retryResponse.status !== 401) return retryResponse;
        }
        clearTokens();
        showAuthForm();
        throw new Error('Требуется авторизация');
    } catch (error) {
        console.error('API Request error:', error);
        throw error;
    }
}

// Выход из системы на стороне API
async function apiLogout() {
    try {
        const headers = {};
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
        if (refreshToken) headers['X-Refresh-Token'] = refreshToken;
        const response = await fetch(`${API_BASE}/api/auth/logout/`, {
            method: 'POST',
            headers
        });
        return response.ok;
    } catch (_) {
        return false;
    }
}

window.verifyAuth = async function verifyAuth() {
    if (!authToken) return null;
    try {
        const response = await makeAuthRequest('/api/users/me/');
        if (!response.ok) return null;
        const user = await response.json().catch(() => null);
        if (user && typeof applyRoleUI === 'function') {
            applyRoleUI(user);
        }
        return user;
    } catch (_) {
        return null;
    }
};

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