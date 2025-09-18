// Функции для работы с проектами
async function loadProjects() {
    try {
        const response = await makeAuthRequest('/api/projects');
        if (response.ok) {
            const projects = await response.json();
            renderProjects(projects);
        }
    } catch (error) {
        showNotification('Ошибка загрузки проектов', 'error');
    }
}

function renderProjects(projects) {
    const container = document.getElementById('projects-list');
    if (!container) return;
    
    if (projects.length === 0) {
        container.innerHTML = '<tr><td colspan="6" style="text-align: center;">Проектов нет</td></tr>';
        return;
    }
    
    container.innerHTML = projects.map(project => `
        <tr>
            <td>${project.id}</td>
            <td>${project.title}</td>
            <td>${project.image_url ? `<img src="${project.image_url}" alt="${project.title}" style="max-width: 80px; max-height: 60px; border-radius: 4px;">` : 'Нет'}</td>
            <td><span class="status-badge ${getStatusClass(project.status)}">${getStatusText(project.status)}</span></td>
            <td>${project.category || 'Не указана'}</td>
            <td class="actions">
                <button class="action-btn warning" onclick="editProject(${project.id})">Редактировать</button>
                <button class="action-btn danger" onclick="deleteItem('projects', ${project.id}, 'project')">Удалить</button>
            </td>
        </tr>
    `).join('');
}

async function handleProjectCreate(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', document.getElementById('project-title').value);
    formData.append('description', document.getElementById('project-description').value);
    formData.append('link', document.getElementById('project-link').value || '');
    formData.append('technologies', document.getElementById('project-tech').value || '');
    formData.append('status', document.getElementById('project-status').value);
    formData.append('category', document.getElementById('project-category').value || '');
    
    const imageFile = document.getElementById('project-image').files[0];
    if (imageFile) formData.append('image', imageFile);
    
    await createItemWithFile('projects', formData, 'project');
}

async function editProject(id) {
    try {
        const response = await makeAuthRequest(`/api/projects/${id}`);
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