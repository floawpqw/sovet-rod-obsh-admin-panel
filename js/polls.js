// Функции для работы с опросами
async function loadPolls() {
    try {
        const response = await makeAuthRequest('/api/polls/');
        if (response.ok) {
            const polls = await response.json();
            renderPolls(polls);
        } else {
            showNotification('Ошибка загрузки опросов', 'error');
        }
    } catch (error) {
        showNotification('Ошибка загрузки опросов: ' + error.message, 'error');
    }
}

function renderPolls(polls) {
    const container = document.getElementById('polls-list');
    if (!container) return;
    
    if (!polls || polls.length === 0) {
        container.innerHTML = '<tr><td colspan="5" style="text-align: center;">Опросов нет</td></tr>';
        return;
    }
    
    container.innerHTML = polls.map(poll => `
        <tr>
            <td>${poll.title || poll.theme || ''}</td>
            <td>${Array.isArray(poll.options) ? poll.options.length : (poll.questions || []).length}</td>
            <td>—</td>
            <td><span class="status-badge ${poll.is_active ? 'status-published' : 'status-draft'}">${poll.is_active ? 'Активен' : 'Неактивен'}</span></td>
            <td class="actions">
                <button class="action-btn warning" onclick="editPoll('${poll.id}')">Редактировать</button>
                <button class="action-btn danger" onclick="deleteItem('polls', '${poll.id}', 'poll')">Удалить</button>
            </td>
        </tr>
    `).join('');
}

async function handlePollCreate(e) {
    e.preventDefault();
    
    const title = document.getElementById('poll-question').value;
    const isActive = document.getElementById('poll-status').value !== 'inactive';
    const startAt = document.getElementById('poll-start-date').value;
    const endAt = document.getElementById('poll-end-date').value;

    const optionsContainer = document.getElementById('poll-options-container');
    const optionInputs = optionsContainer ? optionsContainer.querySelectorAll('input[name="poll-options[]"]') : [];
    const options = Array.from(optionInputs).map(i => i.value.trim()).filter(Boolean);
    if (options.length < 2) {
        showNotification('Добавьте минимум два варианта ответа', 'error');
        return;
    }

    const body = {
        title,
        is_active: isActive,
        options,
        start_at: startAt ? new Date(startAt).toISOString() : null,
        end_at: endAt ? new Date(endAt).toISOString() : null,
    };
    const created = await createItem('polls', body, 'poll');
    if (!created) return;
}

function initPollForm() {
    const addOptionBtn = document.getElementById('add-option-btn');
    const optionsContainer = document.getElementById('poll-options-container');
    
    if (addOptionBtn && optionsContainer) {
        addOptionBtn.addEventListener('click', () => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'poll-option';
            optionDiv.innerHTML = `
                <input type="text" name="poll-options[]" placeholder="Вариант ответа" required>
                <button type="button" class="danger remove-option">×</button>
            `;
            optionsContainer.appendChild(optionDiv);
            
            // Добавляем обработчик удаления
            optionDiv.querySelector('.remove-option').addEventListener('click', function() {
                if (optionsContainer.children.length > 1) {
                    optionDiv.remove();
                }
            });
        });
        
        // Инициализируем обработчики удаления для существующих options
        optionsContainer.querySelectorAll('.remove-option').forEach(btn => {
            btn.addEventListener('click', function() {
                if (optionsContainer.children.length > 1) {
                    btn.parentElement.remove();
                }
            });
        });
    }
}

// В спецификации нет агрегированного эндпоинта результатов

function showPollResultsModal(results) {
    const modalContent = document.getElementById('modal-content');
    const modal = document.getElementById('edit-modal');
    
    if (!modalContent || !modal) return;
    
    let html = `
        <h3>Результаты опроса: ${results.question}</h3>
        <div style="margin: 20px 0;">
            <p><strong>Всего голосов:</strong> ${results.total_votes || 0}</p>
        </div>
    `;
    
    if (results.options && results.options.length > 0) {
        html += '<div style="margin: 20px 0;">';
        results.options.forEach(option => {
            const percentage = results.total_votes > 0 ? 
                Math.round((option.votes / results.total_votes) * 100) : 0;
            
            html += `
                <div style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>${option.text}</span>
                        <span>${option.votes} голосов (${percentage}%)</span>
                    </div>
                    <div style="background: #f0f0f0; height: 20px; border-radius: 10px; overflow: hidden;">
                        <div style="background: var(--primary-red); height: 100%; width: ${percentage}%;"></div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    modalContent.innerHTML = html;
    modal.style.display = 'block';
}

async function editPoll(id) {
    try {
        const response = await makeAuthRequest(`/api/polls/${id}/`);
        if (response.ok) {
            const poll = await response.json();
            showEditModal('poll', poll);
        }
    } catch (error) {
        showNotification('Ошибка загрузки опроса', 'error');
    }
}

// Глобальные функции
window.viewPollResults = viewPollResults;
window.editPoll = editPoll;