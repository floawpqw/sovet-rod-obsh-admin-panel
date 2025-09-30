// Функции для работы с подписками
async function loadSubscriptions() {
    try {
        const response = await makeAuthRequest('/api/subscribers/');
        if (response.ok) {
            const subscriptions = await response.json();
            renderSubscriptions(subscriptions);
        } else {
            showNotification('Ошибка загрузки подписок', 'error');
        }
    } catch (error) {
        showNotification('Ошибка загрузки подписок: ' + error.message, 'error');
    }
}

function renderSubscriptions(subscriptions) {
    const container = document.getElementById('subscriptions-list');
    if (!container) return;
    
    if (!subscriptions || subscriptions.length === 0) {
        container.innerHTML = '<tr><td colspan="7" style="text-align: center;">Подписок нет</td></tr>';
        return;
    }
    
    container.innerHTML = subscriptions.map(subscription => `
        <tr>
            <td>${subscription.id}</td>
            <td>${subscription.email}</td>
            <td>—</td>
            <td>—</td>
            <td><span class="status-badge ${subscription.is_confirmed ? 'status-published' : 'status-draft'}">${subscription.is_confirmed ? 'Подтверждена' : 'Не подтверждена'}</span></td>
            <td>${subscription.subscribed_at ? new Date(subscription.subscribed_at).toLocaleDateString() : ''}</td>
            <td class="actions">
                <button class="action-btn danger" onclick="deleteItem('subscriptions', '${subscription.id}', 'subscription')">Удалить</button>
            </td>
        </tr>
    `).join('');
}

function getSubscriptionTypeText(type) {
    const types = {
        'newsletter': 'Рассылка новостей',
        'updates': 'Обновления',
        'promotions': 'Акции и скидки',
        'all': 'Все уведомления'
    };
    return types[type] || type;
}

function getSubscriptionStatusClass(status) {
    const classes = {
        'active': 'status-published',
        'inactive': 'status-draft',
        'unsubscribed': 'status-draft'
    };
    return classes[status] || 'status-draft';
}

function getSubscriptionStatusText(status) {
    const texts = {
        'active': 'Активна',
        'inactive': 'Неактивна',
        'unsubscribed': 'Отписана'
    };
    return texts[status] || status;
}

async function handleSubscriptionCreate(e) {
    e.preventDefault();
    
    const body = {
        email: document.getElementById('subscription-email').value,
        subscribed_at: new Date().toISOString().substring(0,10),
        is_confirmed: document.getElementById('subscription-status').value === 'active'
    };
    await createItem('subscribers', body, 'subscription');
}

// Нет тоггла статуса подписчиков в спецификации

// Нет детального просмотра подписки в спецификации

// Глобальные функции
// Нет экспортируемых действий для подписок