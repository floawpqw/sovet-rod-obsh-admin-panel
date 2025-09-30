// Функции для работы с вопросами
async function loadQuestions() {
    try {
        const response = await makeAuthRequest('/api/feedbacks/');
        if (response.ok) {
            const questions = await response.json();
            renderQuestions(questions);
        } else {
            showNotification('Ошибка загрузки вопросов', 'error');
        }
    } catch (error) {
        showNotification('Ошибка загрузки вопросов: ' + error.message, 'error');
    }
}

function renderQuestions(questions) {
    const container = document.getElementById('questions-list');
    if (!container) return;
    
    if (!questions || questions.length === 0) {
        container.innerHTML = '<tr><td colspan="10" style="text-align: center;">Вопросов нет</td></tr>';
        return;
    }
    
    container.innerHTML = questions.map(question => {
        const firstName = question.first_name || question.name || '';
        const lastName = question.last_name || question.surname || '';
        const middleName = question.patronymic || question.middle_name || '';
        const email = question.email || '';
        const message = (question.message || question.text || '').toString();
        const answer = question.answer || '';
        const createdAt = question.created_at || question.createdAt || question.created || null;
        const dateStr = createdAt ? new Date(createdAt).toLocaleDateString() : '';
        const shortMessage = message ? `${message.substring(0, 50)}${message.length > 50 ? '...' : ''}` : '';
        const canEmail = Boolean(email);
        return `
        <tr>
            <td>${question.id}</td>
            <td>${firstName}</td>
            <td>${lastName}</td>
            <td>${middleName}</td>
            <td>${email}</td>
            <td title="${message.replace(/"/g, '&quot;')}">${shortMessage}</td>
            <td><span class="status-badge ${question.is_answered ? 'status-published' : 'status-draft'}">${question.is_answered ? 'Отвечен' : 'Ожидает'}</span></td>
            <td title="${String(answer).replace(/"/g, '&quot;')}">${answer ? `${String(answer).substring(0, 40)}${String(answer).length > 40 ? '...' : ''}` : ''}</td>
            <td>${dateStr}</td>
            <td class="actions">
                <button class="action-btn" onclick="answerQuestion(${question.id}, ${canEmail})">Ответить</button>
                <button class="action-btn danger" onclick="deleteItem('feedbacks', ${question.id}, 'question')">Удалить</button>
            </td>
        </tr>`;
    }).join('');
}

async function answerQuestion(id, canEmail = false) {
        const answer = prompt('Введите ответ на вопрос:');
    if (!answer) return;
    
    try {
        const response = await makeAuthRequest(`/api/feedbacks/${id}/answer/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ response: answer })
        });
        
        if (response.ok) {
            showNotification('Ответ отправлен!');
            loadQuestions();
        }
    } catch (error) {
        showNotification('Ошибка отправки ответа', 'error');
    }
}

// Эндпоинта для отмены ответа нет в спецификации

// Глобальные функции
window.answerQuestion = answerQuestion;
// Нет экспорта отмены ответа