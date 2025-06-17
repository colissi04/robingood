function showHome() {
    const content = document.getElementById('main-content');
    content.innerHTML = `
        <div class="home-container">
            <div class="welcome-section">
                <h1>Bem-vindo ao Robingood</h1>
                <p>Organize seus cursos e aulas de vídeo de forma simples e eficiente.</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">📚</div>
                    <div class="stat-info">
                        <h3>${courses.length}</h3>
                        <p>Cursos</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">🎬</div>
                    <div class="stat-info">
                        <h3>${getTotalVideos()}</h3>
                        <p>Vídeos</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">⏱️</div>
                    <div class="stat-info">
                        <h3>${getCompletedVideos()}</h3>
                        <p>Assistidos</p>
                    </div>
                </div>
            </div>
            
            <div class="recent-courses">
                <h2>Cursos Recentes</h2>
                <div class="recent-courses-grid">
                    ${getRecentCourses().map(course => `
                        <div class="recent-course-card" onclick="openCourse('${course.id}')">
                            <div class="course-thumbnail">
                                <i class="fas fa-play-circle"></i>
                            </div>
                            <div class="course-info">
                                <h4>${course.name}</h4>
                                <p>${course.videos.length} vídeos</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function showSettings() {
    const content = document.getElementById('main-content');
    content.innerHTML = `
        <div class="settings-container">
            <h1>Configurações</h1>
            
            <div class="settings-section">
                <h3>Aparência</h3>
                <div class="setting-item">
                    <label>
                        <span>Tema</span>
                        <select id="theme-select" onchange="changeTheme(this.value)">
                            <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>Escuro</option>
                            <option value="light" ${currentTheme === 'light' ? 'selected' : ''}>Claro</option>
                        </select>
                    </label>
                </div>
            </div>
            
            <div class="settings-section">
                <h3>Reprodução</h3>
                <div class="setting-item">
                    <label>
                        <span>Velocidade padrão</span>
                        <select id="speed-select">
                            <option value="0.5">0.5x</option>
                            <option value="0.75">0.75x</option>
                            <option value="1" selected>1x</option>
                            <option value="1.25">1.25x</option>
                            <option value="1.5">1.5x</option>
                            <option value="2">2x</option>
                        </select>
                    </label>
                </div>
                
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="autoplay-checkbox" checked>
                        <span>Reprodução automática</span>
                    </label>
                </div>
            </div>
            
            <div class="settings-section">
                <h3>Armazenamento</h3>
                <div class="setting-item">
                    <button onclick="clearAllData()" class="btn-danger">
                        Limpar todos os dados
                    </button>
                    <small>Esta ação não pode ser desfeita</small>
                </div>
            </div>
            
            <div class="settings-section">
                <h3>Sobre</h3>
                <div class="about-info">
                    <p><strong>Robingood</strong> v1.0.0</p>
                    <p>Desenvolvido por Rodrigo Colissi</p>
                    <p>Uma aplicação gratuita para organizar seus cursos e aulas em vídeo.</p>
                </div>
            </div>
        </div>
    `;
}

function getTotalVideos() {
    return courses.reduce((total, course) => total + course.videos.length, 0);
}

function getCompletedVideos() {
    return courses.reduce((total, course) => {
        return total + course.videos.filter(video => video.completed).length;
    }, 0);
}

function getRecentCourses() {
    return courses
        .sort((a, b) => new Date(b.lastAccessed || 0) - new Date(a.lastAccessed || 0))
        .slice(0, 4);
}

function clearAllData() {
    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
        localStorage.clear();
        courses = [];
        showNotification('Todos os dados foram removidos', 'success');
        renderCourses();
    }
} 