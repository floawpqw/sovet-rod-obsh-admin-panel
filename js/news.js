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
        container.innerHTML = '<tr><td colspan="5" style="text-align: center;">Новостей нет</td></tr>';
        return;
    }
    
    container.innerHTML = news.map(item => `
        <tr>
            <td>${item.title}</td>
            <td>${item.image_url ? `<img src="${toAbsoluteUrl(item.image_url)}" alt="${item.title}" style="max-width: 80px; max-height: 60px; border-radius: 4px;">` : 'Нет'}</td>
            <td><span class="status-badge ${getStatusClass('published')}">${getStatusText('published')}</span></td>
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
    const newsUrl = document.getElementById('news-content').value.trim();
    const imageFile = document.getElementById('news-image').files[0];
    const minText = (document.getElementById('news-min-text')?.value || '').trim();
<<<<<<< HEAD
    const newsDateInput = (document.getElementById('news-date')?.value || '').trim();
    const newsDate = newsDateInput ? new Date(newsDateInput).toISOString().substring(0,10) : new Date().toISOString().substring(0,10);
=======
    const newsDate = new Date().toISOString().substring(0,10);
>>>>>>> f2dce32861d0a839a91db714bc138bd0f31f8ba2

    if (!title || !newsUrl || !minText || !imageFile) {
        showNotification('Заполните заголовок, содержание и прикрепите изображение.', 'error');
        return;
    }

    // Тип новости из селекта
    const typeIdSel = document.getElementById('news-type');
    const typeId = typeIdSel && typeIdSel.value ? Number(typeIdSel.value) : null;
    if (!typeId) {
        showNotification('Выберите тип новости', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('news_url', newsUrl);
    formData.append('image', imageFile);
    formData.append('min_text', minText);
    formData.append('news_date', newsDate);
    // Ключевые слова
    const keywordsRaw = (document.getElementById('news-keywords')?.value || '').trim();
    const keywords = keywordsRaw ? keywordsRaw.split(',').map(k => k.trim()).filter(Boolean) : [];
    if (keywords.length === 0) {
        showNotification('Укажите хотя бы одно ключевое слово', 'error');
<<<<<<< HEAD
=======
        return;
    }
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
>>>>>>> f2dce32861d0a839a91db714bc138bd0f31f8ba2
        return;
    }
    formData.append('type_id', typeId);
    keywords.forEach(kw => formData.append('keywords', kw));

    await createItemWithFile('news', formData, 'news');
}

// Загрузка типов новостей для селектов
async function loadNewsTypes() {
    try {
        const res = await makeAuthRequest('/api/news/types/');
        if (!res.ok) return;
        const types = await res.json();
        const sel = document.getElementById('news-type');
        if (sel) {
            sel.innerHTML = (types || []).map(t => `<option value="${t.id}">${t.type}</option>`).join('');
        }
        const mailingSel = document.getElementById('mailing-type');
        if (mailingSel) {
            mailingSel.innerHTML = (types || []).map(t => `<option value="${t.id}">${t.type}</option>`).join('');
        }
    } catch (_) {}
}

window.loadNewsTypes = loadNewsTypes;

// UI для типов новостей
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('news-type-create-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('news-type-submit-btn');
            const original = showLoading(btn);
            try {
                const val = document.getElementById('news-type-create-input').value.trim();
                if (!val) { showNotification('Введите тип', 'error'); return; }
                const res = await makeAuthRequest('/api/news/types/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: val })
                });
                if (res.ok) {
                    showNotification('Тип добавлен', 'success');
                    document.getElementById('news-type-create-input').value = '';
                    await renderNewsTypesList();
                    if (typeof loadNewsTypes === 'function') loadNewsTypes();
                } else {
                    const err = await res.json().catch(() => ({}));
                    showNotification(err.detail || 'Не удалось добавить тип', 'error');
                }
            } finally {
                hideLoading(btn, original);
            }
        });
    }
    renderNewsTypesList();
});

async function renderNewsTypesList() {
    try {
        const res = await makeAuthRequest('/api/news/types/');
        if (!res.ok) return;
        const types = await res.json();
        const list = document.getElementById('news-types-list');
        if (list) {
            list.innerHTML = (types || []).map(t => `<tr><td>${t.type}</td></tr>`).join('') || '<tr><td style="text-align:center;">Нет типов</td></tr>';
        }
    } catch (_) {}
}

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