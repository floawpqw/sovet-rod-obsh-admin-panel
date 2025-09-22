// Функции для работы с подписками
async function loadSubscriptions() {
    try {
        const response = await makeAuthRequest('/api/subscriptions');
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
            <td>${subscription.name || 'Не указано'}</td>
            <td>${getSubscriptionTypeText(subscription.type)}</td>
            <td><span class="status-badge ${getSubscriptionStatusClass(subscription.status)}">${getSubscriptionStatusText(subscription.status)}</span></td>
            <td>${new Date(subscription.created_at).toLocaleDateString()}</td>
            <td class="actions">
                <button class="action-btn warning" onclick="editSubscription(${subscription.id})">Редактировать</button>
                <button class="action-btn danger" onclick="deleteItem('subscriptions', ${subscription.id}, 'subscription')">Удалить</button>
                <button class="action-btn secondary" onclick="toggleSubscriptionStatus(${subscription.id}, '${subscription.status}')">${subscription.status === 'active' ? 'Деактивировать' : 'Активировать'}</button>
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
    
    const formData = {
        email: document.getElementById('subscription-email').value,
        name: document.getElementById('subscription-name').value,
        type: document.getElementById('subscription-type').value,
        status: document.getElementById('subscription-status').value
    };
    
    await createItem('subscriptions', formData, 'subscription');
}

async function toggleSubscriptionStatus(id, currentStatus) {
    try {
        const response = await makeAuthRequest(`/api/subscriptions/${id}/toggle-status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: currentStatus === 'active' ? 'inactive' : 'active' })
        });
        
        if (response.ok) {
            showNotification('Статус подписки изменен!');
            loadSubscriptions();
        }
    } catch (error) {
        showNotification('Ошибка изменения статуса подписки', 'error');
    }
}

async function editSubscription(id) {
    try {
        const response = await makeAuthRequest(`/api/subscriptions/${id}`);
        if (response.ok) {
            const subscription = await response.json();
            showEditModal('subscription', subscription);
        }
    } catch (error) {
        showNotification('Ошибка загрузки подписки', 'error');
    }
}

// Глобальные функции
window.editSubscription = editSubscription;
window.toggleSubscriptionStatus = toggleSubscriptionStatus;