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
        const title = eventItem.title || eventItem.name || '';
        const dateRaw = eventItem.date || eventItem.start_date || eventItem.starts_at || eventItem.datetime || null;
        const dateStr = dateRaw ? new Date(dateRaw).toLocaleString() : '';
        const status = eventItem.status || (eventItem.active ? 'active' : '') || '';
        return `
        <tr>
            <td>${id}</td>
            <td>${title}</td>
            <td>${dateStr}</td>
            <td>${status}</td>
            <td class="actions">
                <button class="action-btn danger" onclick="deleteItem('events', ${id}, 'event')">Удалить</button>
            </td>
        </tr>`;
    }).join('');
}

// Глобальные функции
window.loadEvents = loadEvents;
