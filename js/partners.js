// Функции для работы с партнерами
async function loadPartners() {
    try {
        const response = await makeAuthRequest('/api/partners/');
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
        container.innerHTML = '<tr><td colspan="3" style="text-align: center;">Партнеров нет</td></tr>';
        return;
    }
    
    container.innerHTML = partners.map(partner => `
        <tr>
            <td>${partner.partner_name}</td>
            <td>${partner.logo_url ? `<img src="${resolveFileUrl(partner.logo_url)}" alt="${partner.partner_name}" style="max-width: 80px; max-height: 60px; border-radius: 4px;">` : 'Нет'}</td>
            <td>${partner.partner_url || '—'}</td>
            <td class="actions">
                <button class="action-btn warning" onclick="editPartner('${partner.id}')">Редактировать</button>
                <button class="action-btn danger" onclick="deleteItem('partners', '${partner.id}', 'partner')">Удалить</button>
            </td>
        </tr>
    `).join('');
}

async function handlePartnerCreate(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('partner_name', document.getElementById('partner-name').value);
    formData.append('partner_url', document.getElementById('partner-website').value || '');
    const countOrder = 1;
    formData.append('count_order', countOrder);
    
    const logoFile = document.getElementById('partner-logo').files[0];
    if (logoFile) formData.append('logo', logoFile);
    
    await createItemWithFile('partners', formData, 'partner');
}

// Статусы не переключаются отдельным эндпоинтом согласно спецификации

async function editPartner(id) {
    try {
        const response = await makeAuthRequest(`/api/partners/${id}/`);
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