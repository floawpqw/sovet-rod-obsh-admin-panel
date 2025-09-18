// Глобальные переменные
const API_BASE = 'https://terlynedev.space';
let authToken = localStorage.getItem('authToken');
let currentEditId = null;
let currentEditType = null;

// Утилиты
function showNotification(message, type = 'success', elementId = 'notification') {
    const notification = document.getElementById(elementId);
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function showLoading(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<div class="loading"></div>';
    button.disabled = true;
    return originalText;
}

function hideLoading(button, originalText) {
    button.innerHTML = originalText;
    button.disabled = false;
}

function showAdminPanel() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('admin-section').style.display = 'block';
}

function showAuthForm() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('admin-section').style.display = 'none';
}

function getStatusClass(status) {
    const classes = {
        'completed': 'status-completed',
        'in_progress': 'status-in-progress',
        'planned': 'status-planned',
        'published': 'status-published',
        'draft': 'status-draft',
        'active': 'status-published',
        'inactive': 'status-draft'
    };
    return classes[status] || 'status-draft';
}

function getStatusText(status) {
    const texts = {
        'completed': 'Завершен',
        'in_progress': 'В разработке',
        'planned': 'Запланирован',
        'published': 'Опубликовано',
        'draft': 'Черновик',
        'active': 'Активен',
        'inactive': 'Неактивен',
        'true': 'Включен',
        'false': 'Выключен'
    };
    return texts[status] || status;
}

function initImagePreview(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    if (input && preview) {
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                }
                reader.readAsDataURL(file);
            }
        });
    }
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

function getTypeName(type) {
    const names = {
        'user': 'пользователя',
        'news': 'новость',
        'project': 'проект',
        'service': 'услугу',
        'question': 'вопрос'
    };
    return names[type] || type;
}

function toggleForm(type) {
    const form = document.getElementById(`${type}-form`);
    const btn = document.getElementById(`toggle-${type}-form`);
    
    if (form && btn) {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
        btn.textContent = form.style.display === 'none' ? 
            `+ Добавить ${getTypeName(type)}` : 
            `− Скрыть форму`;
        
        if (form.style.display === 'none') {
            const formElement = document.getElementById(`${type}-create-form`);
            if (formElement) formElement.reset();
            
            const preview = document.getElementById(`${type}-image-preview`);
            if (preview) preview.style.display = 'none';
        }
    }
}