// Theme management
class ThemeManager {
    constructor() {
        this.currentTheme = 'dark';
        this.init();
    }

    init() {
        this.loadTheme();
        this.setupEventListeners();
        this.updateThemeIcon();
    }

    setupEventListeners() {
        // Theme toggle button
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Theme select in settings
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => this.setTheme(e.target.value));
        }
    }

    loadTheme() {
        try {
            const savedTheme = localStorage.getItem('robingood-theme');
            this.currentTheme = savedTheme || 'dark';
            this.applyTheme(this.currentTheme);
        } catch (error) {
            console.error('Error loading theme:', error);
            this.currentTheme = 'dark';
            this.applyTheme(this.currentTheme);
        }
    }

    setTheme(theme) {
        if (theme === this.currentTheme) return;
        
        this.currentTheme = theme;
        this.applyTheme(theme);
        this.saveTheme();
        this.updateThemeIcon();
        this.updateThemeSelect();
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        
        // Add smooth transition for theme change
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        
        // Remove transition after animation
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    saveTheme() {
        try {
            localStorage.setItem('robingood-theme', this.currentTheme);
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    }

    updateThemeIcon() {
        const themeIcon = document.querySelector('.theme-icon');
        if (!themeIcon) return;

        if (this.currentTheme === 'dark') {
            // Sun icon for switching to light
            themeIcon.innerHTML = `
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
            `;
        } else {
            // Moon icon for switching to dark
            themeIcon.innerHTML = `
                <path d="M17.75 4.09L15.22 6.03L16.13 9.09L13.5 7.28L10.87 9.09L11.78 6.03L9.25 4.09L12.44 4L13.5 1L14.56 4L17.75 4.09M21.25 11L19.61 12.25L20.2 14.23L18.5 13.06L16.8 14.23L17.39 12.25L15.75 11L17.81 10.95L18.5 9L19.19 10.95L21.25 11M18.97 15.95C19.8 15.87 20.69 17.05 20.16 17.8C19.84 18.25 19.5 18.67 19.08 19.07C15.17 23 8.84 23 4.94 19.07C1.03 15.17 1.03 8.83 4.94 4.93C5.34 4.53 5.76 4.17 6.21 3.85C6.96 3.32 8.14 4.21 8.06 5.04C7.79 7.9 8.75 10.87 10.95 13.06C13.14 15.26 16.1 16.22 18.97 15.95Z"/>
            `;
        }
    }

    updateThemeSelect() {
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.value = this.currentTheme;
        }
    }

    // Method to get current theme (for other modules)
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Method to check if dark theme is active
    isDarkTheme() {
        return this.currentTheme === 'dark';
    }

    // Method to check if light theme is active
    isLightTheme() {
        return this.currentTheme === 'light';
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});

// Export for other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
} 