// Функции для работы с контактами
async function loadContacts() {
    try {
        const response = await makeAuthRequest('/api/contacts');
        if (response.ok) {
            const contacts = await response.json();
            renderContacts(contacts);
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
            <td>${contact.id}</td>
            <td>${contact.name}</td>
            <td>${contact.email}</td>
            <td>${contact.phone || 'Не указан'}</td>
            <td>${contact.position || 'Не указана'}</td>
            <td><span class="status-badge ${getContactTypeClass(contact.type)}">${getContactTypeText(contact.type)}</span></td>
            <td class="actions">
                <button class="action-btn warning" onclick="editContact(${contact.id})">Редактировать</button>
                <button class="action-btn danger" onclick="deleteItem('contacts', ${contact.id}, 'contact')">Удалить</button>
                <button class="action-btn secondary" onclick="toggleContactStatus(${contact.id}, '${contact.status}')">${contact.status === 'active' ? 'Деактивировать' : 'Активировать'}</button>
            </td>
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

async function handleContactCreate(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        phone: document.getElementById('contact-phone').value,
        position: document.getElementById('contact-position').value,
        department: document.getElementById('contact-department').value,
        company: document.getElementById('contact-company').value,
        type: document.getElementById('contact-type').value,
        status: document.getElementById('contact-status').value
    };
    
    await createItem('contacts', formData, 'contact');
}

async function toggleContactStatus(id, currentStatus) {
    try {
        const response = await makeAuthRequest(`/api/contacts/${id}/toggle-status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: currentStatus === 'active' ? 'inactive' : 'active' })
        });
        
        if (response.ok) {
            showNotification('Статус контакта изменен!');
            loadContacts();
        }
    } catch (error) {
        showNotification('Ошибка изменения статуса контакта', 'error');
    }
}

async function editContact(id) {
    try {
        const response = await makeAuthRequest(`/api/contacts/${id}`);
        if (response.ok) {
            const contact = await response.json();
            showEditModal('contact', contact);
        }
    } catch (error) {
        showNotification('Ошибка загрузки контакта', 'error');
    }
}

// Глобальные функции
window.editContact = editContact;
window.toggleContactStatus = toggleContactStatus;