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

    // Требуется выбрать тип новости. Пока используем первый доступный тип
    let typeId = null;
    try {
        const typesRes = await makeAuthRequest('/api/news/types/');
        if (typesRes.ok) {
            const types = await typesRes.json();
            if (Array.isArray(types) && types.length > 0) {
                typeId = types[0].id;
            }
        }
    } catch (_) {}
    if (!typeId) {
        showNotification('Не найден тип новости. Создайте тип новости в системе.', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('body', body);
    formData.append('image', imageFile);
    formData.append('min_text', minText);
    formData.append('news_date', newsDate);
    formData.append('type_id', typeId);
    formData.append('keywords', '[]');

    await createItemWithFile('news', formData, 'news');
}

// Добавление типа новости
document.addEventListener('DOMContentLoaded', () => {
    const typeToggleBtn = document.createElement('button');
    typeToggleBtn.id = 'toggle-news-type-form';
    typeToggleBtn.className = 'toggle-form-btn';
    typeToggleBtn.textContent = '+ Добавить тип новости';
    const section = document.getElementById('news');
    if (section) {
        section.querySelector('h2')?.after(typeToggleBtn);
        typeToggleBtn.addEventListener('click', () => {
            const form = document.getElementById('news-type-form');
            if (!form) return;
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
            typeToggleBtn.textContent = form.style.display === 'none' ? '+ Добавить тип новости' : '− Скрыть форму';
        });
    }

    const cancelBtn = document.getElementById('cancel-news-type-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', () => {
        const form = document.getElementById('news-type-form');
        if (form) form.style.display = 'none';
        typeToggleBtn.textContent = '+ Добавить тип новости';
    });

    const typeForm = document.getElementById('news-type-create-form');
    if (typeForm) {
        typeForm.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const btn = document.getElementById('news-type-submit-btn');
            const original = showLoading(btn);
            try {
                const typeName = document.getElementById('news-type-name').value.trim();
                if (!typeName) {
                    showNotification('Укажите название типа', 'error');
                    return;
                }
                const res = await makeAuthRequest('/api/news/types/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: typeName })
                });
                if (res.ok) {
                    showNotification('Тип новости создан', 'success');
                    typeForm.reset();
                    const form = document.getElementById('news-type-form');
                    if (form) form.style.display = 'none';
                    typeToggleBtn.textContent = '+ Добавить тип новости';
                } else {
                    const err = await res.json().catch(() => ({}));
                    showNotification(err.detail || 'Не удалось создать тип', 'error');
                }
            } finally {
                hideLoading(btn, original);
            }
        });
    }
});

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