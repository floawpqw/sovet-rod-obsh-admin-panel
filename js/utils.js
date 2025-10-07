// Глобальные переменные
const API_BASE = 'https://terlynedev.space';
let authToken = localStorage.getItem('authToken');
let refreshToken = localStorage.getItem('refreshToken');
let currentEditId = null;
let currentEditType = null;

// Утилиты
function setTokens(accessToken, newRefreshToken) {
	authToken = accessToken || null;
	refreshToken = newRefreshToken || null;
	if (authToken) {
		localStorage.setItem('authToken', authToken);
	} else {
		localStorage.removeItem('authToken');
	}
	if (refreshToken) {
		localStorage.setItem('refreshToken', refreshToken);
	} else {
		localStorage.removeItem('refreshToken');
	}
}

function clearTokens() {
	setTokens(null, null);
}

window.setTokens = setTokens;
window.clearTokens = clearTokens;
function showNotification(message, type = 'success', elementId = 'notification') {
    const notification = document.getElementById(elementId);
    if (notification) {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

// Построение корректной ссылки для файлов, отданных бэком как относительный путь
function resolveFileUrl(relativePath) {
    if (!relativePath) return '';
    const trimmed = String(relativePath).replace(/^\/+/, '').replace(/\/+$/, '');
    return `${API_BASE}/api/files/${encodeURI(trimmed)}/`;
}

// Универсальное обновление списков после мутаций
window.refreshData = function refreshData(endpoint) {
    switch (endpoint) {
        case 'news': return typeof loadNews === 'function' && loadNews();
        case 'projects': return typeof loadProjects === 'function' && loadProjects();
        case 'banners': return typeof loadBanners === 'function' && loadBanners();
        case 'partners': return typeof loadPartners === 'function' && loadPartners();
        case 'polls': return typeof loadPolls === 'function' && loadPolls();
        case 'subscribers':
        case 'subscriptions': return typeof loadSubscriptions === 'function' && loadSubscriptions();
        case 'documents': return typeof loadDocuments === 'function' && loadDocuments();
        case 'contacts': return typeof loadContacts === 'function' && loadContacts();
        case 'events': return typeof loadEvents === 'function' && loadEvents();
        case 'users': return typeof loadUsers === 'function' && loadUsers();
        default: return;
    }
}

// Базовая модалка редактирования, чтобы не падать при вызове showEditModal
window.showEditModal = function showEditModal(entityType, data) {
    const modal = document.getElementById('edit-modal');
    const content = document.getElementById('modal-content');
    if (!modal || !content) return;
    const pretty = document.createElement('pre');
    pretty.textContent = JSON.stringify(data, null, 2);
    content.innerHTML = `
      <h3>Детали: ${getTypeName(entityType) || entityType}</h3>
    `;
    content.appendChild(pretty);
    modal.style.display = 'block';
}

window.resolveFileUrl = resolveFileUrl;

function showLoading(button) {
    if (!button) return '';
    const originalText = button.innerHTML;
    button.innerHTML = '<div class="loading"></div>';
    button.disabled = true;
    return originalText;
}

function hideLoading(button, originalText) {
    if (!button) return;
    button.innerHTML = originalText;
    button.disabled = false;
}

function showAdminPanel() {
    const authSection = document.getElementById('auth-section');
    const adminSection = document.getElementById('admin-section');
    if (authSection && adminSection) {
        authSection.style.display = 'none';
        adminSection.style.display = 'block';
    }
}

function showAuthForm() {
    const authSection = document.getElementById('auth-section');
    const adminSection = document.getElementById('admin-section');
    if (authSection && adminSection) {
        authSection.style.display = 'block';
        adminSection.style.display = 'none';
    }
}

function getStatusClass(status) {
    const classes = {
        'completed': 'status-completed',
        'in_progress': 'status-in-progress',
        'planned': 'status-planned',
        'published': 'status-published',
        'draft': 'status-draft',
        'active': 'status-published',
        'inactive': 'status-draft',
        'true': 'status-published',
        'false': 'status-draft'
    };
    return classes[status] || 'status-draft';
}

function getStatusText(status) {
    const texts = {
        'completed': 'Завершен',
        'in_progress': 'В разработке',
        'planned': 'Запланирован',
        'published': 'Опубликовано',
        'draft': 'Черновик',
        'active': 'Активен',
        'inactive': 'Неактивен',
        'true': 'Включен',
        'false': 'Выключен'
    };
    return texts[status] || status;
}

function initImagePreview(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    if (input && preview) {
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                }
                reader.readAsDataURL(file);
            }
        });
    }
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

function getTypeName(type) {
    const names = {
        'user': 'пользователя',
        'news': 'новость',
        'project': 'проект',
        'banner': 'баннер',
        'partner': 'партнера',
        'poll': 'опрос',
        'question': 'вопрос',
        'service': 'услугу',
        'event': 'мероприятие'
    };
    return names[type] || type;
}

function toggleForm(type) {
    const form = document.getElementById(`${type}-form`);
    const btn = document.getElementById(`toggle-${type}-form`);
    
    if (form && btn) {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
        btn.textContent = form.style.display === 'none' ? 
            `+ Добавить ${getTypeName(type)}` : 
            `− Скрыть форму`;
        
        if (form.style.display === 'none') {
            const formElement = document.getElementById(`${type}-create-form`);
            if (formElement) formElement.reset();
            
            const preview = document.getElementById(`${type}-image-preview`);
            if (preview) {
                preview.style.display = 'none';
                preview.src = '';
            }
        }
    }
}

function getBannerPositionText(position) {
    const positions = {
        'top': 'Верх',
        'middle': 'Середина',
        'bottom': 'Низ',
        'sidebar': 'Боковая панель'
    };
    return positions[position] || position;
}

function getPartnerTypeText(type) {
    const types = {
        'strategic': 'Стратегический',
        'technical': 'Технический',
        'marketing': 'Маркетинговый',
        'general': 'Общий'
    };
    return types[type] || type;
}

function getPollStatusClass(status) {
    const classes = {
        'active': 'status-published',
        'inactive': 'status-draft',
        'completed': 'status-completed'
    };
    return classes[status] || 'status-draft';
}

function getPollStatusText(status) {
    const texts = {
        'active': 'Активен',
        'inactive': 'Неактивен',
        'completed': 'Завершен'
    };
    return texts[status] || status;
}

// Преобразование ссылок на медиа/файлы в абсолютные URL
function toAbsoluteUrl(url) {
    if (!url) return '';
    try {
        // уже абсолютный
        const u = new URL(url, API_BASE);
        // Если url начинается с http(s), URL вернёт исходный
        // Если относительный (начинается с / или без слэша), базой будет API_BASE
        return u.href;
    } catch (_) {
        return url;
    }
}

// Глобальный рефреш данных списков после CRUD
window.refreshData = function refreshData(endpointKey) {
    try {
        switch (endpointKey) {
            case 'users':
                if (typeof loadUsers === 'function') loadUsers();
                break;
            case 'news':
                if (typeof loadNews === 'function') loadNews();
                if (typeof loadNewsTypes === 'function') loadNewsTypes();
                break;
            case 'projects':
                if (typeof loadProjects === 'function') loadProjects();
                break;
            case 'banners':
                if (typeof loadBanners === 'function') loadBanners();
                break;
            case 'partners':
                if (typeof loadPartners === 'function') loadPartners();
                break;
            case 'polls':
                if (typeof loadPolls === 'function') loadPolls();
                break;
            case 'subscriptions':
                if (typeof loadSubscriptions === 'function') loadSubscriptions();
                break;
            case 'documents':
                if (typeof loadDocuments === 'function') loadDocuments();
                break;
            case 'contacts':
                if (typeof loadContacts === 'function') loadContacts();
                break;
            case 'questions':
                if (typeof loadQuestions === 'function') loadQuestions();
                break;
            case 'events':
                if (typeof loadEvents === 'function') loadEvents();
                break;
            default:
                // No-op
                break;
        }
    } catch (e) {
        console.error('refreshData error:', e);
    }
};

// Текущий пользователь и роль-зависимый UI
window.currentUser = null;
function applyRoleUI(user) {
    try {
        window.currentUser = user || null;
        const usersNavLink = document.querySelector('a.nav-link[href="#users"]');
        const usersSection = document.getElementById('users');
        const isAdmin = Boolean(user && (user.role === 'admin' || user.is_admin === true));
        if (usersNavLink) {
            if (!isAdmin) {
                // скрыть вкладку "Пользователи" для не-админа
                const li = usersNavLink.closest('li');
                if (li) li.style.display = 'none';
                if (usersSection) usersSection.style.display = 'none';

                // если активной была секция пользователей — переключить на доступную вкладку
                const activeLink = document.querySelector('.nav-links a.nav-link.active');
                const activeUsers = activeLink && activeLink.getAttribute('href') === '#users';
                const usersActive = usersSection && usersSection.classList.contains('active');
                if (activeUsers || usersActive) {
                    if (activeLink) activeLink.classList.remove('active');
                    if (usersSection) usersSection.classList.remove('active');

                    // приоритет: Новости -> Личный кабинет -> первый доступный линк
                    let fallback = document.querySelector('a.nav-link[href="#news"]');
                    if (!fallback) fallback = document.querySelector('a.nav-link[href="#profile"]');
                    if (!fallback) fallback = document.querySelector('.nav-links a.nav-link');
                    if (fallback) {
                        fallback.classList.add('active');
                        const targetId = (fallback.getAttribute('href') || '').replace('#', '');
                        const targetSection = document.getElementById(targetId);
                        if (targetSection) targetSection.classList.add('active');
                        // подгрузить данные, если возможно
                        if (targetId === 'news' && typeof loadNews === 'function') loadNews();
                    }
                }
            } else {
                const li = usersNavLink.closest('li');
                if (li) li.style.display = '';
            }
        }
    } catch (e) {
        console.warn('applyRoleUI error:', e);
    }
}

window.toAbsoluteUrl = toAbsoluteUrl;
window.applyRoleUI = applyRoleUI;

// Универсальное модальное окно редактирования
function formatDateYYYYMMDD(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function formatDateTimeLocal(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day}T${hh}:${mm}`;
}

const editConfigs = {
    user: {
        endpoint: (id) => `/api/users/${id}/`,
        fields: [
            { name: 'username', label: 'Имя пользователя', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' },
        ],
        content: 'json'
    },
    news: {
        endpoint: (id) => `/api/news/${id}/`,
        fields: [
            { name: 'title', label: 'Заголовок', type: 'text' },
            { name: 'news_url', label: 'Ссылка на новость', type: 'textarea' },
            { name: 'min_text', label: 'Краткий текст', type: 'textarea' },
            { name: 'news_date', label: 'Дата новости', type: 'date', formatOut: (v) => v },
            { name: 'type_id', label: 'Тип новости', type: 'select', source: 'newsTypes' },
            { name: 'image', label: 'Изображение', type: 'file' },
        ],
        content: 'form'
    },
    project: {
        endpoint: (id) => `/api/projects/${id}/`,
        fields: [
            { name: 'title', label: 'Заголовок', type: 'text' },
            { name: 'project_url', label: 'Ссылка на проект', type: 'textarea' },
            { name: 'min_text', label: 'Краткий текст', type: 'textarea' },
            { name: 'theme', label: 'Тематика', type: 'text' },
            { name: 'category', label: 'Категория', type: 'text' },
            { name: 'is_active', label: 'Активен', type: 'checkbox' },
            { name: 'keywords', label: 'Ключевые слова (через запятую)', type: 'text', serialize: 'csv' },
            { name: 'image', label: 'Изображение', type: 'file' },
        ],
        content: 'form'
    },
    banner: {
        endpoint: (id) => `/api/banners/${id}/`,
        fields: [
            { name: 'title', label: 'Название', type: 'text' },
            { name: 'description', label: 'Описание', type: 'textarea' },
            { name: 'count_order', label: 'Позиция', type: 'number' },
            { name: 'is_active', label: 'Активен', type: 'checkbox' },
            { name: 'image', label: 'Изображение', type: 'file' },
        ],
        content: 'form'
    },
    partner: {
        endpoint: (id) => `/api/partners/${id}/`,
        fields: [
            { name: 'partner_name', label: 'Название партнера', type: 'text' },
            { name: 'partner_url', label: 'Сайт', type: 'text' },
            { name: 'count_order', label: 'Порядок', type: 'number' },
            { name: 'logo', label: 'Логотип', type: 'file' },
        ],
        content: 'form'
    },
    poll: {
        endpoint: (id) => `/api/polls/${id}/`,
        fields: [
            { name: 'title', label: 'Вопрос', type: 'text' },
            { name: 'is_active', label: 'Активен', type: 'checkbox' },
            { name: 'options', label: 'Варианты (по одному в строке)', type: 'textarea', serialize: 'lines' },
        ],
        content: 'json'
    },
    document: {
        endpoint: (id) => `/api/documents/${id}/`,
        fields: [
            { name: 'title', label: 'Название', type: 'text' },
            { name: 'is_active', label: 'Активен', type: 'checkbox' },
            { name: 'file', label: 'Файл', type: 'file' },
        ],
        content: 'form'
    },
    event: {
        endpoint: (id) => `/api/events/${id}/`,
        fields: [
            { name: 'title', label: 'Название', type: 'text' },
            { name: 'description', label: 'Описание', type: 'textarea' },
            { name: 'event_date', label: 'Дата события', type: 'datetime-local' },
            { name: 'location', label: 'Локация', type: 'text' },
            { name: 'is_active', label: 'Активен', type: 'checkbox' },
            { name: 'image', label: 'Изображение', type: 'file' },
        ],
        content: 'form'
    },
};

function getEditFieldValue(type, fieldName, data) {
    const value = data[fieldName];
    if (fieldName === 'news_date') return formatDateYYYYMMDD(value);
    if (fieldName === 'event_date') return formatDateTimeLocal(value);
    if (fieldName === 'type_id') return data.type_id || (data.type && data.type.id) || '';
    if (fieldName === 'options' && Array.isArray(data.options)) return (data.options || []).join('\n');
    if (fieldName === 'keywords' && Array.isArray(data.keywords)) return (data.keywords || []).join(', ');
    if (typeof value === 'boolean') return value;
    return value == null ? '' : value;
}

window.showEditModal = function showEditModal(type, data) {
    currentEditType = type;
    currentEditId = data && (data.id || data._id || data.uuid);
    const config = editConfigs[type];
    const modalContent = document.getElementById('modal-content');
    const modal = document.getElementById('edit-modal');
    if (!config || !modalContent || !modal) return;

    let formHtml = `<h3>Редактировать ${getTypeName(type)}</h3><form id="edit-form">`;
    config.fields.forEach(f => {
        const val = getEditFieldValue(type, f.name, data);
        formHtml += `<div class="form-group">`;
        if (f.type !== 'checkbox') {
            formHtml += `<label for="edit-${f.name}">${f.label}</label>`;
        }
        if (f.type === 'textarea') {
            formHtml += `<textarea id="edit-${f.name}" ${f.required ? 'required' : ''}>${val || ''}</textarea>`;
        } else if (f.type === 'select') {
            formHtml += `<select id="edit-${f.name}"></select>`;
        } else if (f.type === 'checkbox') {
            formHtml += `<label><input type="checkbox" id="edit-${f.name}" ${val ? 'checked' : ''}> ${f.label}</label>`;
        } else if (f.type === 'file') {
            formHtml += `<input type="file" id="edit-${f.name}">`;
        } else {
            formHtml += `<input type="${f.type}" id="edit-${f.name}" value="${val || ''}">`;
        }
        formHtml += `</div>`;
    });
    formHtml += `<div class="form-actions">
        <button type="submit" id="edit-submit-btn">Сохранить</button>
        <button type="button" id="edit-cancel-btn" class="secondary">Отмена</button>
    </div></form>`;

    modalContent.innerHTML = formHtml;
    modal.style.display = 'block';

    // Инициализация источников для селектов
    config.fields.forEach(f => {
        if (f.type === 'select' && f.source === 'newsTypes') {
            if (typeof loadNewsTypes === 'function') {
                loadNewsTypes().then(() => {
                    const sel = document.getElementById(`edit-${f.name}`);
                    const current = getEditFieldValue(type, f.name, data);
                    if (sel && current != null) sel.value = String(current);
                }).catch(() => {});
            }
        }
    });

    const form = document.getElementById('edit-form');
    const cancelBtn = document.getElementById('edit-cancel-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', () => { modal.style.display = 'none'; });
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await submitEdit(config);
        });
    }
};

async function submitEdit(config) {
    const btn = document.getElementById('edit-submit-btn');
    const original = showLoading(btn);
    try {
        const method = 'PATCH';
        let options = { method };
        if (config.content === 'form') {
            const fd = new FormData();
            for (const f of config.fields) {
                if (f.type === 'file') {
                    const fileInput = document.getElementById(`edit-${f.name}`);
                    const file = fileInput && fileInput.files && fileInput.files[0];
                    if (file) fd.append(f.name, file);
                } else if (f.serialize === 'csv') {
                    const raw = document.getElementById(`edit-${f.name}`)?.value || '';
                    const items = raw.split(',').map(s => s.trim()).filter(Boolean);
                    if (f.name === 'keywords') {
                        items.forEach(it => fd.append('keywords', it));
                    } else {
                        fd.append(f.name, items.join(','));
                    }
                } else if (f.type === 'checkbox') {
                    const el = document.getElementById(`edit-${f.name}`);
                    fd.append(f.name, el && el.checked ? true : false);
                } else {
                    const val = document.getElementById(`edit-${f.name}`)?.value;
                    if (val !== undefined) fd.append(f.name, val);
                }
            }
            options.body = fd;
        } else {
            const body = {};
            for (const f of config.fields) {
                if (f.type === 'file') continue;
                if (f.serialize === 'lines') {
                    const raw = document.getElementById(`edit-${f.name}`)?.value || '';
                    body[f.name] = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
                } else if (f.type === 'checkbox') {
                    const el = document.getElementById(`edit-${f.name}`);
                    body[f.name] = el && el.checked ? true : false;
                } else if (f.serialize === 'csv') {
                    const raw = document.getElementById(`edit-${f.name}`)?.value || '';
                    body[f.name] = raw.split(',').map(s => s.trim()).filter(Boolean);
                } else {
                    body[f.name] = document.getElementById(`edit-${f.name}`)?.value || null;
                }
            }
            options.headers = { 'Content-Type': 'application/json' };
            options.body = JSON.stringify(body);
        }

        const endpointUrl = config.endpoint(currentEditId);
        const res = await makeAuthRequest(endpointUrl, options);
        if (res.ok) {
            showNotification('Изменения сохранены');
            const modal = document.getElementById('edit-modal');
            if (modal) modal.style.display = 'none';
            // refresh by type
            const typeToEndpoint = {
                user: 'users',
                news: 'news',
                project: 'projects',
                banner: 'banners',
                partner: 'partners',
                poll: 'polls',
                document: 'documents',
                event: 'events',
            };
            if (typeof refreshData === 'function') refreshData(typeToEndpoint[currentEditType]);
        } else {
            const err = await res.json().catch(() => ({}));
            showNotification(err.detail || 'Не удалось сохранить изменения', 'error');
        }
    } catch (e) {
        showNotification('Ошибка сохранения', 'error');
    } finally {
        hideLoading(btn, original);
    }
}

window.showEditModal = showEditModal;