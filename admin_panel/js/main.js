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
    const userCreateForm = document.getElementById('user-create-form');
    
    if (toggleUserForm) toggleUserForm.addEventListener('click', () => toggleForm('user'));
    if (cancelUserBtn) cancelUserBtn.addEventListener('click', () => toggleForm('user'));
    if (userCreateForm) userCreateForm.addEventListener('submit', handleUserCreate);
    
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
    
    // Форма услуг
    const toggleServiceForm = document.getElementById('toggle-service-form');
    const cancelServiceBtn = document.getElementById('cancel-service-btn');
    const serviceCreateForm = document.getElementById('service-create-form');
    
    if (toggleServiceForm) toggleServiceForm.addEventListener('click', () => toggleForm('service'));
    if (cancelServiceBtn) cancelServiceBtn.addEventListener('click', () => toggleForm('service'));
    if (serviceCreateForm) serviceCreateForm.addEventListener('submit', handleServiceCreate);
    initImagePreview('service-image', 'service-image-preview');
    
    // Форма настроек
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) settingsForm.addEventListener('submit', handleSettingsSave);
    initImagePreview('site-logo', 'site-logo-preview');
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
            case 'services': loadServices(); break;
            case 'questions': loadQuestions(); break;
            case 'settings': loadSettings(); loadSystemStats(); break;
        }
    }
}