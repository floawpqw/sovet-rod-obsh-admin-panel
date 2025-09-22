// Функции для работы с баннерами
async function loadBanners() {
    try {
        const response = await makeAuthRequest('/api/banners');
        if (response.ok) {
            const banners = await response.json();
            renderBanners(banners);
        } else {
            showNotification('Ошибка загрузки баннеров', 'error');
        }
    } catch (error) {
        showNotification('Ошибка загрузки баннеров: ' + error.message, 'error');
    }
}

function renderBanners(banners) {
    const container = document.getElementById('banners-list');
    if (!container) return;
    
    if (!banners || banners.length === 0) {
        container.innerHTML = '<tr><td colspan="6" style="text-align: center;">Баннеров нет</td></tr>';
        return;
    }
    
    container.innerHTML = banners.map(banner => `
        <tr>
            <td>${banner.id}</td>
            <td>${banner.title}</td>
            <td>${banner.image_url ? `<img src="${banner.image_url}" alt="${banner.title}" style="max-width: 80px; max-height: 60px; border-radius: 4px;">` : 'Нет'}</td>
            <td>${getBannerPositionText(banner.position)}</td>
            <td><span class="status-badge ${banner.status === 'active' ? 'status-published' : 'status-draft'}">${banner.status === 'active' ? 'Активен' : 'Неактивен'}</span></td>
            <td class="actions">
                <button class="action-btn warning" onclick="editBanner(${banner.id})">Редактировать</button>
                <button class="action-btn danger" onclick="deleteItem('banners', ${banner.id}, 'banner')">Удалить</button>
                <button class="action-btn secondary" onclick="toggleBannerStatus(${banner.id}, '${banner.status}')">${banner.status === 'active' ? 'Деактивировать' : 'Активировать'}</button>
            </td>
        </tr>
    `).join('');
}

async function handleBannerCreate(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', document.getElementById('banner-title').value);
    formData.append('description', document.getElementById('banner-description').value);
    formData.append('link', document.getElementById('banner-link').value || '');
    formData.append('position', document.getElementById('banner-position').value);
    formData.append('status', document.getElementById('banner-status').value);
    
    const imageFile = document.getElementById('banner-image').files[0];
    if (imageFile) formData.append('image', imageFile);
    
    await createItemWithFile('banners', formData, 'banner');
}

async function toggleBannerStatus(id, currentStatus) {
    try {
        const response = await makeAuthRequest(`/api/banners/${id}/toggle-status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: currentStatus === 'active' ? 'inactive' : 'active' })
        });
        
        if (response.ok) {
            showNotification('Статус баннера изменен!');
            loadBanners();
        }
    } catch (error) {
        showNotification('Ошибка изменения статуса баннера', 'error');
    }
}

async function editBanner(id) {
    try {
        const response = await makeAuthRequest(`/api/banners/${id}`);
        if (response.ok) {
            const banner = await response.json();
            showEditModal('banner', banner);
        }
    } catch (error) {
        showNotification('Ошибка загрузки баннера', 'error');
    }
}

// Глобальные функции
window.editBanner = editBanner;
window.toggleBannerStatus = toggleBannerStatus;