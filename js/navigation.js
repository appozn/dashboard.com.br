// OZNEH IA - Navigation Controller
// Manages page navigation and routing

class NavigationController {
    constructor() {
        this.currentPage = 'dashboard';
        this.pages = {
            dashboard: document.getElementById('page-dashboard'),
            signals: document.getElementById('page-signals'),
            charts: document.getElementById('page-charts'),
            portfolio: document.getElementById('page-portfolio'),
            alerts: document.getElementById('page-alerts'),
            settings: document.getElementById('page-settings')
        };
        this.init();
    }

    init() {
        // Set up navigation links
        const navLinks = document.querySelectorAll('.sidebar-nav a:not([href="index.html"])');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pageId = link.getAttribute('data-page');
                if (pageId) {
                    this.navigateTo(pageId);
                }
            });
        });

        // Show initial page
        this.showPage('dashboard');
    }

    navigateTo(pageId) {
        if (this.pages[pageId]) {
            this.currentPage = pageId;
            this.showPage(pageId);
            this.updateActiveNav(pageId);

            // Special handling for pages that need fresh data
            if (pageId === 'charts' && window.dashboard) {
                window.dashboard.updateChart(window.dashboard.currentSymbol);
            }
        }
    }

    showPage(pageId) {
        // Hide all pages
        Object.values(this.pages).forEach(page => {
            if (page) page.style.display = 'none';
        });

        // Show selected page
        if (this.pages[pageId]) {
            this.pages[pageId].style.display = 'block';
        }
    }

    updateActiveNav(pageId) {
        // Remove active class from all nav links
        const navLinks = document.querySelectorAll('.sidebar-nav a');
        navLinks.forEach(link => link.classList.remove('active'));

        // Add active class to current page link
        const activeLink = document.querySelector(`.sidebar-nav a[data-page="${pageId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    getCurrentPage() {
        return this.currentPage;
    }
}

// Export singleton instance
const navigationController = new NavigationController();
