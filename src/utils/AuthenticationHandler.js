// Authentication Handler - No external dependencies needed

/**
 * Authentication Handler
 * Menangani berbagai jenis authentication untuk testing automation
 */
class AuthenticationHandler {
    constructor(logger) {
        this.logger = logger;
        this.authStrategies = new Map();
        this.setupAuthStrategies();
    }

    setupAuthStrategies() {
        // Basic Auth Strategy
        this.authStrategies.set('basic', this.basicAuthStrategy.bind(this));
        
        // Standard Form Login Strategy
        this.authStrategies.set('form', this.formLoginStrategy.bind(this));
        
        // React/SPA Login Strategy
        this.authStrategies.set('react', this.reactLoginStrategy.bind(this));
        
        // Vue.js Login Strategy
        this.authStrategies.set('vue', this.vueLoginStrategy.bind(this));
        
        // API Token Strategy
        this.authStrategies.set('token', this.tokenAuthStrategy.bind(this));
        
        // OAuth Strategy
        this.authStrategies.set('oauth', this.oauthStrategy.bind(this));
    }

    /**
     * Authenticate using the specified strategy
     */
    async authenticate(page, config, strategy = 'auto') {
        try {
            this.logger.info(`🔐 Starting authentication with strategy: ${strategy}`);
            
            if (strategy === 'auto') {
                strategy = await this.detectAuthStrategy(page, config);
                this.logger.info(`🔍 Auto-detected authentication strategy: ${strategy}`);
            }

            const authFunction = this.authStrategies.get(strategy);
            if (!authFunction) {
                throw new Error(`Unknown authentication strategy: ${strategy}`);
            }

            const result = await authFunction(page, config);
            
            if (result.success) {
                this.logger.info(`✅ Authentication successful using ${strategy} strategy`);
            } else {
                this.logger.warn(`⚠️ Authentication failed using ${strategy} strategy: ${result.error}`);
            }

            return result;

        } catch (error) {
            this.logger.error(`❌ Authentication error: ${error.message}`);
            return {
                success: false,
                strategy,
                error: error.message,
                details: null
            };
        }
    }

    /**
     * Auto-detect authentication strategy based on page content
     */
    async detectAuthStrategy(page, config) {
        try {
            // Check for React indicators
            const hasReact = await page.evaluate(() => {
                return !!(window.React || window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || 
                         document.querySelector('[data-reactroot]') ||
                         document.querySelector('div[id="root"]'));
            });

            // Check for Vue indicators
            const hasVue = await page.evaluate(() => {
                return !!(window.Vue || window.__VUE__ || 
                         document.querySelector('[data-v-]') ||
                         document.querySelector('div[id="app"]'));
            });

            // Check for form elements
            const hasLoginForm = await page.$('form') !== null;
            const hasUsernameField = await this.findElement(page, this.getUsernameSelectors(config)) !== null;
            const hasPasswordField = await this.findElement(page, this.getPasswordSelectors(config)) !== null;

            // Determine strategy
            if (config.auth?.strategy) {
                return config.auth.strategy;
            } else if (hasReact && hasLoginForm) {
                return 'react';
            } else if (hasVue && hasLoginForm) {
                return 'vue';
            } else if (hasUsernameField && hasPasswordField) {
                return 'form';
            } else if (config.auth?.basicAuth?.enabled) {
                return 'basic';
            } else if (config.auth?.apiKey || config.auth?.bearerToken) {
                return 'token';
            } else {
                return 'form'; // Default fallback
            }

        } catch (error) {
            this.logger.warn(`Failed to detect auth strategy: ${error.message}`);
            return 'form';
        }
    }

    /**
     * Basic HTTP Authentication
     */
    async basicAuthStrategy(page, config) {
        const auth = config.auth?.basicAuth;
        if (!auth?.enabled || !auth.username || !auth.password) {
            return {
                success: false,
                strategy: 'basic',
                error: 'Basic auth credentials not provided',
                details: null
            };
        }

        try {
            // Navigate to login URL if specified
            let targetUrl = page.url();
            if (config.auth?.loginUrl) {
                // Construct full login URL
                const baseUrl = config.target?.url || page.url();
                const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
                const cleanLoginUrl = config.auth.loginUrl.startsWith('/') ? config.auth.loginUrl : '/' + config.auth.loginUrl;
                targetUrl = cleanBaseUrl + cleanLoginUrl;
                
                this.logger.info(`🔗 Navigating to login URL: ${targetUrl}`);
                await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
            }

            // Basic auth is handled at browser context level, but we need to verify access
            const response = await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
            
            if (response && response.status() === 401) {
                return {
                    success: false,
                    strategy: 'basic',
                    error: 'Basic authentication failed - 401 Unauthorized',
                    details: {
                        username: auth.username,
                        targetUrl: targetUrl,
                        status: response.status()
                    }
                };
            }

            // Basic auth is handled at browser context level
            return {
                success: true,
                strategy: 'basic',
                error: null,
                details: {
                    username: auth.username,
                    method: 'HTTP Basic Authentication',
                    targetUrl: targetUrl,
                    finalUrl: page.url()
                }
            };

        } catch (error) {
            return {
                success: false,
                strategy: 'basic',
                error: `Basic auth navigation failed: ${error.message}`,
                details: null
            };
        }
    }

    /**
     * Standard Form Login
     */
    async formLoginStrategy(page, config) {
        const auth = config.auth;
        if (!auth?.username || !auth?.password) {
            return {
                success: false,
                strategy: 'form',
                error: 'Username or password not provided',
                details: null
            };
        }

        try {
            // Navigate to login page if specified
            if (auth.loginUrl && !page.url().includes(auth.loginUrl)) {
                await page.goto(page.url() + auth.loginUrl, { waitUntil: 'networkidle' });
            }

            // Find and fill username field
            const usernameField = await this.findAndFillField(
                page, 
                this.getUsernameSelectors(config), 
                auth.username,
                'username'
            );

            // Find and fill password field
            const passwordField = await this.findAndFillField(
                page, 
                this.getPasswordSelectors(config), 
                auth.password,
                'password'
            );

            // Submit form
            const submitResult = await this.submitLoginForm(page, config);

            // Verify login success
            const verification = await this.verifyLoginSuccess(page, config);

            return {
                success: verification.success,
                strategy: 'form',
                error: verification.success ? null : verification.error,
                details: {
                    usernameField: usernameField ? 'found' : 'not found',
                    passwordField: passwordField ? 'found' : 'not found',
                    submitMethod: submitResult.method,
                    finalUrl: page.url(),
                    verification: verification
                }
            };

        } catch (error) {
            return {
                success: false,
                strategy: 'form',
                error: error.message,
                details: null
            };
        }
    }

    /**
     * React/SPA Login Strategy
     */
    async reactLoginStrategy(page, config) {
        const auth = config.auth;
        if (!auth?.username || !auth?.password) {
            return {
                success: false,
                strategy: 'react',
                error: 'Username or password not provided',
                details: null
            };
        }

        try {
            // Wait for React to load
            await page.waitForFunction(() => {
                return window.React || window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || document.querySelector('[data-reactroot]');
            }, { timeout: 10000 });

            // Navigate to login page if specified
            if (auth.loginUrl && !page.url().includes(auth.loginUrl)) {
                await page.goto(page.url() + auth.loginUrl, { waitUntil: 'networkidle' });
            }

            // Wait for form to be interactive
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(1000); // Allow React to render

            // Find and fill fields with React-specific approach
            const usernameSelectors = [
                ...this.getUsernameSelectors(config),
                'input[data-testid*="username"]',
                'input[data-testid*="email"]',
                'input[placeholder*="username" i]',
                'input[placeholder*="email" i]'
            ];

            const passwordSelectors = [
                ...this.getPasswordSelectors(config),
                'input[data-testid*="password"]',
                'input[placeholder*="password" i]'
            ];

            // Fill username
            const usernameField = await this.findElement(page, usernameSelectors);
            if (usernameField) {
                await usernameField.click();
                await usernameField.fill('');
                await usernameField.type(auth.username, { delay: 100 });
                await page.waitForTimeout(500);
            }

            // Fill password
            const passwordField = await this.findElement(page, passwordSelectors);
            if (passwordField) {
                await passwordField.click();
                await passwordField.fill('');
                await passwordField.type(auth.password, { delay: 100 });
                await page.waitForTimeout(500);
            }

            // Submit with React-specific approach
            const submitSelectors = [
                ...this.getSubmitSelectors(config),
                'button[data-testid*="login"]',
                'button[data-testid*="submit"]',
                'button:has-text("Login")',
                'button:has-text("Sign In")',
                'button:has-text("Log In")'
            ];

            const submitButton = await this.findElement(page, submitSelectors);
            if (submitButton) {
                // Wait for any form validation
                await page.waitForTimeout(500);
                
                // Click submit and wait for navigation or response
                await Promise.all([
                    page.waitForResponse(response => 
                        response.url().includes('login') || 
                        response.url().includes('auth') ||
                        response.status() === 200, 
                        { timeout: 10000 }
                    ).catch(() => null),
                    submitButton.click()
                ]);
            }

            // Wait for React to process login
            await page.waitForTimeout(2000);

            // Verify login success
            const verification = await this.verifyLoginSuccess(page, config);

            return {
                success: verification.success,
                strategy: 'react',
                error: verification.success ? null : verification.error,
                details: {
                    reactDetected: true,
                    usernameField: usernameField ? 'found' : 'not found',
                    passwordField: passwordField ? 'found' : 'not found',
                    submitButton: submitButton ? 'found' : 'not found',
                    finalUrl: page.url(),
                    verification: verification
                }
            };

        } catch (error) {
            return {
                success: false,
                strategy: 'react',
                error: error.message,
                details: null
            };
        }
    }

    /**
     * Vue.js Login Strategy
     */
    async vueLoginStrategy(page, config) {
        const auth = config.auth;
        if (!auth?.username || !auth?.password) {
            return {
                success: false,
                strategy: 'vue',
                error: 'Username or password not provided',
                details: null
            };
        }

        try {
            // Wait for Vue to load
            await page.waitForFunction(() => {
                return window.Vue || window.__VUE__ || document.querySelector('[data-v-]');
            }, { timeout: 10000 });

            // Navigate to login page if specified
            if (auth.loginUrl && !page.url().includes(auth.loginUrl)) {
                await page.goto(page.url() + auth.loginUrl, { waitUntil: 'networkidle' });
            }

            // Wait for Vue to render
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(1000);

            // Vue-specific selectors
            const usernameSelectors = [
                ...this.getUsernameSelectors(config),
                'input[v-model*="username"]',
                'input[v-model*="email"]',
                'input[data-cy*="username"]',
                'input[data-cy*="email"]'
            ];

            const passwordSelectors = [
                ...this.getPasswordSelectors(config),
                'input[v-model*="password"]',
                'input[data-cy*="password"]'
            ];

            // Fill fields with Vue-specific approach
            const usernameField = await this.findElement(page, usernameSelectors);
            if (usernameField) {
                await usernameField.click();
                await usernameField.fill('');
                await usernameField.type(auth.username, { delay: 100 });
                // Trigger Vue reactivity
                await usernameField.dispatchEvent('input');
                await page.waitForTimeout(300);
            }

            const passwordField = await this.findElement(page, passwordSelectors);
            if (passwordField) {
                await passwordField.click();
                await passwordField.fill('');
                await passwordField.type(auth.password, { delay: 100 });
                await passwordField.dispatchEvent('input');
                await page.waitForTimeout(300);
            }

            // Submit with Vue-specific approach
            const submitSelectors = [
                ...this.getSubmitSelectors(config),
                'button[data-cy*="login"]',
                'button[data-cy*="submit"]',
                'button:has-text("Login")',
                'button:has-text("Sign In")',
                'button:has-text("Connexion")'
            ];

            const submitButton = await this.findElement(page, submitSelectors);
            if (submitButton) {
                await page.waitForTimeout(500);
                await Promise.all([
                    page.waitForResponse(response => 
                        response.url().includes('login') || 
                        response.url().includes('auth') ||
                        response.status() === 200, 
                        { timeout: 10000 }
                    ).catch(() => null),
                    submitButton.click()
                ]);
            }

            await page.waitForTimeout(2000);

            const verification = await this.verifyLoginSuccess(page, config);

            return {
                success: verification.success,
                strategy: 'vue',
                error: verification.success ? null : verification.error,
                details: {
                    vueDetected: true,
                    usernameField: usernameField ? 'found' : 'not found',
                    passwordField: passwordField ? 'found' : 'not found',
                    submitButton: submitButton ? 'found' : 'not found',
                    finalUrl: page.url(),
                    verification: verification
                }
            };

        } catch (error) {
            return {
                success: false,
                strategy: 'vue',
                error: error.message,
                details: null
            };
        }
    }

    /**
     * Token-based Authentication
     */
    async tokenAuthStrategy(page, config) {
        const auth = config.auth;
        
        try {
            // Set authorization headers
            if (auth.bearerToken) {
                await page.setExtraHTTPHeaders({
                    'Authorization': `Bearer ${auth.bearerToken}`
                });
            } else if (auth.apiKey) {
                await page.setExtraHTTPHeaders({
                    'X-API-Key': auth.apiKey,
                    'Authorization': `ApiKey ${auth.apiKey}`
                });
            }

            // Navigate to protected page to test token
            await page.goto(page.url(), { waitUntil: 'networkidle' });

            return {
                success: true,
                strategy: 'token',
                error: null,
                details: {
                    tokenType: auth.bearerToken ? 'Bearer' : 'ApiKey',
                    finalUrl: page.url()
                }
            };

        } catch (error) {
            return {
                success: false,
                strategy: 'token',
                error: error.message,
                details: null
            };
        }
    }

    /**
     * OAuth Strategy (placeholder)
     */
    async oauthStrategy(page, config) {
        return {
            success: false,
            strategy: 'oauth',
            error: 'OAuth strategy not implemented yet',
            details: null
        };
    }

    /**
     * Helper methods
     */
    async findElement(page, selectors) {
        for (const selector of selectors) {
            try {
                const element = await page.$(selector);
                if (element) return element;
            } catch (error) {
                // Continue to next selector
            }
        }
        return null;
    }

    async findAndFillField(page, selectors, value, fieldType) {
        const element = await this.findElement(page, selectors);
        if (element) {
            await element.click();
            await element.fill(value);
            this.logger.debug(`✅ Filled ${fieldType} field`);
            return element;
        } else {
            this.logger.warn(`⚠️ ${fieldType} field not found`);
            return null;
        }
    }

    async submitLoginForm(page, config) {
        const submitSelectors = this.getSubmitSelectors(config);
        
        // Try clicking submit button
        const submitButton = await this.findElement(page, submitSelectors);
        if (submitButton) {
            await Promise.all([
                page.waitForResponse(response => response.status() !== 304, { timeout: 10000 }).catch(() => null),
                submitButton.click()
            ]);
            return { method: 'button_click', success: true };
        }

        // Try form submission
        const form = await page.$('form');
        if (form) {
            await Promise.all([
                page.waitForResponse(response => response.status() !== 304, { timeout: 10000 }).catch(() => null),
                page.keyboard.press('Enter')
            ]);
            return { method: 'form_submit', success: true };
        }

        return { method: 'none', success: false };
    }

    async verifyLoginSuccess(page, config) {
        try {
            // Wait for potential redirects
            await page.waitForTimeout(2000);

            const currentUrl = page.url();
            const title = await page.title();

            // Check for error indicators
            const errorSelectors = [
                '.error', '.alert-danger', '.invalid-feedback', '.error-message',
                '[data-testid*="error"]', '.notification.is-danger', '.alert.alert-danger'
            ];

            let hasErrors = false;
            let errorMessages = [];

            for (const selector of errorSelectors) {
                const errorElement = await page.$(selector);
                if (errorElement) {
                    hasErrors = true;
                    const errorText = await errorElement.textContent();
                    if (errorText) errorMessages.push(errorText.trim());
                }
            }

            // Check for success indicators
            const successIndicators = [
                () => currentUrl.includes('dashboard'),
                () => currentUrl.includes('home'),
                () => currentUrl.includes('profile'),
                () => !currentUrl.includes('login'),
                () => page.$('.user-menu') !== null,
                () => page.$('[data-testid*="user"]') !== null,
                () => page.$('.logout') !== null
            ];

            let successCount = 0;
            for (const indicator of successIndicators) {
                try {
                    if (await indicator()) successCount++;
                } catch (e) {
                    // Ignore errors in success checks
                }
            }

            const success = !hasErrors && successCount > 0;

            return {
                success,
                error: hasErrors ? errorMessages.join('; ') : (success ? null : 'No clear success indicators found'),
                details: {
                    currentUrl,
                    title,
                    hasErrors,
                    errorMessages,
                    successIndicators: successCount
                }
            };

        } catch (error) {
            return {
                success: false,
                error: `Verification failed: ${error.message}`,
                details: null
            };
        }
    }

    getUsernameSelectors(config) {
        return [
            config.auth?.usernameField,
            '#username', '#user', '#email', '#login',
            'input[name="username"]', 'input[name="user"]', 'input[name="email"]', 'input[name="login"]',
            'input[type="email"]', 'input[id*="username"]', 'input[id*="email"]',
            'input[placeholder*="username" i]', 'input[placeholder*="email" i]'
        ].filter(Boolean);
    }

    getPasswordSelectors(config) {
        return [
            config.auth?.passwordField,
            '#password', '#pass', '#pwd',
            'input[name="password"]', 'input[name="pass"]', 'input[name="pwd"]',
            'input[type="password"]', 'input[id*="password"]'
        ].filter(Boolean);
    }

    getSubmitSelectors(config) {
        return [
            config.auth?.submitButton,
            'button[type="submit"]', 'input[type="submit"]',
            'button:has-text("Login")', 'button:has-text("Sign In")', 'button:has-text("Log In")',
            'button:has-text("Submit")', '.btn-login', '.login-button', '#login-button'
        ].filter(Boolean);
    }
}

module.exports = AuthenticationHandler; 