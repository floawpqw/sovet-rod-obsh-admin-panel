// Функции для работы с новостями
async function loadNews() {
    try {
        const response = await makeAuthRequest('/api/news/');
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
            <td><span class="status-badge status-published">Опубликовано</span></td>
            <td>${item.news_date ? new Date(item.news_date).toLocaleDateString() : ''}</td>
            <td class="actions">
                <button class="action-btn warning" onclick="editNews('${item.id}')">Редактировать</button>
                <button class="action-btn danger" onclick="deleteItem('news', '${item.id}', 'news')">Удалить</button>
            </td>
        </tr>
    `).join('');
}

async function handleNewsCreate(e) {
    e.preventDefault();
    
    const title = document.getElementById('news-title').value.trim();
    const body = document.getElementById('news-content').value.trim();
    const imageFile = document.getElementById('news-image').files[0];
    const minText = body.substring(0, 140) || 'text';
    const newsDate = new Date().toISOString().substring(0,10);

    if (!title || !body || !imageFile) {
        showNotification('Заполните заголовок, содержание и прикрепите изображение.', 'error');
        return;
    }

    // Тип новости: из селекта или создать новый
    const typeName = (document.getElementById('news-type-name')?.value || '').trim();
    if (!typeName) {
        showNotification('Укажите тип новости', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('body', body);
    formData.append('image', imageFile);
    formData.append('min_text', minText);
    formData.append('news_date', newsDate);
    // Получаем id типа по названию (создаем, если нет)
    let typeId = null;
    try {
        const typesRes = await makeAuthRequest('/api/news/types/');
        if (typesRes.ok) {
            const types = await typesRes.json();
            const found = (types || []).find(t => String(t.type).toLowerCase() === typeName.toLowerCase());
            if (found) typeId = found.id;
        }
    } catch (_) {}
    if (!typeId) {
        const createRes = await makeAuthRequest('/api/news/types/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: typeName })
        });
        if (createRes.ok) {
            const created = await createRes.json();
            typeId = created.id;
        }
    }
    if (!typeId) {
        showNotification('Не удалось определить тип новости', 'error');
        return;
    }
    formData.append('type_id', typeId);
    formData.append('keywords', '[]');

    await createItemWithFile('news', formData, 'news');
}

// Добавление типа новости
// Типы подгружать в инпут не требуется, ввод свободный

// Тоггла статуса у новостей нет в спецификации — действие удалено

async function editNews(id) {
    try {
        const response = await makeAuthRequest(`/api/news/${id}/`);
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