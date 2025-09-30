// Функции для работы с контактами
async function loadContacts() {
    try {
        const response = await makeAuthRequest('/api/contacts/');
        if (response.ok) {
            const contacts = await response.json();
            // API возвращает один объект ContactsResponse
            renderContacts([contacts]);
        } else {
            showNotification('Ошибка загрузки контактов', 'error');
        }
    } catch (error) {
        showNotification('Ошибка загрузки контактов: ' + error.message, 'error');
    }
}

function renderContacts(contacts) {
    const container = document.getElementById('contacts-list');
    if (!container) return;
    
    if (!contacts || contacts.length === 0) {
        container.innerHTML = '<tr><td colspan="7" style="text-align: center;">Контактов нет</td></tr>';
        return;
    }
    
    container.innerHTML = contacts.map(contact => `
        <tr>
            <td>—</td>
            <td>${contact.address}</td>
            <td>${contact.email}</td>
            <td>${contact.phone || 'Не указан'}</td>
            <td>${contact.work_hours || 'Не указаны'}</td>
            <td><span class="status-badge status-published">Публичные</span></td>
            <td class="actions">—</td>
        </tr>
    `).join('');
}

function getContactTypeClass(type) {
    const classes = {
        'client': 'status-published',
        'partner': 'status-completed',
        'supplier': 'status-in-progress',
        'employee': 'status-planned',
        'other': 'status-draft'
    };
    return classes[type] || 'status-draft';
}

function getContactTypeText(type) {
    const texts = {
        'client': 'Клиент',
        'partner': 'Партнер',
        'supplier': 'Поставщик',
        'employee': 'Сотрудник',
        'other': 'Другой'
    };
    return texts[type] || type;
}

// Создание/редактирование контактов недоступно в спецификации админки

// Нет операций изменения контактов в спецификации

// Нет детального эндпоинта для контактов

// Глобальные функции
// Нет экспортируемых действий