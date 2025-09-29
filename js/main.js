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
}

function initForms() {
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
    
    // Форма настроек
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) settingsForm.addEventListener('submit', handleSettingsSave);
    initImagePreview('site-logo', 'site-logo-preview');

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
                case 'settings': loadSettings(); loadSystemStats(); break;
        }
    }
}