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
        questions = [{ first_name:'Иван', last_name:'Иванов', middle_name:'Иванович', email:'user@example.com', message:'Как получить доступ к закрытому разделу?', id:'sample-1' }];
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
            <td>${firstName}</td>
            <td>${lastName}</td>
            <td>${middleName}</td>
            <td>${email}</td>
            <td title="${message.replace(/"/g, '&quot;')}">${shortMessage}</td>
            <td class="actions"><button class="action-btn" onclick="showAnswerForm('${question.id}', '${email}')">Ответить</button></td>
        </tr>`;
    }).join('');
}

function showAnswerForm(id, email) {
    const modalContent = document.getElementById('modal-content');
    const modal = document.getElementById('edit-modal');
    if (!modalContent || !modal) return;
    modalContent.innerHTML = `
        <h3>Ответ на вопрос</h3>
        <p>Письмо будет отправлено на: <strong>${email || 'указанный адрес'}</strong></p>
        <div class="form-group">
            <label for="answer-text">Текст ответа</label>
            <textarea id="answer-text" placeholder="Введите ответ"></textarea>
        </div>
        <div class="form-actions">
            <button id="send-answer-btn" class="action-btn">Отправить</button>
        </div>
    `;
    modal.style.display = 'block';
    document.getElementById('send-answer-btn').addEventListener('click', async () => {
        const text = document.getElementById('answer-text').value.trim();
        if (!text) { showNotification('Введите текст ответа', 'error'); return; }
        try {
            const res = await makeAuthRequest(`/api/feedbacks/${id}/answer/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ response: text, answer: text })
            });
            if (res.ok) {
                showNotification('Ответ отправлен', 'success');
                loadQuestions();
                document.getElementById('edit-modal').style.display = 'none';
            } else {
                const err = await res.json().catch(() => ({}));
                showNotification(err.detail || 'Не удалось отправить ответ', 'error');
            }
        } catch (_) {
            showNotification('Ошибка отправки ответа', 'error');
        }
    });
}

window.showAnswerForm = showAnswerForm;

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