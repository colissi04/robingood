// Profile management
class ProfileManager {
    constructor() {
        this.userProfile = this.loadProfile();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateProfileUI();
        this.updateStatistics();
    }

    setupEventListeners() {
        // Edit avatar button
        const editAvatarBtn = document.getElementById('edit-avatar-btn');
        if (editAvatarBtn) {
            editAvatarBtn.addEventListener('click', () => this.selectAvatar());
        }

        // Save profile button
        const saveProfileBtn = document.getElementById('save-profile-btn');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => this.saveProfile());
        }

        // Profile name input - save on Enter
        const profileNameInput = document.getElementById('profile-name-input');
        if (profileNameInput) {
            profileNameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.saveProfile();
                }
            });
        }
    }

    loadProfile() {
        try {
            const saved = localStorage.getItem('robingood-user-profile');
            return saved ? JSON.parse(saved) : {
                name: 'User',
                avatar: '../assets/default-avatar.svg',
                createdAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error loading profile:', error);
            return {
                name: 'User',
                avatar: '../assets/default-avatar.svg',
                createdAt: new Date().toISOString()
            };
        }
    }

    saveProfileData() {
        try {
            localStorage.setItem('robingood-user-profile', JSON.stringify(this.userProfile));
        } catch (error) {
            console.error('Error saving profile:', error);
        }
    }

    async selectAvatar() {
        try {
            // Try to use Electron's dialog first
            if (window.electronAPI?.selectImage) {
                const result = await window.electronAPI.selectImage();
                
                if (result && !result.canceled && result.filePaths.length > 0) {
                    const imagePath = result.filePaths[0];
                    this.userProfile.avatar = `file://${imagePath}`;
                    this.updateAvatarDisplay();
                    this.showNotification('Avatar atualizado com sucesso!', 'success');
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
                            this.userProfile.avatar = event.target.result;
                            this.updateAvatarDisplay();
                            this.showNotification('Avatar atualizado com sucesso!', 'success');
                        };
                        reader.readAsDataURL(file);
                    }
                    document.body.removeChild(input);
                };
                
                document.body.appendChild(input);
                input.click();
            }
        } catch (error) {
            console.error('Error selecting avatar:', error);
            this.showNotification('Erro ao selecionar avatar', 'error');
        }
    }

    saveProfile() {
        const nameInput = document.getElementById('profile-name-input');
        if (!nameInput) return;

        const newName = nameInput.value.trim();
        if (!newName) {
            this.showNotification('Por favor, digite um nome válido', 'warning');
            return;
        }

        this.userProfile.name = newName;
        this.saveProfileData();
        this.updateProfileUI();
        this.showNotification('Perfil salvo com sucesso!', 'success');
    }

    updateAvatarDisplay() {
        // Update sidebar avatar
        const sidebarAvatar = document.getElementById('profile-img');
        if (sidebarAvatar) {
            sidebarAvatar.src = this.userProfile.avatar;
        }

        // Update profile edit avatar
        const profileEditAvatar = document.getElementById('profile-avatar-edit');
        if (profileEditAvatar) {
            profileEditAvatar.src = this.userProfile.avatar;
        }
    }

    updateProfileUI() {
        // Update sidebar name
        const sidebarName = document.getElementById('username');
        if (sidebarName) {
            sidebarName.textContent = this.userProfile.name;
        }

        // Update profile edit name input
        const profileNameInput = document.getElementById('profile-name-input');
        if (profileNameInput) {
            profileNameInput.value = this.userProfile.name;
        }

        // Update avatars
        this.updateAvatarDisplay();
        this.saveProfileData();
    }

    updateStatistics() {
        const courses = window.app?.courses || [];
        
        // Calculate statistics
        const totalCourses = courses.length;
        const totalVideos = courses.reduce((sum, course) => sum + course.videos.length, 0);
        const watchedVideos = courses.reduce((sum, course) => 
            sum + course.videos.filter(video => video.watched).length, 0);
        const completedCourses = courses.filter(course => course.progress >= 100).length;
        
        // Calculate total watch time
        const totalWatchTime = courses.reduce((sum, course) => {
            return sum + course.videos.reduce((videoSum, video) => {
                return videoSum + (video.watched ? (video.duration || 0) : (video.currentTime || 0));
            }, 0);
        }, 0);

        // Calculate average progress
        const avgProgress = totalCourses > 0 ? 
            courses.reduce((sum, course) => sum + (course.progress || 0), 0) / totalCourses : 0;

        // Update UI elements
        this.updateStatElement('stat-total-courses', totalCourses);
        this.updateStatElement('stat-total-videos', totalVideos);
        this.updateStatElement('stat-watched-videos', watchedVideos);
        this.updateStatElement('stat-completed-courses', completedCourses);
        this.updateStatElement('stat-watch-time', this.formatTime(totalWatchTime));
        this.updateStatElement('stat-avg-progress', `${Math.round(avgProgress)}%`);
    }

    updateStatElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0h 0m';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    showNotification(message, type = 'info') {
        if (window.app && typeof window.app.showNotification === 'function') {
            window.app.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Public method to refresh statistics when courses change
    refreshStatistics() {
        this.updateStatistics();
    }

    // Method to get current profile
    getProfile() {
        return this.userProfile;
    }
}

// Initialize profile manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
});

// Export for other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfileManager;
} 