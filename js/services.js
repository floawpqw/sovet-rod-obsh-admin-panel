// Функции для работы с услугами
async function loadServices() {
    try {
        const response = await makeAuthRequest('/admin/api/services');
        if (response.ok) {
            const services = await response.json();
            renderServices(services);
        }
    } catch (error) {
        showNotification('Ошибка загрузки услуг', 'error');
    }
}

function renderServices(services) {
    const container = document.getElementById('services-list');
    if (!container) return;
    
    if (services.length === 0) {
        container.innerHTML = '<tr><td colspan="6" style="text-align: center;">Услуг нет</td></tr>';
        return;
    }
    
    container.innerHTML = services.map(service => `
        <tr>
            <td>${service.id}</td>
            <td>${service.title}</td>
            <td>${service.price ? `$${service.price}` : 'По запросу'}</td>
            <td>${service.category || 'Не указана'}</td>
            <td>${service.duration || 'Не указана'}</td>
            <td class="actions">
                <button class="action-btn warning" onclick="editService(${service.id})">Редактировать</button>
                <button class="action-btn danger" onclick="deleteItem('services', ${service.id}, 'service')">Удалить</button>
            </td>
        </tr>
    `).join('');
}

async function handleServiceCreate(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', document.getElementById('service-title').value);
    formData.append('description', document.getElementById('service-description').value);
    formData.append('price', document.getElementById('service-price').value || '0');
    formData.append('duration', document.getElementById('service-duration').value || '');
    formData.append('category', document.getElementById('service-category').value || '');
    formData.append('features', document.getElementById('service-features').value || '');
    
    const imageFile = document.getElementById('service-image').files[0];
    if (imageFile) formData.append('image', imageFile);
    
    await createItemWithFile('services', formData, 'service');
}

async function editService(id) {
    try {
        const response = await makeAuthRequest(`/admin/api/services/${id}`);
        if (response.ok) {
            const service = await response.json();
            showEditModal('service', service);
        }
    } catch (error) {
        showNotification('Ошибка загрузки услуги', 'error');
    }
}

// Глобальные функции
window.editService = editService;