// Theme Loader - Applies saved theme to all pages
(function() {
    'use strict';
    
    // Theme definitions (must match rewards.js)
    const themes = {
        default: { primary: '#667eea', secondary: '#764ba2', accent: '#667eea' },
        ocean: { primary: '#4facfe', secondary: '#00f2fe', accent: '#4facfe' },
        sunset: { primary: '#fa709a', secondary: '#fee140', accent: '#fa709a' },
        forest: { primary: '#11998e', secondary: '#38ef7d', accent: '#11998e' },
        lavender: { primary: '#a8edea', secondary: '#fed6e3', accent: '#a8edea' },
        midnight: { primary: '#2c3e50', secondary: '#34495e', accent: '#2c3e50' },
        coral: { primary: '#ff6b6b', secondary: '#feca57', accent: '#ff6b6b' },
        aurora: { primary: '#667eea', secondary: '#764ba2', accent: '#f093fb' }
    };
    
    function applyTheme(themeId) {
        const theme = themes[themeId];
        if (!theme) return;
        
        // Set CSS variables
        document.documentElement.style.setProperty('--theme-primary', theme.primary);
        document.documentElement.style.setProperty('--theme-secondary', theme.secondary);
        document.documentElement.style.setProperty('--theme-accent', theme.accent);
        
        // Apply to body background
        document.body.style.background = `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`;
        
        // Update navigation active links
        const activeLinks = document.querySelectorAll('.nav-link.active');
        activeLinks.forEach(link => {
            link.style.background = theme.primary;
        });
        
        // Update primary buttons
        const primaryButtons = document.querySelectorAll('.btn-primary');
        primaryButtons.forEach(btn => {
            btn.style.background = `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`;
        });
        
        // Update progress bars
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach(bar => {
            bar.style.background = `linear-gradient(90deg, ${theme.primary} 0%, ${theme.secondary} 100%)`;
        });
        
        // Update points value color
        const pointsValue = document.getElementById('pointsValue');
        if (pointsValue) {
            pointsValue.style.color = theme.primary;
        }
        
        // Update shop tab active color
        const activeTab = document.querySelector('.shop-tab.active');
        if (activeTab) {
            activeTab.style.background = theme.primary;
        }
        
        // Update nav link hover colors
        const navLinks = document.querySelectorAll('.nav-link:not(.active)');
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', function() {
                this.style.color = theme.primary;
            });
            link.addEventListener('mouseleave', function() {
                if (!this.classList.contains('active')) {
                    this.style.color = '';
                }
            });
        });
        
        // Update result card borders
        const resultCards = document.querySelectorAll('.result-card');
        resultCards.forEach(card => {
            card.style.borderLeftColor = theme.primary;
        });
        
        // Update class color bars
        const colorBars = document.querySelectorAll('.class-color-bar');
        colorBars.forEach(bar => {
            // Keep class-specific colors, but update if needed
        });
        
        // Update cache item borders
        const cacheItems = document.querySelectorAll('.cache-item');
        cacheItems.forEach(item => {
            item.style.borderLeftColor = theme.primary;
        });
        
        // Update points banner gradient
        const pointsBanner = document.querySelector('.points-banner');
        if (pointsBanner) {
            pointsBanner.style.background = `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`;
        }
    }
    
    // Load theme on page load
    document.addEventListener('DOMContentLoaded', function() {
        const savedTheme = localStorage.getItem('websiteTheme');
        if (savedTheme) {
            try {
                const themeData = JSON.parse(savedTheme);
                if (themeData.id && themes[themeData.id]) {
                    applyTheme(themeData.id);
                } else {
                    // Fallback to default if saved theme is invalid
                    applyTheme('default');
                }
            } catch (e) {
                console.error('Error loading theme:', e);
                applyTheme('default');
            }
        } else {
            // No theme saved, use default
            applyTheme('default');
        }
    });
    
    // Export for use in rewards.js
    window.applyThemeFromLoader = applyTheme;
})();

