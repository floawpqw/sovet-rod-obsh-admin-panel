// Функции для работы с вопросами
async function loadQuestions() {
    try {
        const response = await makeAuthRequest('/api/questions');
        if (response.ok) {
            const questions = await response.json();
            renderQuestions(questions);
        }
    } catch (error) {
        showNotification('Ошибка загрузки вопросов', 'error');
    }
}

function renderQuestions(questions) {
    const container = document.getElementById('questions-list');
    if (!container) return;
    
    if (questions.length === 0) {
        container.innerHTML = '<tr><td colspan="7" style="text-align: center;">Вопросов нет</td></tr>';
        return;
    }
    
    container.innerHTML = questions.map(question => `
        <tr>
            <td>${question.id}</td>
            <td>${question.name}</td>
            <td>${question.email}</td>
            <td>${question.message.substring(0, 50)}${question.message.length > 50 ? '...' : ''}</td>
            <td><span class="status-badge ${question.answered ? 'status-published' : 'status-draft'}">${question.answered ? 'Отвечен' : 'Ожидает'}</span></td>
            <td>${new Date(question.created_at).toLocaleDateString()}</td>
            <td class="actions">
                <button class="action-btn" onclick="answerQuestion(${question.id})">Ответить</button>
                <button class="action-btn danger" onclick="deleteItem('questions', ${question.id}, 'question')">Удалить</button>
                ${question.answered ? `<button class="action-btn warning" onclick="markQuestionUnanswered(${question.id})">Отменить ответ</button>` : ''}
            </td>
        </tr>
    `).join('');
}

async function answerQuestion(id) {
    const answer = prompt('Введите ответ на вопрос:');
    if (!answer) return;
    
    try {
        const response = await makeAuthRequest(`/api/questions/${id}/answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ answer })
        });
        
        if (response.ok) {
            showNotification('Ответ отправлен!');
            loadQuestions();
        }
    } catch (error) {
        showNotification('Ошибка отправки ответа', 'error');
    }
}

async function markQuestionUnanswered(id) {
    try {
        const response = await makeAuthRequest(`/api/questions/${id}/unanswer`, {
            method: 'POST'
        });
        
        if (response.ok) {
            showNotification('Ответ отменен!');
            loadQuestions();
        }
    } catch (error) {
        showNotification('Ошибка отмены ответа', 'error');
    }
}

// Глобальные функции
window.answerQuestion = answerQuestion;
window.markQuestionUnanswered = markQuestionUnanswered;