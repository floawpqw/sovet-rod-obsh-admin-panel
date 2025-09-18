// Обработка авторизации
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        showAdminPanel();
        loadUsers();
        loadSystemStats();
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
        
        const response = await fetch(`${API_BASE}/admin/api/auth/login`, {
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
                loadUsers();
                loadSystemStats();
                showNotification('Успешный вход!', 'success', 'auth-notification');
            }
        } else {
            const errorData = await response.json();
            showNotification(errorData.detail || `Ошибка авторизации: ${response.status}`, 'error', 'auth-notification');
        }
    } catch (error) {
        showNotification('Ошибка сети: ' + error.message, 'error', 'auth-notification');
    } finally {
        hideLoading(loginBtn, originalText);
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    authToken = null;
    localStorage.removeItem('authToken');
    showAuthForm();
});