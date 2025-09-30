// Функции для работы с проектами
async function loadProjects() {
    try {
        const response = await makeAuthRequest('/api/projects/');
        if (response.ok) {
            const projects = await response.json();
            renderProjects(projects);
        } else {
            showNotification('Ошибка загрузки проектов', 'error');
        }
    } catch (error) {
        showNotification('Ошибка загрузки проектов: ' + error.message, 'error');
    }
}

function renderProjects(projects) {
    const container = document.getElementById('projects-list');
    if (!container) return;
    
    if (!projects || projects.length === 0) {
        container.innerHTML = '<tr><td colspan="6" style="text-align: center;">Проектов нет</td></tr>';
        return;
    }
    
    container.innerHTML = projects.map(project => `
        <tr>
            <td>${project.id}</td>
            <td>${project.title}</td>
            <td>${project.image_url ? `<img src="${project.image_url}" alt="${project.title}" style="max-width: 80px; max-height: 60px; border-radius: 4px;">` : 'Нет'}</td>
            <td><span class="status-badge ${project.is_active ? 'status-published' : 'status-draft'}">${project.is_active ? 'Активен' : 'Неактивен'}</span></td>
            <td>${project.category || 'Не указана'}</td>
            <td class="actions">
                <button class="action-btn warning" onclick="editProject('${project.id}')">Редактировать</button>
                <button class="action-btn danger" onclick="deleteItem('projects', '${project.id}', 'project')">Удалить</button>
            </td>
        </tr>
    `).join('');
}

async function handleProjectCreate(e) {
    e.preventDefault();
    
    // Считывание и валидация полей
    const title = (document.getElementById('project-title')?.value || '').trim();
    const content = (document.getElementById('project-content')?.value || '').trim();
    const teaser = (document.getElementById('project-teaser')?.value || '').trim();
    const theme = document.getElementById('project-theme')?.value || '';
    const category = document.getElementById('project-category')?.value || '';
    const activeEl = document.querySelector('input[name="project-active"]:checked');
    const keywordsRaw = (document.getElementById('project-keywords')?.value || '').trim();
    const imageFile = document.getElementById('project-image')?.files?.[0];

    if (!title || !content || !teaser || !theme || !category || !activeEl || !keywordsRaw || !imageFile) {
        showNotification('Заполните все обязательные поля, включая изображение и активность.', 'error');
        return;
    }

    // Проверка, что "Содержание" содержит HTML-блок (предпочтительно <div>)
    const template = document.createElement('template');
    template.innerHTML = content.trim();
    const hasElementNode = Array.from(template.content.childNodes).some(n => n.nodeType === 1);
    const hasDiv = template.content.querySelector('div') !== null;
    if (!hasElementNode) {
        showNotification('Поле «Содержание» должно содержать HTML-блок (например, <div>...</div>).', 'error');
        return;
    }
    if (!hasDiv) {
        showNotification('Рекомендуется использовать корневой <div> в поле «Содержание».', 'warning');
    }

    // Ключевые слова как список (через форму, не JSON)
    const keywords = keywordsRaw.split(',').map(k => k.trim()).filter(k => k.length > 0);
    if (keywords.length === 0) {
        showNotification('Укажите хотя бы одно ключевое слово.', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('body', content);
    formData.append('is_active', activeEl.value === 'true');
    formData.append('min_text', teaser);
    formData.append('theme', theme);
    formData.append('category', category);
    keywords.forEach(kw => formData.append('keywords', kw));
    formData.append('image', imageFile);

    await createItemWithFile('projects', formData, 'project');
}

async function editProject(id) {
    try {
        const response = await makeAuthRequest(`/api/projects/${id}/`);
        if (response.ok) {
            const project = await response.json();
            showEditModal('project', project);
        }
    } catch (error) {
        showNotification('Ошибка загрузки проекта', 'error');
    }
}

// Глобальные функции
window.editProject = editProject;