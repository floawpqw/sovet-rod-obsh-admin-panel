// Функции для работы с баннерами
async function loadBanners() {
    try {
        const response = await makeAuthRequest('/api/banners/');
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
        container.innerHTML = '<tr><td colspan="5" style="text-align: center;">Баннеров нет</td></tr>';
        return;
    }
    
    container.innerHTML = banners.map(banner => `
        <tr>
            <td>${banner.title || '—'}</td>
            <td>${banner.description || '—'}</td>
            <td>${banner.image_url ? `<img src="${resolveFileUrl(banner.image_url)}" alt="banner" style="max-width: 80px; max-height: 60px; border-radius: 4px;">` : 'Нет'}</td>
            <td>${banner.count_order ?? '—'}</td>
            <td><span class="status-badge ${banner.is_active ? 'status-published' : 'status-draft'}">${banner.is_active ? 'Активен' : 'Неактивен'}</span></td>
            <td class="actions">
                <button class="action-btn warning" onclick="editBanner('${banner.id}')">Редактировать</button>
                <button class="action-btn danger" onclick="deleteItem('banners', '${banner.id}', 'banner')">Удалить</button>
            </td>
        </tr>
    `).join('');
}

async function handleBannerCreate(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', document.getElementById('banner-title').value || '');
    formData.append('description', document.getElementById('banner-description').value || '');
    const countOrder = Number(document.getElementById('banner-position').value || '1');
    formData.append('count_order', countOrder);
    formData.append('is_active', document.getElementById('banner-status').value === 'active');
    
    const imageFile = document.getElementById('banner-image').files[0];
    if (imageFile) formData.append('image', imageFile);
    
    await createItemWithFile('banners', formData, 'banner');
}

// Тоггла статуса нет в спецификации, используйте PATCH со схемой update при необходимости

async function editBanner(id) {
    try {
        const response = await makeAuthRequest(`/api/banners/${id}/`);
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