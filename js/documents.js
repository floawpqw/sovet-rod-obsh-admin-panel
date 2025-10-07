// Функции для работы с документами
async function loadDocuments() {
    try {
        const response = await makeAuthRequest('/api/documents/');
        if (response.ok) {
            const documents = await response.json();
            renderDocuments(documents);
        } else {
            showNotification('Ошибка загрузки документов', 'error');
        }
    } catch (error) {
        showNotification('Ошибка загрузки документов: ' + error.message, 'error');
    }
}

function renderDocuments(documents) {
    const container = document.getElementById('documents-list');
    if (!container) return;
    
    if (!documents || documents.length === 0) {
        container.innerHTML = '<tr><td colspan="4" style="text-align: center;">Документов нет</td></tr>';
        return;
    }
    
    container.innerHTML = documents.map(document => `
        <tr>
            <td>${document.title}</td>
            <td>
                ${document.file_url ? 
                    `<a href="${toAbsoluteUrl(document.file_url)}" target="_blank" style="color: var(--primary-red); text-decoration: none;">
                        ${getFileIcon(document.file_url)} ${getFileName(document.file_url)}
                    </a>` : 
                    'Файл не загружен'
                }
            </td>
            <td>${document.file_size ? formatFileSize(document.file_size) : 'N/A'}</td>
            <td><span class="status-badge ${document.is_active ? 'status-published' : 'status-draft'}">${document.is_active ? 'Активен' : 'Неактивен'}</span></td>
            <td class="actions">
                <button class="action-btn warning" onclick="editDocument(${document.id})">Редактировать</button>
                <button class="action-btn danger" onclick="deleteItem('documents', ${document.id}, 'document')">Удалить</button>
                ${document.file_url ? `<button class="action-btn" onclick="downloadDocument('${toAbsoluteUrl(document.file_url)}')">Скачать</button>` : ''}
            </td>
        </tr>
    `).join('');
}

function getDocumentCategoryText(category) {
    const categories = {
        'legal': 'Юридические',
        'technical': 'Технические',
        'financial': 'Финансовые',
        'marketing': 'Маркетинг',
        'other': 'Другие'
    };
    return categories[category] || category;
}

// В текущей спецификации статусы документов управляются полем is_active

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        'pdf': '📄',
        'doc': '📝',
        'docx': '📝',
        'xls': '📊',
        'xlsx': '📊',
        'txt': '📃'
    };
    return icons[ext] || '📎';
}

function getFileName(url) {
    return url.split('/').pop();
}

function formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function handleDocumentCreate(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', document.getElementById('document-title').value);
    formData.append('is_active', document.getElementById('document-status').value === 'active');
    
    const file = document.getElementById('document-file').files[0];
    if (file) formData.append('file', file);
    
    await createItemWithFile('documents', formData, 'document');
}

function downloadDocument(url) {
    const headers = {};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    // Открываем прямую ссылку; если требуется авторизация по заголовку, используем X-Accel-Redirect на бекенде
    window.open(url, '_blank');
}

async function editDocument(id) {
    try {
        const response = await makeAuthRequest(`/api/documents/${id}/`);
        if (response.ok) {
            const document = await response.json();
            showEditModal('document', document);
        }
    } catch (error) {
        showNotification('Ошибка загрузки документа', 'error');
    }
}

// Глобальные функции
window.editDocument = editDocument;
window.downloadDocument = downloadDocument;