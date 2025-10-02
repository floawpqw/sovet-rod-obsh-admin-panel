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

// Запуск рассылки по типу новости
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggle-subscription-form');
    if (toggleBtn) {
        toggleBtn.textContent = '+ Сделать рассылку';
        toggleBtn.addEventListener('click', async () => {
            const form = document.getElementById('mailing-form');
            if (!form) return;
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
            toggleBtn.textContent = form.style.display === 'none' ? '+ Сделать рассылку' : '− Скрыть форму';
            if (form.style.display === 'block') {
                // загрузить типы новостей
                try {
                    const res = await makeAuthRequest('/api/news/types/');
                    if (res.ok) {
                        const types = await res.json();
                        const sel = document.getElementById('mailing-type');
                        if (sel) {
                            sel.innerHTML = (types || []).map(t => `<option value="${t.id}">${t.type}</option>`).join('');
                        }
                    }
                } catch (_) {}
            }
        });
    }

    const cancelBtn = document.getElementById('cancel-mailing-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', () => {
        const form = document.getElementById('mailing-form');
        if (form) form.style.display = 'none';
        if (toggleBtn) toggleBtn.textContent = '+ Сделать рассылку';
    });

    const startForm = document.getElementById('start-mailing-form');
    if (startForm) {
        startForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('mailing-submit-btn');
            const original = showLoading(btn);
            try {
                const typeId = document.getElementById('mailing-type').value;
                const title = document.getElementById('mailing-title').value;
                const text = document.getElementById('mailing-text').value;
                const newsUrl = document.getElementById('mailing-url').value;
                const res = await makeAuthRequest(`/api/subscribers/${encodeURIComponent(typeId)}/start-mailing/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, text, news_url: newsUrl })
                });
                if (res.ok) {
                    showNotification('Рассылка запущена', 'success');
                    startForm.reset();
                    const form = document.getElementById('mailing-form');
                    if (form) form.style.display = 'none';
                    if (toggleBtn) toggleBtn.textContent = '+ Сделать рассылку';
                } else {
                    const err = await res.json().catch(() => ({}));
                    showNotification(err.detail || 'Не удалось запустить рассылку', 'error');
                }
            } finally {
                hideLoading(btn, original);
            }
        });
    }
});

// Нет тоггла статуса подписчиков в спецификации

// Нет детального просмотра подписки в спецификации

// Глобальные функции
// Нет экспортируемых действий для подписок