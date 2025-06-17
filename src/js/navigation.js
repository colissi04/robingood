// Navigation management
class NavigationManager {
    constructor() {
        this.currentSection = 'home';
        this.history = ['home'];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showSection(this.currentSection);
    }

    setupEventListeners() {
        // Navigation items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                if (section) {
                    this.navigateToSection(section);
                }
            });
        });

        // Back button
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.goBack());
        }

        // Course items in sidebar
        document.addEventListener('click', (e) => {
            const courseItem = e.target.closest('.course-item');
            if (courseItem) {
                const courseId = courseItem.getAttribute('data-course-id');
                if (courseId) {
                    this.navigateToCourse(courseId);
                }
            }
        });

        // Course cards in main content
        document.addEventListener('click', (e) => {
            const courseCard = e.target.closest('.course-card');
            if (courseCard) {
                const courseId = courseCard.getAttribute('data-course-id');
                if (courseId) {
                    this.navigateToCourse(courseId);
                }
            }
        });
    }

    navigateToSection(section) {
        if (section === this.currentSection) return;

        this.history.push(section);
        this.currentSection = section;
        this.showSection(section);
        this.updateNavigation();
        this.updateBackButton();
    }

    navigateToCourse(courseId) {
        // Navigate to course details using the main app
        if (window.app && typeof window.app.openCourse === 'function') {
            window.app.openCourse(courseId);
        } else {
            console.log('Navigate to course:', courseId);
            this.showNotification('App not ready', 'error');
        }
    }

    goBack() {
        if (this.history.length <= 1) return;

        this.history.pop(); // Remove current
        const previousSection = this.history[this.history.length - 1];
        this.currentSection = previousSection;
        this.showSection(previousSection);
        this.updateNavigation();
        this.updateBackButton();
    }

    showSection(section) {
        // Hide all sections
        const sections = document.querySelectorAll('.content-area > section');
        sections.forEach(s => s.style.display = 'none');

        // Show target section
        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        // Update page title
        this.updatePageTitle(section);
    }

    updateNavigation() {
        // Update active nav item
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const section = item.getAttribute('data-section');
            if (section === this.currentSection) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update course items active state
        const courseItems = document.querySelectorAll('.course-item');
        courseItems.forEach(item => {
            item.classList.remove('active');
        });
    }

    updateBackButton() {
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            if (this.history.length > 1) {
                backBtn.style.display = 'flex';
            } else {
                backBtn.style.display = 'none';
            }
        }
    }

    updatePageTitle(section) {
        const pageTitle = document.getElementById('page-title');
        if (!pageTitle) return;

        const titles = {
            'home': 'Home',
            'settings': 'Settings',
            'course': 'Course Details'
        };

        pageTitle.textContent = titles[section] || 'Robingood';
    }

    // Public methods
    getCurrentSection() {
        return this.currentSection;
    }

    canGoBack() {
        return this.history.length > 1;
    }

    // Method to show notifications (shared with main app)
    showNotification(message, type = 'info') {
        if (window.app && typeof window.app.showNotification === 'function') {
            window.app.showNotification(message, type);
        } else {
            // Fallback notification
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Method to navigate programmatically
    navigate(section) {
        this.navigateToSection(section);
    }

    // Method to reset navigation
    reset() {
        this.history = ['home'];
        this.currentSection = 'home';
        this.showSection('home');
        this.updateNavigation();
        this.updateBackButton();
    }
}

// Initialize navigation manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
});

// Export for other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
} 