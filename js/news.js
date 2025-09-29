// Функции для работы с новостями
async function loadNews() {
    try {
        const response = await makeAuthRequest('/api/news');
        if (response.ok) {
            const news = await response.json();
            renderNews(news);
        } else {
            showNotification('Ошибка загрузки новостей', 'error');
        }
    } catch (error) {
        showNotification('Ошибка загрузки новостей: ' + error.message, 'error');
    }
}

function renderNews(news) {
    const container = document.getElementById('news-list');
    if (!container) return;
    
    if (!news || news.length === 0) {
        container.innerHTML = '<tr><td colspan="6" style="text-align: center;">Новостей нет</td></tr>';
        return;
    }
    
    container.innerHTML = news.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>${item.title}</td>
            <td>${item.image_url ? `<img src="${item.image_url}" alt="${item.title}" style="max-width: 80px; max-height: 60px; border-radius: 4px;">` : 'Нет'}</td>
            <td><span class="status-badge ${item.status === 'published' ? 'status-published' : 'status-draft'}">${item.status === 'published' ? 'Опубликовано' : 'Черновик'}</span></td>
            <td>${new Date(item.created_at || item.createdAt).toLocaleDateString()}</td>
            <td class="actions">
                <button class="action-btn warning" onclick="editNews(${item.id})">Редактировать</button>
                <button class="action-btn danger" onclick="deleteItem('news', ${item.id}, 'news')">Удалить</button>
                <button class="action-btn secondary" onclick="toggleNewsStatus(${item.id}, '${item.status}')">${item.status === 'published' ? 'В черновик' : 'Опубликовать'}</button>
            </td>
        </tr>
    `).join('');
}

async function handleNewsCreate(e) {
    e.preventDefault();
    
    // Валидация: содержание должно быть HTML-блоком (например, <div>...)</div>)
    const contentValue = document.getElementById('news-content').value.trim();
    const looksLikeHtmlBlock = /^<([a-zA-Z][\w:-]*)\b[\s\S]*<\/\1>\s*$/m.test(contentValue);
    if (!looksLikeHtmlBlock) {
        showNotification('Поле "Содержание" должно содержать валидный HTML-блок, например <div>...</div>.', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('title', document.getElementById('news-title').value);
    formData.append('content', contentValue);
    formData.append('status', document.getElementById('news-status').value);
    
    const imageFile = document.getElementById('news-image').files[0];
    if (imageFile) formData.append('image', imageFile);
    
    await createItemWithFile('news', formData, 'news');
}

async function toggleNewsStatus(id, currentStatus) {
    try {
        const response = await makeAuthRequest(`/api/news/${id}/toggle-status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: currentStatus === 'published' ? 'draft' : 'published' })
        });
        
        if (response.ok) {
            showNotification('Статус новости изменен!');
            loadNews();
        }
    } catch (error) {
        showNotification('Ошибка изменения статуса новости', 'error');
    }
}

async function editNews(id) {
    try {
        const response = await makeAuthRequest(`/api/news/${id}`);
        if (response.ok) {
            const news = await response.json();
            showEditModal('news', news);
        }
    } catch (error) {
        showNotification('Ошибка загрузки новости', 'error');
    }
}

// Глобальные функции
window.editNews = editNews;
window.toggleNewsStatus = toggleNewsStatus;