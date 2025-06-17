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
                    this.showNotification('No video files found in selected folder', 'warning');
                }
            }
        } catch (error) {
            console.error('Error selecting folder:', error);
            this.showNotification('Error selecting folder', 'error');
        }
    }

    showAddCourseDialog(folderPath, videoFiles) {
        // Create modal dialog for course naming
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add New Course</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="course-name">Course Name</label>
                        <input type="text" id="course-name" placeholder="Enter course name" value="${this.getFolderName(folderPath)}">
                    </div>
                    <div class="form-group">
                        <label>Found ${videoFiles.length} video file(s)</label>
                        <div class="file-list">
                            ${videoFiles.slice(0, 5).map(file => `<div class="file-item">${file.name}</div>`).join('')}
                            ${videoFiles.length > 5 ? `<div class="file-item-more">... and ${videoFiles.length - 5} more</div>` : ''}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button class="btn-primary" onclick="app.confirmAddCourse('${folderPath}', '${JSON.stringify(videoFiles).replace(/'/g, "\\'")}', this.closest('.modal-overlay'))">Add Course</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Focus on input
        setTimeout(() => {
            const input = modal.querySelector('#course-name');
            input.focus();
            input.select();
        }, 100);
    }

    confirmAddCourse(folderPath, videoFilesJson, modal) {
        const courseName = modal.querySelector('#course-name').value.trim();
        
        if (!courseName) {
            this.showNotification('Please enter a course name', 'warning');
            return;
        }

        const videoFiles = JSON.parse(videoFilesJson);
        
        const course = {
            id: Date.now().toString(),
            name: courseName,
            path: folderPath,
            videos: videoFiles.map((file, index) => ({
                id: `${Date.now()}_${index}`,
                name: file.name,
                path: file.path,
                watched: false,
                currentTime: 0,
                duration: 0
            })),
            createdAt: new Date().toISOString(),
            progress: 0
        };

        this.courses.push(course);
        this.saveCourses();
        this.updateUI();
        modal.remove();
        
        this.showNotification(`Course "${courseName}" added successfully!`, 'success');
    }

    getFolderName(folderPath) {
        return folderPath.split(/[\\/]/).pop() || 'New Course';
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
    }

    loadCourses() {
        try {
            const saved = localStorage.getItem('robingood-courses');
            this.courses = saved ? JSON.parse(saved) : [];
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
            coursesList.innerHTML = '<div class="no-courses">No courses added yet</div>';
            return;
        }

        coursesList.innerHTML = this.courses.map(course => `
            <div class="course-item" data-course-id="${course.id}">
                <div class="course-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                </div>
                <div class="course-info">
                    <div class="course-name">${course.name}</div>
                    <div class="course-progress">${course.videos.length} videos • ${Math.round(course.progress)}% complete</div>
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
                    <h3>No courses yet</h3>
                    <p>Start by adding your first course</p>
                </div>
            `;
            return;
        }

        coursesGrid.innerHTML = this.courses.map(course => `
            <div class="course-card" data-course-id="${course.id}">
                <div class="course-card-header">
                    <div class="course-card-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                        </svg>
                    </div>
                    <div class="course-card-info">
                        <div class="course-card-title">${course.name}</div>
                        <div class="course-card-subtitle">${course.videos.length} videos</div>
                    </div>
                </div>
                <div class="course-card-body">
                    <div class="course-stats">
                        <span>${course.videos.filter(v => v.watched).length}/${course.videos.length} watched</span>
                        <span>Added ${new Date(course.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="course-progress-bar">
                        <div class="course-progress-fill" style="width: ${course.progress}%"></div>
                    </div>
                </div>
            </div>
        `).join('');
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
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new RobingoodApp();
});

// Expose API for Electron
if (typeof require !== 'undefined') {
    const { ipcRenderer } = require('electron');
    
    window.electronAPI = {
        selectFolder: () => ipcRenderer.invoke('select-folder'),
        getVideoFiles: (folderPath) => ipcRenderer.invoke('get-video-files', folderPath)
    };
} 