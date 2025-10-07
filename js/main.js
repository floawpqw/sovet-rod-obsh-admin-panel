// Основная инициализация
document.addEventListener('DOMContentLoaded', function() {
    initEventListeners();
    initForms();
});

function initEventListeners() {
    // Закрытие модального окна
    const closeModal = document.querySelector('.close-modal');
    const modal = document.getElementById('edit-modal');
    
    if (closeModal && modal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Навигация
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            handleNavigation(link);
        });
    });

    // Поддержка активного состояния для кнопки Личный кабинет в хедере
    const headerProfileBtn = document.querySelector('.header-actions .header-btn[href="#profile"]');
    if (headerProfileBtn) {
        headerProfileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Сохраняем hover/active состояние для кнопки Личный кабинет
            headerProfileBtn.classList.add('active');
            handleNavigation(headerProfileBtn);
        });
    }

    // Инициализация типов новостей
    if (typeof loadNewsTypes === 'function') {
        loadNewsTypes();
    }

    // Личный кабинет формы
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('profile-submit-btn');
            const original = showLoading(btn);
            try {
                const body = {
                    username: document.getElementById('profile-username').value || undefined,
                    email: document.getElementById('profile-email').value || undefined,
                };
                const res = await makeAuthRequest('/api/users/me/', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (res.ok) {
                    showNotification('Профиль обновлён', 'success');
                    const user = await res.json().catch(() => null);
                    if (user && typeof applyRoleUI === 'function') applyRoleUI(user);
                } else {
                    const err = await res.json().catch(() => ({}));
                    showNotification(err.detail || 'Не удалось обновить профиль', 'error');
                }
            } finally {
                hideLoading(btn, original);
            }
        });
    }

    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const new1 = document.getElementById('new-password').value;
            const new2 = document.getElementById('new-password2').value;
            if (!new1 || new1 !== new2) {
                showNotification('Пароли не совпадают', 'error');
                return;
            }
            const btn = document.getElementById('password-submit-btn');
            const original = showLoading(btn);
            try {
                const body = {
                    old_password: document.getElementById('old-password').value || '',
                    new_password: new1,
                };
                const res = await makeAuthRequest('/api/auth/change-password/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (res.ok) {
                    showNotification('Пароль изменён', 'success');
                    passwordForm.reset();
                } else {
                    const err = await res.json().catch(() => ({}));
                    showNotification(err.detail || 'Не удалось изменить пароль', 'error');
                }
            } finally {
                hideLoading(btn, original);
            }
        });
    }
}

function initForms() {
    // Роль-ориентированная навигация: скрыть вкладку Пользователи для role=user
    (async () => {
        try {
            const me = typeof verifyAuth === 'function' ? await (async () => {
                const r = await makeAuthRequest('/api/users/me/');
                if (!r.ok) return null;
                return await r.json();
            })() : null;
            const usersTab = document.querySelector('a[href="#users"]').parentElement;
            if (me && me.role !== 'admin' && usersTab) {
                usersTab.style.display = 'none';
            }
        } catch (_) {}
    })();

    // Форма пользователя
    const toggleUserForm = document.getElementById('toggle-user-form');
    const cancelUserBtn = document.getElementById('cancel-user-btn');
    const userInviteForm = document.getElementById('user-invite-form');
    
    if (toggleUserForm) toggleUserForm.addEventListener('click', () => toggleForm('user'));
    if (cancelUserBtn) cancelUserBtn.addEventListener('click', () => toggleForm('user'));
    if (userInviteForm) userInviteForm.addEventListener('submit', handleUserInvite);
    
    // Форма новостей
    const toggleNewsForm = document.getElementById('toggle-news-form');
    const cancelNewsBtn = document.getElementById('cancel-news-btn');
    const newsCreateForm = document.getElementById('news-create-form');
    
    if (toggleNewsForm) toggleNewsForm.addEventListener('click', () => toggleForm('news'));
    if (cancelNewsBtn) cancelNewsBtn.addEventListener('click', () => toggleForm('news'));
    if (newsCreateForm) newsCreateForm.addEventListener('submit', handleNewsCreate);
    initImagePreview('news-image', 'news-image-preview');
    
    // Форма проектов
    const toggleProjectForm = document.getElementById('toggle-project-form');
    const cancelProjectBtn = document.getElementById('cancel-project-btn');
    const projectCreateForm = document.getElementById('project-create-form');
    
    if (toggleProjectForm) toggleProjectForm.addEventListener('click', () => toggleForm('project'));
    if (cancelProjectBtn) cancelProjectBtn.addEventListener('click', () => toggleForm('project'));
    if (projectCreateForm) projectCreateForm.addEventListener('submit', handleProjectCreate);
    initImagePreview('project-image', 'project-image-preview');
    
    // Форма баннеров
    const toggleBannerForm = document.getElementById('toggle-banner-form');
    const cancelBannerBtn = document.getElementById('cancel-banner-btn');
    const bannerCreateForm = document.getElementById('banner-create-form');
    
    if (toggleBannerForm) toggleBannerForm.addEventListener('click', () => toggleForm('banner'));
    if (cancelBannerBtn) cancelBannerBtn.addEventListener('click', () => toggleForm('banner'));
    if (bannerCreateForm) bannerCreateForm.addEventListener('submit', handleBannerCreate);
    initImagePreview('banner-image', 'banner-image-preview');
    
    // Форма партнеров
    const togglePartnerForm = document.getElementById('toggle-partner-form');
    const cancelPartnerBtn = document.getElementById('cancel-partner-btn');
    const partnerCreateForm = document.getElementById('partner-create-form');
    
    if (togglePartnerForm) togglePartnerForm.addEventListener('click', () => toggleForm('partner'));
    if (cancelPartnerBtn) cancelPartnerBtn.addEventListener('click', () => toggleForm('partner'));
    if (partnerCreateForm) partnerCreateForm.addEventListener('submit', handlePartnerCreate);
    initImagePreview('partner-logo', 'partner-logo-preview');
    
    // Форма опросов
    const togglePollForm = document.getElementById('toggle-poll-form');
    const cancelPollBtn = document.getElementById('cancel-poll-btn');
    const pollCreateForm = document.getElementById('poll-create-form');
    
    if (togglePollForm) togglePollForm.addEventListener('click', () => toggleForm('poll'));
    if (cancelPollBtn) cancelPollBtn.addEventListener('click', () => toggleForm('poll'));
    if (pollCreateForm) pollCreateForm.addEventListener('submit', handlePollCreate);
    
    // Инициализация формы опросов
    initPollForm();
    
    // Удалены настройки

        // Форма подписок
        const toggleSubscriptionForm = document.getElementById('toggle-subscription-form');
        const cancelSubscriptionBtn = document.getElementById('cancel-subscription-btn');
        const subscriptionCreateForm = document.getElementById('subscription-create-form');
        
        if (toggleSubscriptionForm) toggleSubscriptionForm.addEventListener('click', () => toggleForm('subscription'));
        if (cancelSubscriptionBtn) cancelSubscriptionBtn.addEventListener('click', () => toggleForm('subscription'));
        if (subscriptionCreateForm) subscriptionCreateForm.addEventListener('submit', handleSubscriptionCreate);
        
        // Форма документов
        const toggleDocumentForm = document.getElementById('toggle-document-form');
        const cancelDocumentBtn = document.getElementById('cancel-document-btn');
        const documentCreateForm = document.getElementById('document-create-form');
        
        if (toggleDocumentForm) toggleDocumentForm.addEventListener('click', () => toggleForm('document'));
        if (cancelDocumentBtn) cancelDocumentBtn.addEventListener('click', () => toggleForm('document'));
        if (documentCreateForm) documentCreateForm.addEventListener('submit', handleDocumentCreate);
        
        // Форма контактов
        const toggleContactForm = document.getElementById('toggle-contact-form');
        const cancelContactBtn = document.getElementById('cancel-contact-btn');
        const contactCreateForm = document.getElementById('contact-create-form');
        
        if (toggleContactForm) toggleContactForm.addEventListener('click', () => toggleForm('contact'));
        if (cancelContactBtn) cancelContactBtn.addEventListener('click', () => toggleForm('contact'));
        if (contactCreateForm) contactCreateForm.addEventListener('submit', handleContactCreate);

        // Форма мероприятий
        const toggleEventForm = document.getElementById('toggle-event-form');
        const cancelEventBtn = document.getElementById('cancel-event-btn');
        const eventCreateForm = document.getElementById('event-create-form');
        
        if (toggleEventForm) toggleEventForm.addEventListener('click', () => toggleForm('event'));
        if (cancelEventBtn) cancelEventBtn.addEventListener('click', () => toggleForm('event'));
        if (eventCreateForm) eventCreateForm.addEventListener('submit', handleEventCreate);

        // Личный кабинет формы
        const profileForm = document.getElementById('profile-form');
        const passwordForm = document.getElementById('password-form');
        (async () => {
            try {
                const r = await makeAuthRequest('/api/users/me/');
                if (r.ok) {
                    const me = await r.json();
                    const emailEl = document.getElementById('profile-email');
                    const usernameEl = document.getElementById('profile-username');
                    if (emailEl) emailEl.value = me.email || '';
                    if (usernameEl) usernameEl.value = me.username || '';
                }
            } catch (_) {}
        })();
        if (profileForm) profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('profile-submit-btn');
            const original = showLoading(btn);
            try {
                const body = {
                    email: document.getElementById('profile-email').value,
                    username: document.getElementById('profile-username').value,
                };
                const res = await makeAuthRequest('/api/users/me/', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (res.ok) {
                    showNotification('Профиль обновлен', 'success');
                } else {
                    const err = await res.json().catch(() => ({}));
                    showNotification(err.detail || 'Не удалось обновить профиль', 'error');
                }
            } finally {
                hideLoading(btn, original);
            }
        });
        if (passwordForm) passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('password-submit-btn');
            const original = showLoading(btn);
            try {
                const body = { password: document.getElementById('profile-password').value };
                const res = await makeAuthRequest('/api/users/change-password/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (res.ok) {
                    showNotification('Пароль изменен', 'success');
                    document.getElementById('profile-password').value = '';
                } else {
                    const err = await res.json().catch(() => ({}));
                    showNotification(err.detail || 'Не удалось изменить пароль', 'error');
                }
            } finally {
                hideLoading(btn, original);
            }
        });
    }

function handleNavigation(link) {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    contentSections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetId = link.getAttribute('href').substring(1);

    // Сбрасываем active у кнопки Личный кабинет в хедере при переходе на другие секции
    const headerProfileBtn = document.querySelector('.header-actions .header-btn[href="#profile"]');
    if (headerProfileBtn) {
        if (targetId === 'profile') {
            headerProfileBtn.classList.add('active');
        } else {
            headerProfileBtn.classList.remove('active');
        }
    }
    const targetSection = document.getElementById(targetId);
    
    if (targetSection) {
        targetSection.classList.add('active');
        
        switch(targetId) {
                case 'users': loadUsers(); break;
                case 'news': loadNews(); break;
                case 'projects': loadProjects(); break;
                case 'banners': loadBanners(); break;
                case 'partners': loadPartners(); break;
                case 'polls': loadPolls(); break;
                case 'subscriptions': loadSubscriptions(); break;
                case 'documents': loadDocuments(); break;
                case 'contacts': loadContacts(); break;
                case 'questions': loadQuestions(); break;
                case 'events': loadEvents(); break;
                case 'profile':
                    if (typeof verifyAuth === 'function') {
                        verifyAuth().then(user => {
                            if (user) {
                                const uEl = document.getElementById('profile-username');
                                const eEl = document.getElementById('profile-email');
                                if (uEl) uEl.value = user.username || '';
                                if (eEl) eEl.value = user.email || '';
                            }
                        });
                    }
                    break;
        }
    }
}