// Глобальные переменные
const API_BASE = 'https://terlynedev.space';
let authToken = localStorage.getItem('authToken');
let currentEditId = null;
let currentEditType = null;

// Утилиты
function showNotification(message, type = 'success', elementId = 'notification') {
    const notification = document.getElementById(elementId);
    if (notification) {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

function showLoading(button) {
    if (!button) return '';
    const originalText = button.innerHTML;
    button.innerHTML = '<div class="loading"></div>';
    button.disabled = true;
    return originalText;
}

function hideLoading(button, originalText) {
    if (!button) return;
    button.innerHTML = originalText;
    button.disabled = false;
}

function showAdminPanel() {
    const authSection = document.getElementById('auth-section');
    const adminSection = document.getElementById('admin-section');
    if (authSection && adminSection) {
        authSection.style.display = 'none';
        adminSection.style.display = 'block';
    }
}

function showAuthForm() {
    const authSection = document.getElementById('auth-section');
    const adminSection = document.getElementById('admin-section');
    if (authSection && adminSection) {
        authSection.style.display = 'block';
        adminSection.style.display = 'none';
    }
}

function getStatusClass(status) {
    const classes = {
        'completed': 'status-completed',
        'in_progress': 'status-in-progress',
        'planned': 'status-planned',
        'published': 'status-published',
        'draft': 'status-draft',
        'active': 'status-published',
        'inactive': 'status-draft',
        'true': 'status-published',
        'false': 'status-draft'
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
        'banner': 'баннер',
        'partner': 'партнера',
        'poll': 'опрос',
        'question': 'вопрос',
        'service': 'услугу'
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
            if (preview) {
                preview.style.display = 'none';
                preview.src = '';
            }
        }
    }
}

function getBannerPositionText(position) {
    const positions = {
        'top': 'Верх',
        'middle': 'Середина',
        'bottom': 'Низ',
        'sidebar': 'Боковая панель'
    };
    return positions[position] || position;
}

function getPartnerTypeText(type) {
    const types = {
        'strategic': 'Стратегический',
        'technical': 'Технический',
        'marketing': 'Маркетинговый',
        'general': 'Общий'
    };
    return types[type] || type;
}

function getPollStatusClass(status) {
    const classes = {
        'active': 'status-published',
        'inactive': 'status-draft',
        'completed': 'status-completed'
    };
    return classes[status] || 'status-draft';
}

function getPollStatusText(status) {
    const texts = {
        'active': 'Активен',
        'inactive': 'Неактивен',
        'completed': 'Завершен'
    };
    return texts[status] || status;
}