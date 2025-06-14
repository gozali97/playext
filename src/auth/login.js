class LoginHandler {
    constructor(logger) {
        this.page = null;
        this.logger = logger;
        this.config = null;
        this.maxRetries = 3;
        this.retryDelay = 2000;
        this.isReactMode = false;
    }

    setPage(page) {
        this.page = page;
    }

    setConfig(config) {
        this.config = config;
        // Determine if should use React mode
        this.isReactMode = config?.reactMode?.enabled !== false; // Default true, can be disabled
    }

    async login(url, username, password, config = null) {
        if (config) {
            this.setConfig(config);
        }

        try {
            this.logger.info(`Memulai proses login... (Mode: ${this.isReactMode ? 'React' : 'Standard'})`);
            
            // Navigate with appropriate strategy
            if (this.isReactMode) {
                await this.navigateWithReactSupport(url);
            } else {
                await this.navigateStandard(url);
            }

            // Check if already logged in
            const isAlreadyLoggedIn = await this.verifyLogin();
            if (isAlreadyLoggedIn) {
                this.logger.info('Sudah dalam status login');
                return { success: true, message: 'Sudah login sebelumnya' };
            }

            // Find login page with appropriate strategy
            const loginPageFound = await this.findLoginPage();
            if (!loginPageFound) {
                throw new Error('Halaman login tidak ditemukan');
            }

            // Find form elements with appropriate strategy
            const formElements = await this.findLoginFormElements();
            if (!formElements.usernameField || !formElements.passwordField) {
                throw new Error('Form login tidak ditemukan atau tidak lengkap');
            }

            // Handle CSRF token if present
            await this.handleCSRFToken();

            // Fill and submit form
            await this.fillLoginForm(formElements, username, password);
            const loginResult = await this.submitLoginForm(formElements);
            
            if (loginResult.success) {
                this.logger.info('Login berhasil');
                return { success: true, message: 'Login berhasil' };
            } else {
                this.logger.error('Login gagal:', loginResult.message);
                return { success: false, message: loginResult.message };
            }

        } catch (error) {
            this.logger.error('Error selama proses login:', error);
            return { success: false, message: error.message };
        }
    }

    async navigateStandard(url) {
        this.logger.info(`Navigasi standard ke ${url}...`);
        await this.page.goto(url, { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        await this.randomDelay(1000, 2000);
    }

    async navigateWithReactSupport(url) {
        this.logger.info(`Navigasi ke ${url} dengan dukungan React...`);
        
        await this.page.goto(url, { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });

        // Wait for React to load
        await this.waitForReactLoad();
        
        // Additional delay for dynamic content
        await this.randomDelay(1000, 2000);
        
        // Take screenshot for debugging
        if (this.config?.debug) {
            await this.page.screenshot({ path: 'debug-navigate.png' });
        }
    }

    async waitForReactLoad() {
        try {
            // Wait for common React indicators
            await this.page.waitForFunction(
                () => {
                    return window.React || 
                           window.__REACT_DEVTOOLS_GLOBAL_HOOK__ ||
                           document.querySelector('[data-reactroot]') ||
                           document.querySelector('#root') ||
                           document.querySelector('.react-app') ||
                           document.readyState === 'complete';
                },
                { timeout: 10000 }
            );
            
            await this.page.waitForLoadState('domcontentloaded');
            await this.page.waitForTimeout(1000);
            
            this.logger.info('React aplikasi telah dimuat');
        } catch (error) {
            this.logger.warn('Timeout menunggu React load, melanjutkan...');
        }
    }

    async findLoginPage() {
        if (this.isReactMode) {
            return await this.findLoginPageReact();
        } else {
            return await this.findLoginPageStandard();
        }
    }

    async findLoginPageStandard() {
        try {
            this.logger.info('Mencari halaman login dengan metode standard...');
            
            // Check if current page is already login page
            const hasLoginForm = await this.page.$('input[type="password"]');
            if (hasLoginForm) {
                this.logger.info('Halaman login ditemukan di URL saat ini');
                return true;
            }

            // Look for login links with standard selectors
            const loginLinks = [
                'a[href*="login"]',
                'a[href*="signin"]',
                'a[href*="masuk"]',
                '.login-link',
                '.signin-link',
                '#login-link'
            ];

            for (const selector of loginLinks) {
                try {
                    const link = await this.page.$(selector);
                    if (link) {
                        this.logger.info(`Menemukan link login: ${selector}`);
                        await Promise.all([
                            this.page.waitForNavigation({ waitUntil: 'networkidle' }),
                            link.click()
                        ]);
                        await this.randomDelay();
                        return true;
                    }
                } catch (e) {
                    // Continue to next selector
                }
            }

            // Try common login URLs
            const currentUrl = this.page.url();
            const baseUrl = new URL(currentUrl).origin;
            const loginPaths = ['/login', '/signin', '/auth/login', '/user/login', '/account/login'];

            for (const path of loginPaths) {
                try {
                    const loginUrl = baseUrl + path;
                    this.logger.info(`Mencoba URL login: ${loginUrl}`);
                    await this.page.goto(loginUrl, { waitUntil: 'networkidle' });
                    await this.randomDelay();
                    
                    const hasPasswordField = await this.page.$('input[type="password"]');
                    if (hasPasswordField) {
                        this.logger.info('Halaman login ditemukan');
                        return true;
                    }
                } catch (e) {
                    // Continue to next URL
                }
            }

            return false;
        } catch (error) {
            this.logger.error('Error mencari halaman login:', error);
            return false;
        }
    }

    async findLoginPageReact() {
        try {
            this.logger.info('Mencari halaman login dengan dukungan React...');
            
            await this.waitForReactLoad();
            
            const hasLoginForm = await this.checkForLoginForm();
            if (hasLoginForm) {
                this.logger.info('Halaman login ditemukan di URL saat ini');
                return true;
            }

            // React-aware login link detection
            const loginStrategies = [
                { type: 'css', selectors: [
                    'a[href*="login"]', 'a[href*="signin"]', 'a[href*="masuk"]',
                    '[data-testid*="login"]', '[data-cy*="login"]',
                    '.login-link', '.signin-link', '#login-link',
                    'button[class*="login"]', 'div[class*="login"] a'
                ]},
                { type: 'xpath', selectors: [
                    '//a[contains(text(), "Login")]',
                    '//a[contains(text(), "Sign In")]', 
                    '//a[contains(text(), "Masuk")]',
                    '//button[contains(text(), "Login")]',
                    '//*[@data-testid="login-link"]'
                ]}
            ];

            for (const strategy of loginStrategies) {
                for (const selector of strategy.selectors) {
                    try {
                        let element;
                        if (strategy.type === 'xpath') {
                            element = await this.page.$(`xpath=${selector}`);
                        } else {
                            element = await this.page.$(selector);
                        }
                        
                        if (element) {
                            this.logger.info(`Menemukan link login: ${selector} (${strategy.type})`);
                            await this.clickWithRetry(element);
                            await this.waitForReactLoad();
                            
                            const hasForm = await this.checkForLoginForm();
                            if (hasForm) {
                                return true;
                            }
                        }
                    } catch (e) {
                        // Continue to next selector
                    }
                }
            }

            // Try common login URLs
            const currentUrl = this.page.url();
            const baseUrl = new URL(currentUrl).origin;
            const loginPaths = ['/login', '/signin', '/auth/login', '/user/login', '/account/login'];

            for (const path of loginPaths) {
                try {
                    const loginUrl = baseUrl + path;
                    this.logger.info(`Mencoba URL login: ${loginUrl}`);
                    await this.navigateWithReactSupport(loginUrl);
                    
                    const hasForm = await this.checkForLoginForm();
                    if (hasForm) {
                        this.logger.info('Halaman login ditemukan');
                        return true;
                    }
                } catch (e) {
                    // Continue to next URL
                }
            }

            return false;
        } catch (error) {
            this.logger.error('Error mencari halaman login:', error);
            return false;
        }
    }

    async checkForLoginForm() {
        try {
            const checks = [
                () => this.page.$('input[type="password"]'),
                () => this.page.$('input[name*="password"]'),
                () => this.page.$('[data-testid*="password"]'),
                () => this.page.$('xpath=//input[@type="password"]')
            ];

            for (const check of checks) {
                const result = await check();
                if (result) {
                    return true;
                }
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    async findLoginFormElements() {
        if (this.isReactMode) {
            return await this.findLoginFormReact();
        } else {
            return await this.findLoginFormStandard();
        }
    }

    async findLoginFormStandard() {
        try {
            this.logger.info('Mencari elemen form login dengan metode standard...');
            
            const defaultSelectors = {
                usernameFields: [
                    'input[name="username"]',
                    'input[name="email"]',
                    'input[type="email"]',
                    'input[name="login"]',
                    '#username',
                    '#email',
                    '.username',
                    '.email'
                ],
                passwordFields: [
                    'input[name="password"]',
                    'input[type="password"]',
                    '#password',
                    '.password'
                ],
                submitButtons: [
                    'button[type="submit"]',
                    'input[type="submit"]',
                    '.login-button',
                    '.submit-button',
                    '.btn-submit',
                    '.btn-login'
                ]
            };

            const selectors = this.config?.selectors?.login || defaultSelectors;
            const formElements = {};

            // Find username field
            for (const selector of selectors.usernameFields) {
                const element = await this.page.$(selector);
                if (element) {
                    formElements.usernameField = element;
                    this.logger.info(`Username field ditemukan: ${selector}`);
                    break;
                }
            }

            // Find password field
            for (const selector of selectors.passwordFields) {
                const element = await this.page.$(selector);
                if (element) {
                    formElements.passwordField = element;
                    this.logger.info(`Password field ditemukan: ${selector}`);
                    break;
                }
            }

            // Find submit button
            for (const selector of selectors.submitButtons) {
                const element = await this.page.$(selector);
                if (element) {
                    formElements.submitButton = element;
                    this.logger.info(`Submit button ditemukan: ${selector}`);
                    break;
                }
            }

            return formElements;
        } catch (error) {
            this.logger.error('Error mencari form login:', error);
            return {};
        }
    }

    async findLoginFormReact() {
        try {
            this.logger.info('Mencari elemen form login dengan dukungan React...');
            
            await this.waitForReactLoad();
            
            const formElements = {};
            
            const selectorStrategies = {
                usernameFields: [
                    'input[name="username"]', 'input[name="email"]', 'input[type="email"]',
                    '[data-testid*="username"]', '[data-testid*="email"]',
                    '#username', '#email', '.username', '.email',
                    'input[placeholder*="email"]', 'input[placeholder*="username"]',
                    'xpath=//input[@type="email"]',
                    'xpath=//input[contains(@placeholder, "email")]'
                ],
                passwordFields: [
                    'input[name="password"]', 'input[type="password"]',
                    '[data-testid*="password"]', '#password', '.password',
                    'input[placeholder*="password"]',
                    'xpath=//input[@type="password"]'
                ],
                submitButtons: [
                    'button[type="submit"]', 'input[type="submit"]',
                    '[data-testid*="submit"]', '[data-testid*="login"]',
                    '.login-button', '.submit-button', '.btn-primary',
                    'xpath=//button[@type="submit"]',
                    'xpath=//button[contains(text(), "Login")]'
                ]
            };

            const selectors = this.config?.selectors?.login || selectorStrategies;

            formElements.usernameField = await this.findElementWithStrategies(
                selectors.usernameFields, 'Username field'
            );

            formElements.passwordField = await this.findElementWithStrategies(
                selectors.passwordFields, 'Password field'
            );

            formElements.submitButton = await this.findElementWithStrategies(
                selectors.submitButtons, 'Submit button', false
            );

            if (this.config?.debug) {
                await this.page.screenshot({ path: 'debug-form-found.png' });
            }

            return formElements;
        } catch (error) {
            this.logger.error('Error mencari form login:', error);
            return {};
        }
    }

    async findElementWithStrategies(selectors, fieldName, required = true) {
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            for (const selector of selectors) {
                try {
                    let element;
                    if (selector.startsWith('xpath=')) {
                        element = await this.page.$(selector);
                    } else {
                        element = await this.page.$(selector);
                    }
                    
                    if (element) {
                        const isVisible = await element.isVisible();
                        const isEnabled = await element.isEnabled();
                        
                        if (isVisible && isEnabled) {
                            this.logger.info(`${fieldName} ditemukan: ${selector}`);
                            return element;
                        }
                    }
                } catch (e) {
                    // Continue to next selector
                }
            }
            
            if (attempt < this.maxRetries - 1) {
                this.logger.info(`${fieldName} tidak ditemukan, retry ${attempt + 1}/${this.maxRetries}...`);
                await this.page.waitForTimeout(this.retryDelay);
                if (this.isReactMode) {
                    await this.waitForReactLoad();
                }
            }
        }

        if (required) {
            this.logger.error(`${fieldName} tidak ditemukan setelah ${this.maxRetries} percobaan`);
        } else {
            this.logger.warn(`${fieldName} tidak ditemukan (opsional)`);
        }
        
        return null;
    }

    async handleCSRFToken() {
        try {
            this.logger.info('Memeriksa CSRF token...');
            
            const csrfSelectors = [
                'input[name="_token"]',
                'input[name="csrf_token"]',
                'input[name="authenticity_token"]',
                'meta[name="csrf-token"]',
                '[data-csrf]'
            ];

            if (this.isReactMode) {
                csrfSelectors.push(
                    'xpath=//input[@name="_token"]',
                    'xpath=//meta[@name="csrf-token"]'
                );
            }

            for (const selector of csrfSelectors) {
                try {
                    let element;
                    if (selector.startsWith('xpath=')) {
                        element = await this.page.$(selector);
                    } else {
                        element = await this.page.$(selector);
                    }
                    
                    if (element) {
                        const value = await element.getAttribute('value') || await element.getAttribute('content');
                        if (value) {
                            this.logger.info('CSRF token ditemukan dan akan digunakan');
                            return value;
                        }
                    }
                } catch (e) {
                    // Continue
                }
            }
            
            this.logger.info('CSRF token tidak ditemukan');
            return null;
        } catch (error) {
            this.logger.warn('Error handling CSRF token:', error.message);
            return null;
        }
    }

    async fillLoginForm(formElements, username, password) {
        if (this.isReactMode) {
            return await this.fillLoginFormReact(formElements, username, password);
        } else {
            return await this.fillLoginFormStandard(formElements, username, password);
        }
    }

    async fillLoginFormStandard(formElements, username, password) {
        try {
            this.logger.info('Mengisi form login dengan metode standard...');
            
            if (formElements.usernameField) {
                await formElements.usernameField.click();
                await formElements.usernameField.fill('');
                await this.randomDelay(500, 1000);
                await formElements.usernameField.type(username, { delay: this.getRandomDelay(50, 150) });
                this.logger.info('Username berhasil diisi');
            }

            if (formElements.passwordField) {
                await formElements.passwordField.click();
                await formElements.passwordField.fill('');
                await this.randomDelay(500, 1000);
                await formElements.passwordField.type(password, { delay: this.getRandomDelay(50, 150) });
                this.logger.info('Password berhasil diisi');
            }

            await this.randomDelay();
        } catch (error) {
            this.logger.error('Error mengisi form login:', error);
            throw error;
        }
    }

    async fillLoginFormReact(formElements, username, password) {
        try {
            this.logger.info('Mengisi form login dengan dukungan React...');
            
            if (formElements.usernameField) {
                await this.clearAndFillReact(formElements.usernameField, username, 'Username');
            }

            await this.randomDelay(500, 1000);

            if (formElements.passwordField) {
                await this.clearAndFillReact(formElements.passwordField, password, 'Password');
            }

            await this.randomDelay(500, 1000);

            if (this.config?.debug) {
                await this.page.screenshot({ path: 'debug-form-filled.png' });
            }

            this.logger.info('Form login berhasil diisi');
        } catch (error) {
            this.logger.error('Error mengisi form login:', error);
            throw error;
        }
    }

    async clearAndFillReact(element, value, fieldName) {
        try {
            await element.focus();
            await this.randomDelay(100, 300);

            // Clear field multiple ways for React
            await element.selectText();
            await element.press('Delete');
            await element.press('Backspace');
            await element.evaluate(el => el.value = '');
            await element.fill('');
            
            await this.randomDelay(100, 300);

            // Type character by character
            await element.type(value, { delay: 50 });
            
            // Trigger React events
            await element.dispatchEvent('input');
            await element.dispatchEvent('change');
            await element.dispatchEvent('blur');
            
            // Verify value was set
            const actualValue = await element.inputValue();
            if (actualValue !== value) {
                this.logger.warn(`${fieldName} value mismatch. Expected: ${value}, Got: ${actualValue}`);
                await element.fill(value);
                await element.dispatchEvent('input');
            }

            this.logger.info(`${fieldName} berhasil diisi`);
        } catch (error) {
            this.logger.error(`Error mengisi ${fieldName}:`, error);
            throw error;
        }
    }

    async submitLoginForm(formElements) {
        if (this.isReactMode) {
            return await this.submitLoginFormReact(formElements);
        } else {
            return await this.submitLoginFormStandard(formElements);
        }
    }

    async submitLoginFormStandard(formElements) {
        try {
            this.logger.info('Mengirim form login dengan metode standard...');
            
            await this.randomDelay(1000, 2000);

            if (formElements.submitButton) {
                await Promise.all([
                    this.page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }),
                    formElements.submitButton.click()
                ]);
            } else {
                // Fallback: press Enter on password field
                await Promise.all([
                    this.page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }),
                    formElements.passwordField.press('Enter')
                ]);
            }

            await this.randomDelay();

            const loginSuccess = await this.verifyLogin();
            
            if (loginSuccess) {
                return { success: true, message: 'Login berhasil' };
            } else {
                const errorMessage = await this.getErrorMessage();
                return { success: false, message: errorMessage || 'Login gagal' };
            }

        } catch (error) {
            this.logger.error('Error submit form login:', error);
            return { success: false, message: error.message };
        }
    }

    async submitLoginFormReact(formElements) {
        try {
            this.logger.info('Mengirim form login dengan dukungan React...');
            
            await this.randomDelay(1000, 2000);

            let submitted = false;

            if (formElements.submitButton) {
                try {
                    await this.clickWithRetry(formElements.submitButton);
                    submitted = true;
                    this.logger.info('Form disubmit menggunakan tombol submit');
                } catch (error) {
                    this.logger.warn('Gagal menggunakan tombol submit:', error.message);
                }
            }

            if (!submitted && formElements.passwordField) {
                try {
                    await formElements.passwordField.press('Enter');
                    submitted = true;
                    this.logger.info('Form disubmit menggunakan Enter key');
                } catch (error) {
                    this.logger.warn('Gagal menggunakan Enter key:', error.message);
                }
            }

            if (!submitted) {
                try {
                    const form = await this.page.$('form');
                    if (form) {
                        await form.evaluate(f => f.submit());
                        submitted = true;
                        this.logger.info('Form disubmit menggunakan form.submit()');
                    }
                } catch (error) {
                    this.logger.warn('Gagal menggunakan form.submit():', error.message);
                }
            }

            if (!submitted) {
                throw new Error('Tidak dapat mengirim form dengan semua metode yang tersedia');
            }

            await this.waitForSubmissionResponse();
            const loginSuccess = await this.verifyLoginAfterSubmit();
            
            if (loginSuccess) {
                return { success: true, message: 'Login berhasil' };
            } else {
                const errorMessage = await this.getErrorMessage();
                return { success: false, message: errorMessage || 'Login gagal' };
            }

        } catch (error) {
            this.logger.error('Error submit form login:', error);
            return { success: false, message: error.message };
        }
    }

    async waitForSubmissionResponse() {
        try {
            await Promise.race([
                this.page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }),
                this.page.waitForResponse(response => 
                    response.url().includes('login') || 
                    response.url().includes('auth') ||
                    response.status() === 302, 
                    { timeout: 10000 }
                ),
                this.page.waitForTimeout(5000)
            ]);

            if (this.isReactMode) {
                await this.waitForReactLoad();
            }
            await this.randomDelay(1000, 2000);

        } catch (error) {
            this.logger.info('Timeout menunggu response, melanjutkan verifikasi...');
        }
    }

    async clickWithRetry(element, maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                await element.waitFor({ state: 'visible', timeout: 5000 });
                await element.scrollIntoViewIfNeeded();
                
                if (i === 0) {
                    await element.click();
                } else if (i === 1) {
                    await element.click({ force: true });
                } else {
                    await element.evaluate(el => el.click());
                }
                
                return;
            } catch (error) {
                this.logger.warn(`Click attempt ${i + 1} failed:`, error.message);
                if (i === maxRetries - 1) throw error;
                await this.randomDelay(500, 1000);
            }
        }
    }

    async verifyLogin() {
        try {
            if (this.isReactMode) {
                await this.waitForReactLoad();
            }
            
            const loginIndicators = [
                () => this.page.$('.user-menu'),
                () => this.page.$('.profile-menu'),
                () => this.page.$('[data-testid*="user"]'),
                () => this.page.$('.logout'),
                () => this.page.$('a[href*="logout"]'),
                () => this.page.$('.dashboard'),
                () => this.page.$('#dashboard'),
                async () => {
                    const loginForm = await this.page.$('input[type="password"]');
                    return !loginForm;
                }
            ];

            if (this.isReactMode) {
                loginIndicators.push(
                    () => this.page.$('xpath=//a[contains(text(), "Logout")]'),
                    () => this.page.$('xpath=//a[contains(text(), "Keluar")]')
                );
            }

            for (const check of loginIndicators) {
                try {
                    const result = await check();
                    if (result) {
                        this.logger.info('Status login terverifikasi');
                        return true;
                    }
                } catch (e) {
                    // Continue to next check
                }
            }

            return false;
        } catch (error) {
            this.logger.error('Error verifying login:', error);
            return false;
        }
    }

    async verifyLoginAfterSubmit() {
        await this.randomDelay(2000, 3000);
        return await this.verifyLogin();
    }

    async getErrorMessage() {
        try {
            const errorSelectors = [
                '.error-message', '.alert-danger', '.alert-error', 
                '[data-testid*="error"]', '.login-error', '.form-error'
            ];

            if (this.isReactMode) {
                errorSelectors.push(
                    'xpath=//div[contains(@class, "error")]',
                    'xpath=//*[contains(text(), "Invalid") or contains(text(), "incorrect") or contains(text(), "wrong")]'
                );
            }

            for (const selector of errorSelectors) {
                try {
                    let element;
                    if (selector.startsWith('xpath=')) {
                        element = await this.page.$(selector);
                    } else {
                        element = await this.page.$(selector);
                    }
                    
                    if (element) {
                        const text = await element.textContent();
                        if (text && text.trim()) {
                            return text.trim();
                        }
                    }
                } catch (e) {
                    // Continue
                }
            }

            return 'Login gagal - alasan tidak diketahui';
        } catch (error) {
            return 'Error mengambil pesan error';
        }
    }

    async randomDelay(min = null, max = null) {
        const minDelay = min || this.config?.delays?.min || 100;
        const maxDelay = max || this.config?.delays?.max || 500;
        const delay = this.getRandomDelay(minDelay, maxDelay);
        await this.page.waitForTimeout(delay);
    }

    getRandomDelay(min = 50, max = 150) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

module.exports = LoginHandler;