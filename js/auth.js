// OZNEH IA - Authentication Controller
// Manages user login and registration

class AuthController {
    constructor() {
        this.loginForm = document.getElementById('login-form');
        this.signupForm = document.getElementById('signup-form');
        this.toggleAuth = document.getElementById('toggle-auth');
        this.authTitle = document.getElementById('auth-title');
        this.authDescription = document.getElementById('auth-description');
        this.isLoginMode = true;

        this.init();
    }

    init() {
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        if (this.signupForm) {
            this.signupForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        if (this.toggleAuth) {
            this.toggleAuth.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMode();
            });
        }
    }

    toggleMode() {
        this.isLoginMode = !this.isLoginMode;

        if (this.isLoginMode) {
            this.loginForm.style.display = 'flex';
            this.signupForm.style.display = 'none';
            this.authTitle.textContent = 'Acessar Conta';
            this.authDescription.textContent = 'Entre com suas credenciais para acessar o dashboard';
            this.toggleAuth.innerHTML = 'Não tem uma conta? <span>Criar Conta</span>';
        } else {
            this.loginForm.style.display = 'none';
            this.signupForm.style.display = 'flex';
            this.authTitle.textContent = 'Criar Conta';
            this.authDescription.textContent = 'Cadastre-se para começar a receber sinais inteligentes e lucrar';
            this.toggleAuth.innerHTML = 'Já tem uma conta? <span>Acessar</span>';
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const emailInput = form.querySelector('input[type="email"]');
        const passwordInput = form.querySelector('input[type="password"]');

        // Validation
        if (!emailInput?.value || !passwordInput?.value) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        const email = emailInput.value;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;

        // Visual feedback
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="ri-loader-4-line animate-spin"></i> Processando...';

        // Simulate API call
        setTimeout(() => {
            // Manage registered users
            const registeredUsers = JSON.parse(localStorage.getItem('ozneh_registered_users') || '[]');

            if (!this.isLoginMode) {
                // Sign Up Check
                if (registeredUsers.includes(email)) {
                    alert('Este e-mail já está cadastrado. Por favor, faça login.');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                    return;
                }
                registeredUsers.push(email);
                localStorage.setItem('ozneh_registered_users', JSON.stringify(registeredUsers));
            } else {
                // Login Check (Simulated)
                if (!registeredUsers.includes(email) && email !== 'admin123@premium.com') {
                    alert('Usuário não encontrado. Por favor, crie uma conta.');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                    return;
                }
            }

            // Save session
            localStorage.setItem('ozneh_auth', 'true');
            localStorage.setItem('ozneh_user', email);

            // Per-user Trial Tracking
            const trialData = JSON.parse(localStorage.getItem('ozneh_user_trials') || '{}');

            // Set fresh trial for new signup OR if returning user has no record
            if (!this.isLoginMode || !trialData[email]) {
                trialData[email] = Date.now().toString();
                localStorage.setItem('ozneh_user_trials', JSON.stringify(trialData));
                localStorage.setItem('ozneh_show_welcome', 'true');
            }

            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        }, 1500);
    }

    checkAuth() {
        const isAuth = localStorage.getItem('ozneh_auth');
        if (isAuth === 'true' && window.location.pathname.includes('index.html')) {
            window.location.href = 'dashboard.html';
        }
    }
}

// Initialize Auth
document.addEventListener('DOMContentLoaded', () => {
    const auth = new AuthController();
    auth.checkAuth();
});
