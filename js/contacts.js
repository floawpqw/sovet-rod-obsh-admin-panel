// Функции для работы с контактами
async function loadContacts() {
    try {
        const response = await makeAuthRequest('/api/contacts/');
        if (response.ok) {
            const contacts = await response.json();
            // API возвращает один объект ContactsResponse
            renderContacts([contacts]);
            window.currentContactsData = contacts;
            initContactsEditForm(contacts);
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
        container.innerHTML = '<tr><td colspan="6" style="text-align: center;">Контактов нет</td></tr>';
        return;
    }
    
    container.innerHTML = contacts.map(contact => {
        const tg = contact.telegram_url || contact.telegram || '';
        const vk = contact.vk_url || contact.vk || '';
        return `
        <tr>
            <td>${contact.address || ''}</td>
            <td>${contact.email || ''}</td>
            <td>${contact.phone || 'Не указан'}</td>
            <td style="display:flex; align-items:center; gap:10px;">
                <span>${contact.work_hours || 'Не указаны'}</span>
                <button class="action-btn" onclick="toggleContactsEdit()">Редактировать</button>
            </td>
            <td>${tg ? `<a href="${toAbsoluteUrl(tg)}" target="_blank">Открыть</a>` : '—'}</td>
            <td>${vk ? `<a href="${toAbsoluteUrl(vk)}" target="_blank">Открыть</a>` : '—'}</td>
        </tr>`;
    }).join('');
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

function initContactsEditForm(current) {
    const toggleBtn = document.getElementById('toggle-contact-form');
    if (toggleBtn) {
        toggleBtn.textContent = '+ Изменить контакты';
        toggleBtn.addEventListener('click', () => {
            const form = document.getElementById('contacts-edit');
            if (!form) return;
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
            toggleBtn.textContent = form.style.display === 'none' ? '+ Изменить контакты' : '− Скрыть форму';
            if (form.style.display === 'block') {
                document.getElementById('contacts-phone').value = current.phone || '';
                document.getElementById('contacts-email').value = current.email || '';
                document.getElementById('contacts-work-hours').value = current.work_hours || '';
                document.getElementById('contacts-address').value = current.address || '';
                const tg = document.getElementById('contacts-telegram');
                const vk = document.getElementById('contacts-vk');
                if (tg) tg.value = current.telegram_url || current.telegram || '';
                if (vk) vk.value = current.vk_url || current.vk || '';
            }
        });
    }

    const cancelBtn = document.getElementById('cancel-contacts-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', () => {
        const form = document.getElementById('contacts-edit');
        if (form) form.style.display = 'none';
        if (toggleBtn) toggleBtn.textContent = '+ Изменить контакты';
    });

    const form = document.getElementById('contacts-edit-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('contacts-submit-btn');
            const original = showLoading(btn);
            try {
                const body = {
                    phone: document.getElementById('contacts-phone').value || null,
                    email: document.getElementById('contacts-email').value || null,
                    work_hours: document.getElementById('contacts-work-hours').value || null,
                    address: document.getElementById('contacts-address').value || null,
                    telegram_url: document.getElementById('contacts-telegram').value || null,
                    vk_url: document.getElementById('contacts-vk').value || null,
                };
                const res = await makeAuthRequest('/api/contacts/', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (res.ok) {
                    showNotification('Контакты обновлены', 'success');
                    loadContacts();
                    const wrapper = document.getElementById('contacts-edit');
                    if (wrapper) wrapper.style.display = 'none';
                    if (toggleBtn) toggleBtn.textContent = '+ Изменить контакты';
                } else {
                    const err = await res.json().catch(() => ({}));
                    showNotification(err.detail || 'Не удалось обновить контакты', 'error');
                }
            } finally {
                hideLoading(btn, original);
            }
        });
    }
}

function toggleContactsEdit() {
    const form = document.getElementById('contacts-edit');
    const toggleBtn = document.getElementById('toggle-contact-form');
    if (!form) return;
    const isHidden = form.style.display === 'none';
    form.style.display = isHidden ? 'block' : 'none';
    if (isHidden && window.currentContactsData) {
        const current = window.currentContactsData;
        const phoneEl = document.getElementById('contacts-phone');
        const emailEl = document.getElementById('contacts-email');
        const hoursEl = document.getElementById('contacts-work-hours');
        const addrEl = document.getElementById('contacts-address');
        if (phoneEl) phoneEl.value = current.phone || '';
        if (emailEl) emailEl.value = current.email || '';
        if (hoursEl) hoursEl.value = current.work_hours || '';
        if (addrEl) addrEl.value = current.address || '';
    }
    if (toggleBtn) toggleBtn.textContent = isHidden ? '− Скрыть форму' : '+ Изменить контакты';
}

window.toggleContactsEdit = toggleContactsEdit;

// Глобальные функции
// Нет экспортируемых действий