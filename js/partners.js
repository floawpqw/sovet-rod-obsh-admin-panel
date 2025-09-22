// Функции для работы с партнерами
async function loadPartners() {
    try {
        const response = await makeAuthRequest('/api/partners');
        if (response.ok) {
            const partners = await response.json();
            renderPartners(partners);
        } else {
            showNotification('Ошибка загрузки партнеров', 'error');
        }
    } catch (error) {
        showNotification('Ошибка загрузки партнеров: ' + error.message, 'error');
    }
}

function renderPartners(partners) {
    const container = document.getElementById('partners-list');
    if (!container) return;
    
    if (!partners || partners.length === 0) {
        container.innerHTML = '<tr><td colspan="6" style="text-align: center;">Партнеров нет</td></tr>';
        return;
    }
    
    container.innerHTML = partners.map(partner => `
        <tr>
            <td>${partner.id}</td>
            <td>${partner.name}</td>
            <td>${partner.logo_url ? `<img src="${partner.logo_url}" alt="${partner.name}" style="max-width: 80px; max-height: 60px; border-radius: 4px;">` : 'Нет'}</td>
            <td>${getPartnerTypeText(partner.type)}</td>
            <td><span class="status-badge ${partner.status === 'active' ? 'status-published' : 'status-draft'}">${partner.status === 'active' ? 'Активен' : 'Неактивен'}</span></td>
            <td class="actions">
                <button class="action-btn warning" onclick="editPartner(${partner.id})">Редактировать</button>
                <button class="action-btn danger" onclick="deleteItem('partners', ${partner.id}, 'partner')">Удалить</button>
                <button class="action-btn secondary" onclick="togglePartnerStatus(${partner.id}, '${partner.status}')">${partner.status === 'active' ? 'Деактивировать' : 'Активировать'}</button>
            </td>
        </tr>
    `).join('');
}

async function handlePartnerCreate(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', document.getElementById('partner-name').value);
    formData.append('description', document.getElementById('partner-description').value);
    formData.append('website', document.getElementById('partner-website').value || '');
    formData.append('type', document.getElementById('partner-type').value);
    formData.append('status', document.getElementById('partner-status').value);
    
    const logoFile = document.getElementById('partner-logo').files[0];
    if (logoFile) formData.append('logo', logoFile);
    
    await createItemWithFile('partners', formData, 'partner');
}

async function togglePartnerStatus(id, currentStatus) {
    try {
        const response = await makeAuthRequest(`/api/partners/${id}/toggle-status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: currentStatus === 'active' ? 'inactive' : 'active' })
        });
        
        if (response.ok) {
            showNotification('Статус партнера изменен!');
            loadPartners();
        }
    } catch (error) {
        showNotification('Ошибка изменения статуса партнера', 'error');
    }
}

async function editPartner(id) {
    try {
        const response = await makeAuthRequest(`/api/partners/${id}`);
        if (response.ok) {
            const partner = await response.json();
            showEditModal('partner', partner);
        }
    } catch (error) {
        showNotification('Ошибка загрузки партнера', 'error');
    }
}

// Глобальные функции
window.editPartner = editPartner;
window.togglePartnerStatus = togglePartnerStatus;