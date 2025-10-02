// Функции для работы с мероприятиями
async function loadEvents() {
    try {
        const response = await makeAuthRequest('/api/events/');
        if (response.ok) {
            const events = await response.json();
            renderEvents(events);
        } else {
            showNotification('Ошибка загрузки мероприятий', 'error');
        }
    } catch (error) {
        showNotification('Ошибка загрузки мероприятий: ' + error.message, 'error');
    }
}

function renderEvents(events) {
    const container = document.getElementById('events-list');
    if (!container) return;
    
    if (!events || events.length === 0) {
        container.innerHTML = '<tr><td colspan="5" style="text-align: center;">Мероприятий нет</td></tr>';
        return;
    }
    
    container.innerHTML = events.map(eventItem => {
        const id = eventItem.id;
        const title = eventItem.title || '';
        const dateRaw = eventItem.event_date || null;
        const dateStr = dateRaw ? new Date(dateRaw).toLocaleString() : '';
        const status = eventItem.is_active ? 'active' : '';
        return `
        <tr>
            <td>${id}</td>
            <td>${title}</td>
            <td>${dateStr}</td>
            <td>${status}</td>
            <td class="actions">
                <button class="action-btn danger" onclick="deleteItem('events', '${id}', 'event')">Удалить</button>
            </td>
        </tr>`;
    }).join('');
}

async function handleEventCreate(e) {
    e.preventDefault();
    const form = e.target;
    const btn = document.getElementById('event-submit-btn');
    const originalText = showLoading(btn);
    try {
        const formData = new FormData();
        formData.append('title', document.getElementById('event-title').value);
        formData.append('description', document.getElementById('event-description').value || '');
        formData.append('is_active', (document.getElementById('event-status').value || 'active') === 'active');
        const dt = document.getElementById('event-date').value;
        if (dt) formData.append('event_date', new Date(dt).toISOString());
        const imageFile = document.getElementById('event-image').files[0];
        if (imageFile) formData.append('image', imageFile);
        const location = document.getElementById('event-location').value;
        if (location) formData.append('location', location);
        const created = await createItemWithFile('events', formData, 'event');
        if (created) {
            form.reset();
        }
    } finally {
        hideLoading(btn, originalText);
    }
}

// Глобальные функции
window.loadEvents = loadEvents;
window.handleEventCreate = handleEventCreate;
