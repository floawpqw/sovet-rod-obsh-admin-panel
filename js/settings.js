// Функции для работы с настройками
async function loadSettings() {
    try {
        const response = await makeAuthRequest('/api/settings');
        if (response.ok) {
            const settings = await response.json();
            renderSettings(settings);
        }
    } catch (error) {
        showNotification('Ошибка загрузки настроек', 'error');
    }
}

function renderSettings(settings) {
    if (!settings) return;
    
    const siteTitle = document.getElementById('site-title');
    const siteDescription = document.getElementById('site-description');
    const adminEmail = document.getElementById('admin-email');
    const maintenanceMode = document.getElementById('maintenance-mode');
    const siteLogoPreview = document.getElementById('site-logo-preview');
    
    if (siteTitle) siteTitle.value = settings.site_title || '';
    if (siteDescription) siteDescription.value = settings.site_description || '';
    if (adminEmail) adminEmail.value = settings.admin_email || '';
    if (maintenanceMode) maintenanceMode.value = settings.maintenance_mode ? 'true' : 'false';
    
    if (siteLogoPreview && settings.site_logo) {
        siteLogoPreview.src = settings.site_logo;
        siteLogoPreview.style.display = 'block';
    }
}

async function loadSystemStats() {
    try {
        const response = await makeAuthRequest('/api/stats');
        if (response.ok) {
            const stats = await response.json();
            renderStats(stats);
        }
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

function renderStats(stats) {
    const statsUsers = document.getElementById('stats-users');
    const statsNews = document.getElementById('stats-news');
    const statsProjects = document.getElementById('stats-projects');
    const statsQuestions = document.getElementById('stats-questions');
    const statsBanners = document.getElementById('stats-banners');
    const statsPartners = document.getElementById('stats-partners');
    const statsPolls = document.getElementById('stats-polls');
    
    if (statsUsers) statsUsers.textContent = stats.users || 0;
    if (statsNews) statsNews.textContent = stats.news || 0;
    if (statsProjects) statsProjects.textContent = stats.projects || 0;
    if (statsQuestions) statsQuestions.textContent = stats.questions || 0;
    if (statsBanners) statsBanners.textContent = stats.banners || 0;
    if (statsPartners) statsPartners.textContent = stats.partners || 0;
    if (statsPolls) statsPolls.textContent = stats.polls || 0;
}

async function handleSettingsSave(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('site_title', document.getElementById('site-title').value);
    formData.append('site_description', document.getElementById('site-description').value);
    formData.append('admin_email', document.getElementById('admin-email').value);
    formData.append('maintenance_mode', document.getElementById('maintenance-mode').value);
    
    const logoFile = document.getElementById('site-logo').files[0];
    if (logoFile) formData.append('site_logo', logoFile);
    
    const btn = document.getElementById('settings-submit-btn');
    const originalText = showLoading(btn);
    
    try {
        const response = await makeAuthRequest('/api/settings', {
            method: 'PUT',
            body: formData
        });
        
        if (response.ok) {
            showNotification('Настройки успешно сохранены!');
        } else {
            const errorData = await response.json().catch(() => ({}));
            showNotification(errorData.detail || 'Ошибка сохранения', 'error');
        }
    } catch (error) {
        showNotification('Ошибка: ' + error.message, 'error');
    } finally {
        hideLoading(btn, originalText);
    }
}

// Функции для модальных окон
function showEditModal(type, data) {
    currentEditId = data.id;
    currentEditType = type;
    
    let modalHtml = '';
    const modalContent = document.getElementById('modal-content');
    const modal = document.getElementById('edit-modal');
    
    if (!modalContent || !modal) return;
    
    switch(type) {
        case 'user':
            modalHtml = `
                <h3>Редактирование пользователя</h3>
                <form onsubmit="handleEditSubmit(event)">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value="${data.email}" required>
                    </div>
                    <div class="form-group">
                        <label>Имя</label>
                        <input type="text" name="name" value="${data.name || ''}">
                    </div>
                    <div class="form-group">
                        <label>Роль</label>
                        <select name="role">
                            <option value="user" ${data.role === 'user' ? 'selected' : ''}>Пользователь</option>
                            <option value="admin" ${data.role === 'admin' ? 'selected' : ''}>Администратор</option>
                            <option value="moderator" ${data.role === 'moderator' ? 'selected' : ''}>Модератор</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="submit">Сохранить</button>
                    </div>
                </form>
            `;
            break;
        
        case 'news':
            modalHtml = `
                <h3>Редактирование новости</h3>
                <form onsubmit="handleEditSubmit(event)">
                    <div class="form-group">
                        <label>Заголовок</label>
                        <input type="text" name="title" value="${data.title}" required>
                    </div>
                    <div class="form-group">
                        <label>Содержание</label>
                        <textarea name="content" required>${data.content}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Статус</label>
                        <select name="status">
                            <option value="published" ${data.status === 'published' ? 'selected' : ''}>Опубликовано</option>
                            <option value="draft" ${data.status === 'draft' ? 'selected' : ''}>Черновик</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="submit">Сохранить</button>
                    </div>
                </form>
            `;
            break;
            
        case 'project':
            modalHtml = `
                <h3>Редактирование проекта</h3>
                <form onsubmit="handleEditSubmit(event)">
                    <div class="form-group">
                        <label>Название</label>
                        <input type="text" name="title" value="${data.title}" required>
                    </div>
                    <div class="form-group">
                        <label>Описание</label>
                        <textarea name="description" required>${data.description}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Ссылка</label>
                        <input type="text" name="link" value="${data.link || ''}">
                    </div>
                    <div class="form-group">
                        <label>Технологии</label>
                        <input type="text" name="technologies" value="${data.technologies || ''}">
                    </div>
                    <div class="form-group">
                        <label>Статус</label>
                        <select name="status">
                            <option value="completed" ${data.status === 'completed' ? 'selected' : ''}>Завершен</option>
                            <option value="in_progress" ${data.status === 'in_progress' ? 'selected' : ''}>В разработке</option>
                            <option value="planned" ${data.status === 'planned' ? 'selected' : ''}>Запланирован</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="submit">Сохранить</button>
                    </div>
                </form>
            `;
            break;
            
        case 'banner':
            modalHtml = `
                <h3>Редактирование баннера</h3>
                <form onsubmit="handleEditSubmit(event)">
                    <div class="form-group">
                        <label>Название</label>
                        <input type="text" name="title" value="${data.title}" required>
                    </div>
                    <div class="form-group">
                        <label>Описание</label>
                        <textarea name="description">${data.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Ссылка</label>
                        <input type="text" name="link" value="${data.link || ''}">
                    </div>
                    <div class="form-group">
                        <label>Позиция</label>
                        <select name="position">
                            <option value="top" ${data.position === 'top' ? 'selected' : ''}>Верх</option>
                            <option value="middle" ${data.position === 'middle' ? 'selected' : ''}>Середина</option>
                            <option value="bottom" ${data.position === 'bottom' ? 'selected' : ''}>Низ</option>
                            <option value="sidebar" ${data.position === 'sidebar' ? 'selected' : ''}>Боковая панель</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Статус</label>
                        <select name="status">
                            <option value="active" ${data.status === 'active' ? 'selected' : ''}>Активен</option>
                            <option value="inactive" ${data.status === 'inactive' ? 'selected' : ''}>Неактивен</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="submit">Сохранить</button>
                    </div>
                </form>
            `;
            break;
            
        case 'partner':
            modalHtml = `
                <h3>Редактирование партнера</h3>
                <form onsubmit="handleEditSubmit(event)">
                    <div class="form-group">
                        <label>Название</label>
                        <input type="text" name="name" value="${data.name}" required>
                    </div>
                    <div class="form-group">
                        <label>Описание</label>
                        <textarea name="description">${data.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Веб-сайт</label>
                        <input type="text" name="website" value="${data.website || ''}">
                    </div>
                    <div class="form-group">
                        <label>Тип партнерства</label>
                        <select name="type">
                            <option value="strategic" ${data.type === 'strategic' ? 'selected' : ''}>Стратегический</option>
                            <option value="technical" ${data.type === 'technical' ? 'selected' : ''}>Технический</option>
                            <option value="marketing" ${data.type === 'marketing' ? 'selected' : ''}>Маркетинговый</option>
                            <option value="general" ${data.type === 'general' ? 'selected' : ''}>Общий</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Статус</label>
                        <select name="status">
                            <option value="active" ${data.status === 'active' ? 'selected' : ''}>Активен</option>
                            <option value="inactive" ${data.status === 'inactive' ? 'selected' : ''}>Неактивен</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="submit">Сохранить</button>
                    </div>
                </form>
            `;
            break;
            
        case 'poll':
            modalHtml = `
                <h3>Редактирование опроса</h3>
                <form onsubmit="handleEditSubmit(event)">
                    <div class="form-group">
                        <label>Вопрос</label>
                        <input type="text" name="question" value="${data.question}" required>
                    </div>
                    <div class="form-group">
                        <label>Описание</label>
                        <textarea name="description">${data.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Статус</label>
                        <select name="status">
                            <option value="active" ${data.status === 'active' ? 'selected' : ''}>Активен</option>
                            <option value="inactive" ${data.status === 'inactive' ? 'selected' : ''}>Неактивен</option>
                            <option value="completed" ${data.status === 'completed' ? 'selected' : ''}>Завершен</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Дата начала</label>
                        <input type="datetime-local" name="start_date" value="${data.start_date || ''}">
                    </div>
                    <div class="form-group">
                        <label>Дата окончания</label>
                        <input type="datetime-local" name="end_date" value="${data.end_date || ''}">
                    </div>
                    <div class="form-actions">
                        <button type="submit">Сохранить</button>
                    </div>
                </form>
            `;
            break;
    }
    
    modalContent.innerHTML = modalHtml;
    modal.style.display = 'block';
}

async function handleEditSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await makeAuthRequest(`/api/${currentEditType}s/${currentEditId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showNotification('Изменения сохранены!');
            document.getElementById('edit-modal').style.display = 'none';
            refreshData(`${currentEditType}s`);
        }
    } catch (error) {
        showNotification('Ошибка сохранения', 'error');
    }
}

// Глобальные функции
window.handleEditSubmit = handleEditSubmit;