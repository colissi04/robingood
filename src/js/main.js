// Main application logic
class RobingoodApp {
    constructor() {
        this.courses = [];
        this.currentSection = 'home';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCourses();
        this.updateUI();
    }

    setupEventListeners() {
        // Add course button
        const addCourseBtn = document.getElementById('add-course-btn');
        if (addCourseBtn) {
            addCourseBtn.addEventListener('click', () => this.addCourse());
        }

        // Library search
        const librarySearch = document.getElementById('library-search');
        if (librarySearch) {
            librarySearch.addEventListener('input', (e) => this.filterCourses(e.target.value));
        }
    }

    async addCourse() {
        try {
            // Use Electron's dialog to select folder
            const result = await window.electronAPI?.selectFolder();
            
            if (result && !result.canceled && result.filePaths.length > 0) {
                const folderPath = result.filePaths[0];
                const videoFiles = await window.electronAPI?.getVideoFiles(folderPath);
                
                if (videoFiles && videoFiles.length > 0) {
                    this.showAddCourseDialog(folderPath, videoFiles);
                } else {
                    this.showNotification('Nenhum arquivo de vídeo encontrado na pasta selecionada', 'warning');
                }
            }
        } catch (error) {
            console.error('Error selecting folder:', error);
            this.showNotification('Erro ao selecionar pasta', 'error');
        }
    }

    showAddCourseDialog(folderPath, videoFiles) {
        // Sort video files by name
        const sortedFiles = videoFiles.sort((a, b) => a.name.localeCompare(b.name));
        
        // Store the data temporarily in the app instance
        this.tempCourseData = {
            folderPath: folderPath,
            videoFiles: sortedFiles,
            logo: null,
            cover: null
        };
        
        // Create modal dialog for course naming
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Adicionar Novo Curso</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="course-name">Nome do Curso</label>
                        <input type="text" id="course-name" placeholder="Digite o nome do curso" value="${this.getFolderName(folderPath)}">
                    </div>
                    
                    <div class="form-group">
                        <label for="course-description">Descrição (opcional)</label>
                        <textarea id="course-description" placeholder="Adicione uma descrição para o curso" rows="3"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Logo do Curso</label>
                        <div class="image-selection">
                            <div class="image-upload">
                                <div class="image-preview" id="logo-preview" onclick="app.selectImage('logo')">
                                    <div class="image-preview-placeholder">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                                        </svg>
                                        <div>Clique para selecionar</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Imagem de Capa</label>
                        <div class="image-selection">
                            <div class="image-upload">
                                <div class="image-preview" id="cover-preview" onclick="app.selectImage('cover')" style="height: 60px;">
                                    <div class="image-preview-placeholder">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M21,17H7V3H21M21,1H7A2,2 0 0,0 5,3V17A2,2 0 0,0 7,19H21A2,2 0 0,0 23,17V3A2,2 0 0,0 21,1M3,5H1V21A2,2 0 0,0 3,23H19V21H3V5Z"/>
                                        </svg>
                                        <div>Clique para selecionar</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Pasta selecionada:</label>
                        <div class="folder-path">${folderPath}</div>
                    </div>
                    
                    <div class="form-group">
                        <label>Encontrados ${sortedFiles.length} arquivo(s) de vídeo:</label>
                        <div class="file-list">
                            ${sortedFiles.slice(0, 8).map((file, index) => `
                                <div class="file-item">
                                    <span class="file-name">${index + 1} - ${file.name}</span>
                                    <span class="file-size">(${this.formatFileSize(file.size || 0)})</span>
                                </div>
                            `).join('')}
                            ${sortedFiles.length > 8 ? `
                                <div class="file-item-more">
                                    <span>... e mais ${sortedFiles.length - 8} arquivo(s)</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                    <button class="btn-primary" id="confirm-add-course">Adicionar Curso</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        const confirmButton = modal.querySelector('#confirm-add-course');
        confirmButton.addEventListener('click', () => {
            this.confirmAddCourse(modal);
        });
        
        // Focus on input and add Enter key handler
        setTimeout(() => {
            const input = modal.querySelector('#course-name');
            input.focus();
            input.select();
            
            // Add Enter key handler
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    confirmButton.click();
                }
            });
        }, 100);
    }

    async selectImage(type) {
        try {
            // Try to use Electron's dialog first
            if (window.electronAPI?.selectImage) {
                const result = await window.electronAPI.selectImage();
                
                if (result && !result.canceled && result.filePaths.length > 0) {
                    const imagePath = result.filePaths[0];
                    
                    // Store the image path
                    this.tempCourseData[type] = imagePath;
                    
                    // Update preview
                    const preview = document.getElementById(`${type}-preview`);
                    if (preview) {
                        preview.innerHTML = `<img src="file://${imagePath}" alt="${type} preview">`;
                    }
                }
            } else {
                // Fallback to web file input
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.style.display = 'none';
                
                input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            const imageDataUrl = event.target.result;
                            
                            // Store the image data
                            this.tempCourseData[type] = imageDataUrl;
                            
                            // Update preview
                            const preview = document.getElementById(`${type}-preview`);
                            if (preview) {
                                preview.innerHTML = `<img src="${imageDataUrl}" alt="${type} preview">`;
                            }
                        };
                        reader.readAsDataURL(file);
                    }
                    document.body.removeChild(input);
                };
                
                document.body.appendChild(input);
                input.click();
            }
        } catch (error) {
            console.error('Error selecting image:', error);
            this.showNotification('Erro ao selecionar imagem', 'error');
        }
    }

    confirmAddCourse(modal) {
        const courseName = modal.querySelector('#course-name').value.trim();
        const courseDescription = modal.querySelector('#course-description').value.trim();
        
        if (!courseName) {
            this.showNotification('Por favor, digite um nome para o curso', 'warning');
            return;
        }

        // Check if course name already exists
        if (this.courses.some(course => course.name.toLowerCase() === courseName.toLowerCase())) {
            this.showNotification('Já existe um curso com este nome', 'warning');
            return;
        }

        // Get the temporary data
        const { folderPath, videoFiles, logo, cover } = this.tempCourseData;
        
        const course = {
            id: Date.now().toString(),
            name: courseName,
            description: courseDescription,
            path: folderPath,
            logo: logo,
            cover: cover,
            videos: videoFiles.map((file, index) => ({
                id: `${Date.now()}_${index}`,
                name: file.name,
                path: file.path,
                watched: false,
                currentTime: 0,
                duration: 0,
                order: index + 1,
                thumbnail: null // Initialize thumbnail as null
            })),
            createdAt: new Date().toISOString(),
            lastAccessed: new Date().toISOString(),
            progress: 0,
            totalDuration: 0
        };

        this.courses.push(course);
        this.saveCourses();
        this.updateUI();
        modal.remove();
        
        // Clean up temporary data
        delete this.tempCourseData;
        
        this.showNotification(`Curso "${courseName}" adicionado com sucesso!`, 'success');
        
        // Update the global courses variable for other scripts
        if (window.courses !== undefined) {
            window.courses = this.courses;
        }

        // Generate thumbnails in the background
        setTimeout(() => {
            this.generateCourseThumbnails(course);
        }, 1000);
    }

    getFolderName(folderPath) {
        return folderPath.split(/[\\/]/).pop() || 'Novo Curso';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    filterCourses(query) {
        const courseItems = document.querySelectorAll('.course-item');
        const courseCards = document.querySelectorAll('.course-card');
        
        const searchQuery = query.toLowerCase();
        
        // Filter sidebar items
        courseItems.forEach(item => {
            const courseName = item.querySelector('.course-name')?.textContent.toLowerCase() || '';
            item.style.display = courseName.includes(searchQuery) ? 'flex' : 'none';
        });
        
        // Filter main grid cards
        courseCards.forEach(card => {
            const courseName = card.querySelector('.course-card-title')?.textContent.toLowerCase() || '';
            card.style.display = courseName.includes(searchQuery) ? 'flex' : 'none';
        });
        
        // Show/hide empty state
        const visibleCards = Array.from(courseCards).filter(card => card.style.display !== 'none');
        const emptyState = document.querySelector('.empty-state');
        if (emptyState) {
            emptyState.style.display = visibleCards.length === 0 && this.courses.length > 0 ? 'flex' : 'none';
        }
    }

    loadCourses() {
        try {
            const saved = localStorage.getItem('robingood-courses');
            this.courses = saved ? JSON.parse(saved) : [];
            
            // Load thumbnails for all videos
            this.courses.forEach(course => {
                course.videos.forEach(video => {
                    const thumbnailKey = `video_thumbnail_${video.id}`;
                    const cachedThumbnail = localStorage.getItem(thumbnailKey);
                    if (cachedThumbnail) {
                        video.thumbnail = cachedThumbnail;
                    }
                });
            });
            
            // Update global variable
            if (window.courses !== undefined) {
                window.courses = this.courses;
            }
        } catch (error) {
            console.error('Error loading courses:', error);
            this.courses = [];
        }
    }

    saveCourses() {
        try {
            localStorage.setItem('robingood-courses', JSON.stringify(this.courses));
        } catch (error) {
            console.error('Error saving courses:', error);
        }
    }

    updateUI() {
        this.updateSidebarCourses();
        this.updateMainContent();
    }

    updateSidebarCourses() {
        const coursesList = document.getElementById('courses-list');
        if (!coursesList) return;

        if (this.courses.length === 0) {
            coursesList.innerHTML = '<div class="no-courses">Nenhum curso adicionado ainda</div>';
            return;
        }

        coursesList.innerHTML = this.courses.map(course => `
            <div class="course-item" data-course-id="${course.id}" onclick="app.openCourse('${course.id}')">
                <div class="course-icon">
                    ${course.logo ? `
                        <img src="${course.logo.startsWith('data:') ? course.logo : 'file://' + course.logo}" alt="Logo do curso" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">
                    ` : `
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                        </svg>
                    `}
                </div>
                <div class="course-info">
                    <div class="course-name">${course.name}</div>
                    <div class="course-progress">${course.videos.length} vídeos • ${Math.round(course.progress)}% concluído</div>
                </div>
            </div>
        `).join('');
    }

    updateMainContent() {
        const coursesGrid = document.getElementById('courses-grid');
        if (!coursesGrid) return;

        if (this.courses.length === 0) {
            coursesGrid.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                    <h3>Nenhum curso ainda</h3>
                    <p>Comece adicionando seu primeiro curso</p>
                </div>
            `;
            return;
        }

        coursesGrid.innerHTML = this.courses.map(course => `
            <div class="course-card ${course.cover ? 'has-cover' : ''}" data-course-id="${course.id}" onclick="app.openCourse('${course.id}')">
                ${course.cover ? `
                    <div class="course-card-cover">
                        <img src="${course.cover.startsWith('data:') ? course.cover : 'file://' + course.cover}" alt="Capa do curso">
                    </div>
                ` : ''}
                <div class="course-card-header">
                    <div class="course-card-icon">
                        ${course.logo ? `
                            <img src="${course.logo.startsWith('data:') ? course.logo : 'file://' + course.logo}" alt="Logo do curso">
                        ` : `
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                            </svg>
                        `}
                    </div>
                    <div class="course-card-info">
                        <div class="course-card-title">${course.name}</div>
                        <div class="course-card-subtitle">${course.videos.length} vídeos</div>
                    </div>
                </div>
                <div class="course-card-body">
                    <div class="course-stats">
                        <span>${course.videos.filter(v => v.watched).length}/${course.videos.length} assistidos</span>
                        <span>Adicionado em ${new Date(course.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div class="course-progress-bar">
                        <div class="course-progress-fill" style="width: ${course.progress}%"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    openCourse(courseId) {
        // Update last accessed time
        const course = this.courses.find(c => c.id === courseId);
        if (!course) {
            this.showNotification('Curso não encontrado', 'error');
            return;
        }
        
        course.lastAccessed = new Date().toISOString();
        this.saveCourses();
        
        // Show course details
        this.showCourseDetails(course);
    }

    showCourseDetails(course) {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        // Hide all sections first
        const sections = contentArea.querySelectorAll('section');
        sections.forEach(section => section.style.display = 'none');

        // Update page title
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = course.name;
        }

        // Create or update course details section
        let courseSection = document.getElementById('course-details-section');
        if (!courseSection) {
            courseSection = document.createElement('section');
            courseSection.id = 'course-details-section';
            contentArea.appendChild(courseSection);
        }

        // Load progress for all videos
        course.videos.forEach(video => {
            this.loadVideoProgress(video);
        });

        courseSection.style.display = 'block';
        courseSection.innerHTML = `
            <div class="course-details-container">
                <div class="course-header">
                    <div class="course-header-actions">
                        <button class="back-button" onclick="app.showLibrary()">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
                            </svg>
                            Voltar à Biblioteca
                        </button>
                        <button class="delete-course-button" onclick="app.deleteCourse('${course.id}')" title="Deletar curso">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                            </svg>
                            Deletar Curso
                        </button>
                    </div>
                    <div class="course-info-header">
                        <h1>${course.name}</h1>
                        ${course.description ? `<p class="course-description">${course.description}</p>` : ''}
                        <div class="course-stats">
                            <div class="stat-item">
                                <span class="stat-number">${course.videos.length}</span>
                                <span class="stat-label">vídeos</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${course.videos.filter(v => v.watched).length}</span>
                                <span class="stat-label">assistidos</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${Math.round(course.progress || 0)}%</span>
                                <span class="stat-label">concluído</span>
                            </div>
                        </div>
                        <div class="course-progress-bar">
                            <div class="progress-fill" style="width: ${course.progress || 0}%"></div>
                        </div>
                    </div>
                </div>

                <div class="videos-section">
                    <div class="section-header">
                    <h2>Vídeos do Curso</h2>
                        <div class="view-controls">
                            <button class="view-toggle active" data-view="grid">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3,11H11V3H3M3,21H11V13H3M13,21H21V13H13M13,3V11H21V3"/>
                                </svg>
                            </button>
                            <button class="view-toggle" data-view="list">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9,5V9H21V5M9,19H21V15H9M9,14H21V10H9M4,9H8V5H4M4,19H8V15H4M4,14H8V10H4"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <div class="videos-grid" id="videos-container">
                        ${course.videos.map((video, index) => `
                            <div class="video-card ${this.getVideoStatusClass(video)}" onclick="app.playVideo('${course.id}', '${video.id}')">
                                <div class="video-thumbnail">
                                    ${video.thumbnail ? `
                                        <img src="${video.thumbnail}" alt="Thumbnail do vídeo" class="video-thumbnail-img">
                                    ` : `
                                        <div class="thumbnail-placeholder">
                                            <svg viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M8,5.14V19.14L19,12.14L8,5.14Z"/>
                                            </svg>
                                        </div>
                                    `}
                                    
                                    ${video.watched ? `
                                        <div class="completion-overlay">
                                            <div class="completion-badge">
                                                <svg viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                                                </svg>
                                            </div>
                                        </div>
                                    ` : video.currentTime > 0 ? `
                                        <div class="progress-overlay">
                                            <div class="progress-bar-small">
                                                <div class="progress-fill-small" style="width: ${(video.currentTime / (video.duration || 1)) * 100}%"></div>
                                            </div>
                                        </div>
                                    ` : ''}
                                    
                                <div class="video-number">${index + 1}</div>
                                    
                                    <div class="play-overlay">
                                        <button class="play-btn-large">
                                            <svg viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M8,5.14V19.14L19,12.14L8,5.14Z"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="video-info">
                                    <h3 class="video-title">${video.name}</h3>
                                    <div class="video-meta">
                                        <span class="video-duration">${this.formatTime(video.duration || 0)}</span>
                                        <div class="video-status">
                                            ${this.getVideoStatusBadge(video)}
                                        </div>
                                    </div>
                                    ${video.currentTime > 0 && !video.watched ? `
                                        <div class="video-progress-info">
                                            <span>Assistido: ${this.formatTime(video.currentTime)} / ${this.formatTime(video.duration || 0)}</span>
                                </div>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Setup view toggle functionality
        this.setupViewToggle();

        // Generate thumbnails asynchronously
        this.generateCourseThumbnails(course);
    }

    getVideoStatusClass(video) {
        if (video.watched) return 'watched';
        if (video.currentTime > 0) return 'in-progress';
        return 'unwatched';
    }

    getVideoStatusBadge(video) {
        if (video.watched) {
            return '<span class="status-badge watched">✓ Assistido</span>';
        } else if (video.currentTime > 0) {
            const progress = Math.round((video.currentTime / (video.duration || 1)) * 100);
            return `<span class="status-badge in-progress">${progress}% assistido</span>`;
        } else {
            return '<span class="status-badge unwatched">Não assistido</span>';
        }
    }

    setupViewToggle() {
        const viewToggles = document.querySelectorAll('.view-toggle');
        const videosContainer = document.getElementById('videos-container');
        
        viewToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const view = toggle.dataset.view;
                
                // Update active state
                viewToggles.forEach(t => t.classList.remove('active'));
                toggle.classList.add('active');
                
                // Update container class
                videosContainer.className = view === 'list' ? 'videos-list' : 'videos-grid';
            });
        });
    }

    showLibrary() {
        // Hide course details section
        const courseSection = document.getElementById('course-details-section');
        if (courseSection) {
            courseSection.style.display = 'none';
        }

        // Show home section
        const homeSection = document.getElementById('home-section');
        if (homeSection) {
            homeSection.style.display = 'block';
        }

        // Update page title
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = 'My Library';
        }
    }

    playVideo(courseId, videoId) {
        const course = this.courses.find(c => c.id === courseId);
        const video = course?.videos.find(v => v.id === videoId);
        
        if (!course || !video) {
            this.showNotification('Vídeo não encontrado', 'error');
            return;
        }

        // Create video player overlay
        this.showVideoPlayer(course, video);
    }

    showVideoPlayer(course, video) {
        // Create video player modal
        const playerModal = document.createElement('div');
        playerModal.className = 'video-player-modal';
        playerModal.innerHTML = `
            <div class="video-player-container">
                <div class="video-player-header">
                    <button class="close-player" onclick="this.closest('.video-player-modal').remove()">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                    <div class="video-info">
                        <h3>${video.name}</h3>
                        <p>${course.name}</p>
                    </div>
                </div>
                
                <div class="video-wrapper">
                    <video 
                        id="main-video-player" 
                        controls 
                        controlsList="nodownload"
                        preload="metadata"
                        src="file://${video.path}"
                        onloadedmetadata="app.onVideoLoadedMetadata(event)"
                        ontimeupdate="app.onVideoTimeUpdate(event)"
                        onended="app.onVideoEnded(event)"
                        onpause="app.onVideoPause(event)"
                        onplay="app.onVideoPlay(event)"
                    >
                        Seu navegador não suporta o elemento de vídeo.
                    </video>
                    
                    <button class="playlist-toggle" onclick="app.togglePlaylist()" title="Mostrar/Esconder Playlist">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"/>
                        </svg>
                    </button>
                    
                    <div class="video-navigation">
                        <button class="nav-btn prev-video" onclick="app.playPreviousVideo('${course.id}', '${video.id}')" title="Vídeo Anterior" ${course.videos.findIndex(v => v.id === video.id) === 0 ? 'disabled' : ''}>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6,18V6H8V18H6M9.5,12L18,6V18L9.5,12Z"/>
                            </svg>
                        </button>
                        
                        <button class="nav-btn next-video" onclick="app.playNextVideo('${course.id}', '${video.id}')" title="Próximo Vídeo" ${course.videos.findIndex(v => v.id === video.id) === course.videos.length - 1 ? 'disabled' : ''}>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16,18H18V6H16M6,18L14.5,12L6,6V18Z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="video-playlist" id="video-playlist">
                    <h4>Playlist do Curso</h4>
                    <div class="playlist-videos">
                        ${course.videos.map((v, index) => `
                            <div class="playlist-item ${v.id === video.id ? 'current' : ''} ${v.watched ? 'watched' : ''}" 
                                 onclick="app.playVideoFromPlaylist('${course.id}', '${v.id}')">
                                <div class="playlist-number">${index + 1}</div>
                                <div class="playlist-info">
                                    <span class="playlist-title">${v.name}</span>
                                    <div class="playlist-progress">
                                        ${v.watched ? '<span class="watched-indicator">✓ Assistido</span>' : 
                                          v.currentTime > 0 ? `<span class="progress-indicator">${this.formatTime(v.currentTime)} / ${this.formatTime(v.duration || 0)}</span>` : 
                                          '<span class="unwatched-indicator">Não assistido</span>'}
                                    </div>
                                </div>
                                <div class="playlist-thumbnail">
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(playerModal);
        
        // Set up video player
        const videoElement = document.getElementById('main-video-player');
        this.currentVideo = { course, video, element: videoElement };
        
        // Load saved progress
        this.loadVideoProgress(video);
        
        // Handle ESC key to close player
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                playerModal.remove();
                document.removeEventListener('keydown', handleEscape);
            }
            // Toggle playlist with 'P' key
            if (e.key === 'p' || e.key === 'P') {
                this.togglePlaylist();
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        // Auto-hide playlist on mobile
        if (window.innerWidth <= 768) {
            const playlist = playerModal.querySelector('.video-playlist');
            if (playlist) {
                playlist.classList.remove('show');
            }
        }
    }

    togglePlaylist() {
        const playlist = document.getElementById('video-playlist');
        if (playlist) {
            playlist.classList.toggle('show');
        }
    }

    onVideoLoadedMetadata(event) {
        const video = event.target;
        const duration = video.duration;
        
        if (this.currentVideo) {
            this.currentVideo.video.duration = duration;
            
            // Set saved current time
            if (this.currentVideo.video.currentTime > 0) {
                video.currentTime = this.currentVideo.video.currentTime;
            }
        }
    }

    onVideoTimeUpdate(event) {
        const video = event.target;
        const currentTime = video.currentTime;
        const duration = video.duration;
        
        if (this.currentVideo) {
            this.currentVideo.video.currentTime = currentTime;
            
            // Save progress every 5 seconds
            if (Math.floor(currentTime) % 5 === 0) {
                this.saveVideoProgress(this.currentVideo.video);
            }
            
            // Mark as watched if video is 90% complete
            if (currentTime / duration >= 0.9 && !this.currentVideo.video.watched) {
                this.markVideoAsWatched(this.currentVideo.course.id, this.currentVideo.video.id);
            }
        }
    }

    onVideoEnded(event) {
        if (this.currentVideo) {
            this.markVideoAsWatched(this.currentVideo.course.id, this.currentVideo.video.id);
            this.showNotification('Vídeo concluído!', 'success');
            
            // Auto-play next video
            setTimeout(() => {
                this.playNextVideo(this.currentVideo.course.id, this.currentVideo.video.id);
            }, 2000);
        }
    }

    onVideoPause(event) {
        if (this.currentVideo) {
            this.saveVideoProgress(this.currentVideo.video);
        }
    }

    onVideoPlay(event) {
        // Video started playing
    }

    playPreviousVideo(courseId, currentVideoId) {
        const course = this.courses.find(c => c.id === courseId);
        if (!course) return;
        
        const currentIndex = course.videos.findIndex(v => v.id === currentVideoId);
        if (currentIndex > 0) {
            const previousVideo = course.videos[currentIndex - 1];
            this.playVideoFromPlaylist(courseId, previousVideo.id);
        }
    }

    playNextVideo(courseId, currentVideoId) {
        const course = this.courses.find(c => c.id === courseId);
        if (!course) return;
        
        const currentIndex = course.videos.findIndex(v => v.id === currentVideoId);
        if (currentIndex < course.videos.length - 1) {
            const nextVideo = course.videos[currentIndex + 1];
            this.playVideoFromPlaylist(courseId, nextVideo.id);
        } else {
            this.showNotification('Você chegou ao final do curso!', 'info');
        }
    }

    playVideoFromPlaylist(courseId, videoId) {
        // Close current player
        const currentPlayer = document.querySelector('.video-player-modal');
        if (currentPlayer) {
            currentPlayer.remove();
        }
        
        // Play new video
        this.playVideo(courseId, videoId);
    }

    markVideoAsWatched(courseId, videoId) {
        const course = this.courses.find(c => c.id === courseId);
        const video = course?.videos.find(v => v.id === videoId);
        
        if (course && video && !video.watched) {
            video.watched = true;
            video.currentTime = video.duration || 0;
            
            // Update course progress
            this.updateCourseProgress(course);
            
            // Save changes
            this.saveCourses();
            
            // Update UI if we're in course details
            if (document.getElementById('course-details-section')?.style.display !== 'none') {
                this.showCourseDetails(course);
            }
            
            // Update sidebar
            this.updateSidebarCourses();
        }
    }

    updateCourseProgress(course) {
        const watchedVideos = course.videos.filter(v => v.watched).length;
        course.progress = (watchedVideos / course.videos.length) * 100;
    }

    saveVideoProgress(video) {
        // Save to localStorage
        const progressKey = `video_progress_${video.id}`;
        const progressData = {
            currentTime: video.currentTime,
            duration: video.duration,
            lastWatched: new Date().toISOString()
        };
        localStorage.setItem(progressKey, JSON.stringify(progressData));
    }

    loadVideoProgress(video) {
        const progressKey = `video_progress_${video.id}`;
        const savedProgress = localStorage.getItem(progressKey);
        
        if (savedProgress) {
            const progressData = JSON.parse(savedProgress);
            video.currentTime = progressData.currentTime || 0;
            if (progressData.duration) {
                video.duration = progressData.duration;
            }
        }
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    deleteCourse(courseId) {
        const course = this.courses.find(c => c.id === courseId);
        if (!course) {
            this.showNotification('Curso não encontrado', 'error');
            return;
        }

        // Show confirmation dialog
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Deletar Curso</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="delete-confirmation">
                        <div class="warning-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                            </svg>
                        </div>
                        <div class="delete-message">
                            <h4>Tem certeza que deseja deletar o curso?</h4>
                            <p><strong>"${course.name}"</strong></p>
                            <p class="warning-text">Esta ação não pode ser desfeita. O curso será removido permanentemente da sua biblioteca, mas os arquivos de vídeo não serão excluídos do seu computador.</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                    <button class="btn-danger" id="confirm-delete-course">Deletar Curso</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listener for confirmation
        const confirmButton = modal.querySelector('#confirm-delete-course');
        confirmButton.addEventListener('click', () => {
            this.confirmDeleteCourse(courseId, modal);
        });
    }

    confirmDeleteCourse(courseId, modal) {
        // Remove course from array
        this.courses = this.courses.filter(c => c.id !== courseId);
        
        // Clean up video progress data
        const course = this.courses.find(c => c.id === courseId);
        if (course) {
            course.videos.forEach(video => {
                const progressKey = `video_progress_${video.id}`;
                localStorage.removeItem(progressKey);
            });
        }
        
        // Save changes
        this.saveCourses();
        
        // Update UI
        this.updateUI();
        
        // Close modal
        modal.remove();
        
        // Go back to library
        this.showLibrary();
        
        // Show success notification
        this.showNotification('Curso deletado com sucesso', 'success');
        
        // Update global variable
        if (window.courses !== undefined) {
            window.courses = this.courses;
        }
    }

    async generateVideoThumbnail(video) {
        return new Promise((resolve) => {
            // Create a temporary video element
            const tempVideo = document.createElement('video');
            tempVideo.crossOrigin = 'anonymous';
            tempVideo.muted = true;
            tempVideo.style.display = 'none';
            
            // Add to DOM temporarily
            document.body.appendChild(tempVideo);
            
            tempVideo.onloadeddata = () => {
                // Seek to 10% of the video duration for a better thumbnail
                const seekTime = tempVideo.duration * 0.1;
                tempVideo.currentTime = seekTime;
            };
            
            tempVideo.onseeked = () => {
                try {
                    // Create canvas to capture frame
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Set canvas dimensions
                    canvas.width = 280;
                    canvas.height = 160;
                    
                    // Draw video frame to canvas
                    ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
                    
                    // Convert to base64 data URL
                    const thumbnailData = canvas.toDataURL('image/jpeg', 0.8);
                    
                    // Store thumbnail
                    video.thumbnail = thumbnailData;
                    
                    // Save to localStorage for persistence
                    const thumbnailKey = `video_thumbnail_${video.id}`;
                    localStorage.setItem(thumbnailKey, thumbnailData);
                    
                    // Clean up
                    document.body.removeChild(tempVideo);
                    resolve(thumbnailData);
                } catch (error) {
                    console.error('Error generating thumbnail:', error);
                    document.body.removeChild(tempVideo);
                    resolve(null);
                }
            };
            
            tempVideo.onerror = () => {
                console.error('Error loading video for thumbnail generation');
                document.body.removeChild(tempVideo);
                resolve(null);
            };
            
            // Load the video
            tempVideo.src = `file://${video.path}`;
            tempVideo.load();
        });
    }

    async loadVideoThumbnail(video) {
        // Check if thumbnail is already loaded
        if (video.thumbnail) {
            return video.thumbnail;
        }
        
        // Check localStorage for cached thumbnail
        const thumbnailKey = `video_thumbnail_${video.id}`;
        const cachedThumbnail = localStorage.getItem(thumbnailKey);
        
        if (cachedThumbnail) {
            video.thumbnail = cachedThumbnail;
            return cachedThumbnail;
        }
        
        // Generate new thumbnail
        return await this.generateVideoThumbnail(video);
    }

    async generateCourseThumbnails(course) {
        if (!course || !course.videos || course.videos.length === 0) return;
        
        let generatedCount = 0;
        const totalVideos = course.videos.length;

        // Generate thumbnails one by one to avoid overwhelming the system
        for (const video of course.videos) {
            try {
                await this.loadVideoThumbnail(video);
                generatedCount++;
                
                // Update the specific video card if we're viewing this course
                if (document.getElementById('course-details-section')?.style.display !== 'none') {
                    this.updateVideoCard(course, video);
                }
                
            } catch (error) {
                console.error('Error generating thumbnail for video:', video.name, error);
            }
            
            // Small delay to prevent blocking the UI
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Save the course with updated thumbnails
        this.saveCourses();
    }

    updateVideoCard(course, video) {
        const videoCards = document.querySelectorAll('.video-card');
        const videoIndex = course.videos.findIndex(v => v.id === video.id);
        
        if (videoIndex >= 0 && videoCards[videoIndex]) {
            const thumbnailContainer = videoCards[videoIndex].querySelector('.video-thumbnail');
            if (thumbnailContainer && video.thumbnail) {
                // Replace placeholder with actual thumbnail
                const existingImg = thumbnailContainer.querySelector('.video-thumbnail-img');
                const placeholder = thumbnailContainer.querySelector('.thumbnail-placeholder');
                
                if (!existingImg && placeholder && video.thumbnail) {
                    const img = document.createElement('img');
                    img.src = video.thumbnail;
                    img.alt = 'Thumbnail do vídeo';
                    img.className = 'video-thumbnail-img';
                    
                    // Replace placeholder with image
                    thumbnailContainer.replaceChild(img, placeholder);
                }
            }
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new RobingoodApp();
    
    // Make courses available globally
    window.courses = window.app.courses;
});

// Expose API for Electron (fallback if preload doesn't work)
if (typeof require !== 'undefined') {
    const { ipcRenderer } = require('electron');
    
    window.electronAPI = {
        selectFolder: () => ipcRenderer.invoke('select-folder'),
        getVideoFiles: (folderPath) => ipcRenderer.invoke('get-video-files', folderPath),
        selectImage: () => ipcRenderer.invoke('select-image')
    };
} 