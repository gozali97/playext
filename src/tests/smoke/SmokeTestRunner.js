const { chromium } = require('playwright');
const AuthenticationHandler = require('../../utils/AuthenticationHandler');

/**
 * Smoke Test Runner
 * Pengujian awal untuk memastikan fungsi utama aplikasi berjalan sebelum pengujian lebih lanjut
 */
class SmokeTestRunner {
    constructor(logger) {
        this.logger = logger;
        this.type = 'smoke';
        this.browser = null;
        this.context = null;
        this.authHandler = new AuthenticationHandler(logger);
    }

    async run(config) {
        const startTime = Date.now();
        this.logger.info('💨 Starting Smoke Tests...');

        try {
            const smokeConfig = config.testTypes?.smoke || {};
            
            if (!smokeConfig.enabled) {
                return {
                    success: true,
                    summary: { totalTests: 0, passed: 0, failed: 0, skipped: 1 },
                    tests: [],
                    metrics: {},
                    message: 'Smoke tests disabled in configuration'
                };
            }

            // Initialize browser
            await this.initializeBrowser(config);
            
            // Run smoke tests
            const results = await this.runSmokeTests(config, smokeConfig);
            
            // Cleanup
            await this.cleanup();
            
            const endTime = Date.now();
            const duration = endTime - startTime;

            this.logger.info(`✅ Smoke Tests completed in ${duration}ms`);

            return {
                success: results.failed === 0,
                summary: {
                    totalTests: results.total,
                    passed: results.passed,
                    failed: results.failed,
                    skipped: results.skipped
                },
                tests: results.tests,
                metrics: {
                    duration,
                    averageTestTime: duration / results.total || 0,
                    browserInitTime: results.browserInitTime || 0
                },
                errors: results.errors
            };

        } catch (error) {
            await this.cleanup();
            this.logger.error('Smoke Test Error:', error);
            return {
                success: false,
                summary: { totalTests: 0, passed: 0, failed: 1, skipped: 0 },
                tests: [],
                metrics: {},
                errors: [error.message]
            };
        }
    }

    async initializeBrowser(config) {
        const browserInitStart = Date.now();
        
        this.browser = await chromium.launch({
            headless: config.browser?.headless !== false,
            slowMo: config.browser?.slowMo || 0,
            args: config.browser?.options?.args || ['--no-sandbox']
        });

        this.context = await this.browser.newContext({
            viewport: config.browser?.viewport || { width: 1920, height: 1080 },
            userAgent: 'Universal Test Automation Framework - Smoke Tests',
            ...(config.auth?.basicAuth?.enabled && {
                httpCredentials: {
                    username: config.auth.basicAuth.username,
                    password: config.auth.basicAuth.password
                }
            })
        });

        // Enable request/response logging
        this.context.on('request', request => {
            this.logger.debug(`🌐 Request: ${request.method()} ${request.url()}`);
        });

        this.context.on('response', response => {
            // Don't warn about redirects (3xx) as they are normal
            if (!response.ok() && response.status() < 300 || response.status() >= 400) {
                this.logger.warn(`⚠️  Response: ${response.status()} ${response.url()}`);
            } else if (response.status() >= 300 && response.status() < 400) {
                this.logger.debug(`🔄 Redirect: ${response.status()} ${response.url()}`);
            }
        });

        const browserInitTime = Date.now() - browserInitStart;
        this.logger.info(`🚀 Browser initialized in ${browserInitTime}ms`);
        
        return browserInitTime;
    }

    async runSmokeTests(config, smokeConfig) {
        const results = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            tests: [],
            errors: []
        };

        // Critical paths to test
        const criticalPaths = smokeConfig.criticalPaths || ['/'];
        const baseUrl = config.target?.url || 'https://example.com';

        // Default smoke tests
        const smokeTests = [
            {
                name: 'Website Accessibility',
                fn: () => this.testWebsiteAccessibility(baseUrl, config)
            },
            {
                name: 'Login Functionality',
                fn: () => this.testLoginFunctionality(baseUrl, config)
            },
            ...criticalPaths.map(path => ({
                name: `Critical Path: ${path}`,
                fn: () => {
                    // Properly construct URL to avoid double slashes
                    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
                    const cleanPath = path.startsWith('/') ? path : '/' + path;
                    const fullUrl = cleanBaseUrl + cleanPath;
                    return this.testCriticalPath(fullUrl, config);
                }
            }))
        ];

        // Run each smoke test
        for (const test of smokeTests) {
            const testResult = await this.runSingleSmokeTest(test, smokeConfig);
            results.tests.push(testResult);
            results.total++;
            
            if (testResult.status === 'PASSED') {
                results.passed++;
            } else if (testResult.status === 'FAILED') {
                results.failed++;
                results.errors.push(`${test.name} - ${testResult.error}`);
            } else {
                results.skipped++;
            }
        }

        return results;
    }

    async runSingleSmokeTest(test, config) {
        const startTime = Date.now();
        
        try {
            const timeout = config.timeout || 30000;
            
            const result = await Promise.race([
                test.fn(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Smoke test timeout')), timeout)
                )
            ]);

            const endTime = Date.now();
            
            return {
                name: test.name,
                status: 'PASSED',
                duration: endTime - startTime,
                result: result,
                error: null
            };

        } catch (error) {
            const endTime = Date.now();
            
            return {
                name: test.name,
                status: 'FAILED',
                duration: endTime - startTime,
                result: null,
                error: error.message
            };
        }
    }

    async testWebsiteAccessibility(url, config) {
        const page = await this.context.newPage();
        
        try {
            this.logger.info(`🔍 Testing website accessibility: ${url}`);
            
            // Navigate to website
            const response = await page.goto(url, { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            
            // Accept 2xx and 3xx status codes (3xx are redirects, which are normal)
            if (response.status() >= 400) {
                throw new Error(`Website not accessible: ${response.status()} ${response.statusText()}`);
            }

            // Check basic page structure
            const title = await page.title();
            if (!title || title.trim() === '') {
                throw new Error('Page has no title');
            }

            // Check for basic HTML structure
            const hasBody = await page.$('body') !== null;
            if (!hasBody) {
                throw new Error('Page has no body element');
            }

            // Check for JavaScript errors
            const jsErrors = [];
            page.on('pageerror', error => {
                jsErrors.push(error.message);
            });

            // Wait a bit to catch any JS errors
            await page.waitForTimeout(2000);

            const result = {
                url,
                title,
                status: response.status(),
                hasBasicStructure: hasBody,
                jsErrors: jsErrors.length,
                jsErrorDetails: jsErrors
            };

            this.logger.info(`✅ Website accessibility test passed for ${url}`);
            return result;

        } finally {
            await page.close();
        }
    }

    async testLoginFunctionality(url, config) {
        if (!config.auth?.username || !config.auth?.password) {
            return {
                skipped: true,
                reason: 'No authentication credentials provided'
            };
        }

        const page = await this.context.newPage();
        
        try {
            this.logger.info(`🔐 Testing login functionality: ${url}`);
            
            // Navigate to website
            await page.goto(url, { waitUntil: 'networkidle' });
            
            // Use AuthenticationHandler for robust login
            const authResult = await this.authHandler.authenticate(page, config, 'auto');
            
            if (authResult.success) {
                this.logger.info(`✅ Login functionality test completed successfully using ${authResult.strategy} strategy`);
                return {
                    loginAttempted: true,
                    success: true,
                    strategy: authResult.strategy,
                    finalUrl: page.url(),
                    details: authResult.details
                };
            } else {
                // Try alternative strategies if auto-detection failed
                const strategies = ['form', 'react', 'vue'];
                
                for (const strategy of strategies) {
                    if (strategy === authResult.strategy) continue; // Skip already tried strategy
                    
                    this.logger.info(`🔄 Retrying login with ${strategy} strategy`);
                    
                    // Navigate back to login page
                    await page.goto(url, { waitUntil: 'networkidle' });
                    
                    const retryResult = await this.authHandler.authenticate(page, config, strategy);
                    
                    if (retryResult.success) {
                        this.logger.info(`✅ Login successful with ${strategy} strategy on retry`);
                        return {
                            loginAttempted: true,
                            success: true,
                            strategy: strategy,
                            finalUrl: page.url(),
                            details: retryResult.details,
                            retriedStrategies: [authResult.strategy]
                        };
                    }
                }
                
                // All strategies failed
                this.logger.warn(`⚠️ Login failed with all strategies. Last error: ${authResult.error}`);
                return {
                    loginAttempted: true,
                    success: false,
                    error: authResult.error,
                    strategy: authResult.strategy,
                    finalUrl: page.url(),
                    details: authResult.details
                };
            }

        } catch (error) {
            this.logger.error(`❌ Login functionality test error: ${error.message}`);
            return {
                loginAttempted: true,
                success: false,
                error: error.message,
                finalUrl: page.url()
            };
        } finally {
            await page.close();
        }
    }

    async testCriticalPath(url, config) {
        const page = await this.context.newPage();
        
        try {
            this.logger.info(`🛤️ Testing critical path: ${url}`);
            
            const response = await page.goto(url, { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            
            // Accept 2xx and 3xx status codes (3xx are redirects, which are normal)
            if (response.status() >= 400) {
                throw new Error(`Critical path failed: ${response.status()} ${response.statusText()}`);
            }

            // Check page loads completely
            await page.waitForLoadState('domcontentloaded');
            
            // Basic page health checks
            const title = await page.title();
            const hasContent = await page.$('body') !== null;
            
            const result = {
                url,
                status: response.status(),
                title,
                hasContent,
                loadedSuccessfully: true
            };

            this.logger.info(`✅ Critical path test passed for ${url}`);
            return result;

        } finally {
            await page.close();
        }
    }

    async cleanup() {
        try {
            if (this.context) {
                await this.context.close();
                this.context = null;
            }
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
            }
        } catch (error) {
            this.logger.warn('Cleanup error:', error);
        }
    }
}

module.exports = SmokeTestRunner; 