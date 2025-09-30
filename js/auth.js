// Обработка авторизации
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        showAdminPanel();
        if (typeof loadUsers === 'function') loadUsers();
        if (typeof loadSystemStats === 'function') loadSystemStats();
    } else {
        showAuthForm();
    }
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('login-btn');
    
    const originalText = showLoading(loginBtn);
    
    try {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        
        const response = await fetch(`${API_BASE}/api/auth/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.access_token) {
                authToken = data.access_token;
                localStorage.setItem('authToken', authToken);
                showAdminPanel();
                if (typeof loadUsers === 'function') loadUsers();
                if (typeof loadSystemStats === 'function') loadSystemStats();
                showNotification('Успешный вход!', 'success', 'auth-notification');
            } else {
                showNotification('Токен не найден в ответе', 'error', 'auth-notification');
            }
        } else {
            let userMessage = 'Ошибка авторизации';
            if (response.status === 400 || response.status === 401) {
                userMessage = 'Неверный логин или пароль';
            } else if (response.status === 429) {
                userMessage = 'Слишком много попыток. Попробуйте позже.';
            }
            const errorData = await response.json().catch(() => ({}));
            const detailed = errorData && (errorData.detail || errorData.message);
            showNotification(detailed || userMessage, 'error', 'auth-notification');
        }
    } catch (error) {
        // Сетевые ошибки (включая "Failed to fetch") показываем дружелюбно
        showNotification('Не удалось связаться с сервером. Проверьте подключение и попробуйте снова.', 'error', 'auth-notification');
    } finally {
        hideLoading(loginBtn, originalText);
    }
});

document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        if (typeof apiLogout === 'function') {
            await apiLogout();
        }
    } catch (_) {
        // Игнорируем ошибку логаута, продолжаем локальный выход
    } finally {
        authToken = null;
        localStorage.removeItem('authToken');
        showAuthForm();
        showNotification('Вы вышли из системы', 'success');
    }
});