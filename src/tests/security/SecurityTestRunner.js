const { chromium } = require('playwright');
const axios = require('axios');

/**
 * Security Test Runner
 * Menguji kerentanan keamanan aplikasi
 */
class SecurityTestRunner {
    constructor(logger) {
        this.logger = logger;
        this.type = 'security';
        this.browser = null;
        this.context = null;
    }

    async run(config) {
        const startTime = Date.now();
        this.logger.info('🔒 Starting Security Tests...');

        try {
            const secConfig = config.testTypes?.security || {};
            
            if (!secConfig.enabled) {
                return {
                    success: true,
                    summary: { totalTests: 0, passed: 0, failed: 0, skipped: 1 },
                    tests: [],
                    metrics: {},
                    message: 'Security tests disabled in configuration'
                };
            }

            await this.initializeBrowser(config);
            const results = await this.runSecurityTests(config, secConfig);
            await this.cleanup();
            
            const endTime = Date.now();
            const duration = endTime - startTime;

            this.logger.info(`✅ Security Tests completed in ${duration}ms`);

            return {
                success: results.failed === 0,
                summary: {
                    totalTests: results.total,
                    passed: results.passed,
                    failed: results.failed,
                    skipped: results.skipped
                },
                tests: results.tests,
                metrics: { duration, vulnerabilities: results.vulnerabilities },
                errors: results.errors
            };

        } catch (error) {
            await this.cleanup();
            this.logger.error('Security Test Error:', error);
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
        this.browser = await chromium.launch({
            headless: config.browser?.headless !== false,
            args: ['--no-sandbox', '--disable-web-security', '--ignore-certificate-errors']
        });

        this.context = await this.browser.newContext({
            viewport: config.browser?.viewport || { width: 1920, height: 1080 },
            ignoreHTTPSErrors: true,
            userAgent: 'Universal Test Automation Framework - Security Tests',
            ...(config.auth?.basicAuth?.enabled && {
                httpCredentials: {
                    username: config.auth.basicAuth.username,
                    password: config.auth.basicAuth.password
                }
            })
        });
    }

    async runSecurityTests(config, secConfig) {
        const results = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            tests: [],
            errors: [],
            vulnerabilities: []
        };

        const baseUrl = config.target?.url || 'https://example.com';
        const checks = secConfig.checks || ['xss', 'sqlInjection', 'csrf', 'headers', 'ssl'];

        const securityTests = [
            { name: 'XSS Vulnerability Test', fn: () => this.testXSSVulnerability(baseUrl, config), enabled: checks.includes('xss') },
            { name: 'SQL Injection Test', fn: () => this.testSQLInjection(baseUrl, config), enabled: checks.includes('sqlInjection') },
            { name: 'CSRF Protection Test', fn: () => this.testCSRFProtection(baseUrl, config), enabled: checks.includes('csrf') },
            { name: 'Security Headers Test', fn: () => this.testSecurityHeaders(baseUrl, config), enabled: checks.includes('headers') },
            { name: 'SSL/TLS Configuration Test', fn: () => this.testSSLConfiguration(baseUrl, config), enabled: checks.includes('ssl') }
        ];

        for (const test of securityTests) {
            if (!test.enabled) {
                results.tests.push({ name: test.name, status: 'SKIPPED', reason: 'Test disabled' });
                results.skipped++;
                continue;
            }

            const testResult = await this.runSingleSecurityTest(test, secConfig);
            results.tests.push(testResult);
            results.total++;
            
            if (testResult.status === 'PASSED') {
                results.passed++;
            } else if (testResult.status === 'FAILED') {
                results.failed++;
                results.errors.push(`${test.name} - ${testResult.error}`);
                if (testResult.vulnerabilities) {
                    results.vulnerabilities.push(...testResult.vulnerabilities);
                }
            }
        }

        return results;
    }

    async runSingleSecurityTest(test, config) {
        const startTime = Date.now();
        
        try {
            const result = await test.fn();
            const endTime = Date.now();
            
            return {
                name: test.name,
                status: 'PASSED',
                duration: endTime - startTime,
                result: result,
                vulnerabilities: result.vulnerabilities || [],
                error: null
            };

        } catch (error) {
            const endTime = Date.now();
            
            return {
                name: test.name,
                status: 'FAILED',
                duration: endTime - startTime,
                result: null,
                error: error.message,
                vulnerabilities: []
            };
        }
    }

    async testXSSVulnerability(url, config) {
        const page = await this.context.newPage();
        const vulnerabilities = [];
        
        try {
            this.logger.info(`🕷️ Testing XSS vulnerabilities: ${url}`);
            
            await page.goto(url, { waitUntil: 'networkidle' });
            
            // XSS payloads to test
            const xssPayloads = config.security?.payloads?.xss || [
                '<script>alert("XSS")</script>',
                '"><script>alert("XSS")</script>',
                'javascript:alert("XSS")',
                '<img src=x onerror=alert("XSS")>'
            ];

            // Find input fields
            const inputs = await page.$$('input[type="text"], input[type="search"], textarea');
            
            for (const input of inputs) {
                for (const payload of xssPayloads) {
                    try {
                        await input.fill(payload);
                        await page.keyboard.press('Enter');
                        
                        // Check if XSS executed
                        const alertHandled = await page.evaluate(() => {
                            return window.xssDetected || false;
                        });
                        
                        if (alertHandled) {
                            vulnerabilities.push({
                                type: 'XSS',
                                severity: 'HIGH',
                                payload: payload,
                                location: await input.getAttribute('name') || 'unknown'
                            });
                        }
                    } catch (error) {
                        // Continue testing other payloads
                    }
                }
            }

            return { tested: true, vulnerabilities };

        } finally {
            await page.close();
        }
    }

    async testSQLInjection(url, config) {
        const vulnerabilities = [];
        
        try {
            this.logger.info(`💉 Testing SQL injection vulnerabilities: ${url}`);
            
            const sqlPayloads = config.security?.payloads?.sqlInjection || [
                "' OR '1'='1",
                "'; DROP TABLE users; --",
                "1' UNION SELECT * FROM users --"
            ];

            // Test various endpoints with SQL injection payloads
            for (const payload of sqlPayloads) {
                try {
                    const testUrl = `${url}?id=${encodeURIComponent(payload)}`;
                    const response = await axios.get(testUrl, { timeout: 5000 });
                    
                    // Check for SQL error messages
                    const sqlErrors = [
                        'SQL syntax',
                        'mysql_fetch',
                        'ORA-',
                        'PostgreSQL',
                        'sqlite_'
                    ];
                    
                    const hasError = sqlErrors.some(error => 
                        response.data.toLowerCase().includes(error.toLowerCase())
                    );
                    
                    if (hasError) {
                        vulnerabilities.push({
                            type: 'SQL_INJECTION',
                            severity: 'CRITICAL',
                            payload: payload,
                            location: testUrl
                        });
                    }
                } catch (error) {
                    // Continue testing
                }
            }

            return { tested: true, vulnerabilities };

        } catch (error) {
            throw new Error(`SQL injection test failed: ${error.message}`);
        }
    }

    async testCSRFProtection(url, config) {
        const page = await this.context.newPage();
        
        try {
            this.logger.info(`🛡️ Testing CSRF protection: ${url}`);
            
            await page.goto(url, { waitUntil: 'networkidle' });
            
            // Look for forms
            const forms = await page.$$('form');
            const vulnerabilities = [];
            
            for (const form of forms) {
                // Check for CSRF tokens
                const hasCSRFToken = await form.$('input[name*="csrf"], input[name*="token"], input[name="_token"]') !== null;
                
                if (!hasCSRFToken) {
                    const action = await form.getAttribute('action') || 'unknown';
                    vulnerabilities.push({
                        type: 'CSRF',
                        severity: 'MEDIUM',
                        description: 'Form without CSRF protection',
                        location: action
                    });
                }
            }

            return { tested: true, vulnerabilities };

        } finally {
            await page.close();
        }
    }

    async testSecurityHeaders(url, config) {
        try {
            this.logger.info(`📋 Testing security headers: ${url}`);
            
            const response = await axios.get(url, { timeout: 10000 });
            const headers = response.headers;
            const vulnerabilities = [];
            
            const requiredHeaders = config.security?.headers || [
                'x-frame-options',
                'x-content-type-options',
                'x-xss-protection',
                'strict-transport-security',
                'content-security-policy'
            ];
            
            for (const header of requiredHeaders) {
                if (!headers[header.toLowerCase()]) {
                    vulnerabilities.push({
                        type: 'MISSING_HEADER',
                        severity: 'MEDIUM',
                        description: `Missing security header: ${header}`,
                        location: url
                    });
                }
            }

            return { tested: true, vulnerabilities, headers: Object.keys(headers) };

        } catch (error) {
            throw new Error(`Security headers test failed: ${error.message}`);
        }
    }

    async testSSLConfiguration(url, config) {
        try {
            this.logger.info(`🔐 Testing SSL/TLS configuration: ${url}`);
            
            if (!url.startsWith('https://')) {
                return {
                    tested: true,
                    vulnerabilities: [{
                        type: 'NO_HTTPS',
                        severity: 'HIGH',
                        description: 'Website not using HTTPS',
                        location: url
                    }]
                };
            }

            const response = await axios.get(url, { 
                timeout: 10000,
                httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
            });
            
            return { tested: true, vulnerabilities: [], sslEnabled: true };

        } catch (error) {
            if (error.code === 'CERT_UNTRUSTED' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
                return {
                    tested: true,
                    vulnerabilities: [{
                        type: 'SSL_CERTIFICATE',
                        severity: 'HIGH',
                        description: 'Invalid or untrusted SSL certificate',
                        location: url
                    }]
                };
            }
            
            throw new Error(`SSL configuration test failed: ${error.message}`);
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
            this.logger.warn('Security cleanup error:', error);
        }
    }
}

module.exports = SecurityTestRunner; 