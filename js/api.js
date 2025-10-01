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
        if (response.status !== 401) {
            return response;
        }
        // 401: try refresh once
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
        const response = await makeAuthRequest('/api/auth/logout', { method: 'POST' });
        // Даже если сервер вернул не 2xx, локально мы все равно завершим выход
        return response.ok;
    } catch (_) {
        return false;
    }
}

window.verifyAuth = async function verifyAuth() {
    if (!authToken) return false;
    try {
        const response = await makeAuthRequest('/api/users/me/');
        return response.ok;
    } catch (_) {
        return false;
    }
};

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

// Глобальные функции
window.deleteItem = deleteItem;
window.toggleItemStatus = toggleItemStatus;
window.apiLogout = apiLogout;
window.verifyAuth = verifyAuth;
// Экспорт базовых API-хелперов в глобальную область видимости
window.makeAuthRequest = makeAuthRequest;
window.createItem = createItem;
window.createItemWithFile = createItemWithFile;