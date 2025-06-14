#!/usr/bin/env node

const yargs = require('yargs');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs-extra');

const LoginHandler = require('./auth/login');
const SessionHandler = require('./auth/session');
const FormTester = require('./testing/formTester');
const ConfigLoader = require('./config/configLoader');
const Logger = require('./utils/logger');

class AutoTester {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
        this.logger = new Logger();
        this.loginHandler = new LoginHandler(this.logger);
        this.sessionHandler = new SessionHandler(this.logger);
        this.formTester = new FormTester(this.logger);
        this.configLoader = new ConfigLoader();
    }

    async init(headless = false, config = null) {
        try {
            this.logger.info('Menginisialisasi browser untuk React App...');
            
            // Enhanced browser options for React applications
            const browserOptions = {
                headless: config?.browser?.headless !== undefined ? config.browser.headless : headless,
                timeout: config?.browser?.timeout || 60000,
                args: [
                    '--no-sandbox', 
                    '--disable-setuid-sandbox',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor',
                    '--disable-dev-shm-usage',
                    '--disable-blink-features=AutomationControlled',
                    '--no-first-run',
                    '--disable-extensions',
                    '--disable-default-apps'
                ]
            };
            
            this.browser = await chromium.launch(browserOptions);
            
            // Enhanced context options for React applications
            const contextOptions = {
                viewport: config?.browser?.viewport || { width: 1366, height: 768 },
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                ignoreHTTPSErrors: true,
                javaScriptEnabled: true,
                extraHTTPHeaders: {
                    'Accept-Language': 'en-US,en;q=0.9,id;q=0.8'
                }
            };

            // Add basic authentication if enabled
            if (config && config.basicAuth && config.basicAuth.enabled) {
                this.logger.info('Mengkonfigurasi Basic Authentication...');
                contextOptions.httpCredentials = {
                    username: config.basicAuth.username,
                    password: config.basicAuth.password
                };
                this.logger.info(`Basic Auth user: ${config.basicAuth.username}`);
            }
            
            this.context = await this.browser.newContext(contextOptions);
            
            // Enhanced page settings for React
            this.page = await this.context.newPage();
            
            // Set page timeout
            this.page.setDefaultTimeout(config?.browser?.timeout || 30000);
            this.page.setDefaultNavigationTimeout(config?.browser?.timeout || 30000);
            
            // Add script to prevent automation detection
            await this.page.addInitScript(() => {
                // Remove webdriver property
                delete navigator.__proto__.webdriver;
                
                // Mock plugins
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5]
                });
                
                // Mock languages
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['en-US', 'en', 'id']
                });
            });
            
            // Update handler instances dengan page dan context
            this.loginHandler.setPage(this.page);
            this.sessionHandler.setContext(this.context);
            this.formTester.setPage(this.page);
            
            this.logger.info('Browser berhasil diinisialisasi dengan dukungan React');
        } catch (error) {
            this.logger.error('Gagal menginisialisasi browser:', error);
            throw error;
        }
    }

    async runTest(config) {
        const results = {
            timestamp: new Date().toISOString(),
            config: {
                url: config.url,
                loginMethod: config.useCookie ? 'cookie' : 'credentials',
                basicAuth: config.basicAuth && config.basicAuth.enabled ? 'enabled' : 'disabled'
            },
            loginResult: null,
            testResults: [],
            summary: {
                totalTests: 0,
                passed: 0,
                failed: 0,
                errors: []
            }
        };

        try {
            // Set config untuk login handler
            this.loginHandler.setConfig(config);
            
            // Step 1: Handle Login
            this.logger.info(`Memulai testing untuk URL: ${config.url}`);
            
            if (config.useCookie && config.cookieFile) {
                this.logger.info('Menggunakan session/cookie untuk login...');
                const sessionLoaded = await this.sessionHandler.loadSession(config.cookieFile);
                if (sessionLoaded) {
                    await this.page.goto(config.url);
                    const isLoggedIn = await this.loginHandler.verifyLogin();
                    results.loginResult = {
                        method: 'cookie',
                        success: isLoggedIn,
                        message: isLoggedIn ? 'Login dengan cookie berhasil' : 'Login dengan cookie gagal'
                    };
                } else {
                    results.loginResult = {
                        method: 'cookie',
                        success: false,
                        message: 'Gagal memuat session/cookie'
                    };
                }
            } else {
                this.logger.info('Melakukan login dengan kredensial...');
                const loginResult = await this.loginHandler.login(config.url, config.username, config.password, config);
                results.loginResult = {
                    method: 'credentials',
                    success: loginResult.success,
                    message: loginResult.message
                };

                // Simpan session jika login berhasil
                if (loginResult.success && config.saveSession) {
                    await this.sessionHandler.saveSession(config.sessionFile || 'auth.json');
                }
            }

            if (!results.loginResult.success) {
                this.logger.error('Login gagal, menghentikan automation');
                results.summary.errors.push('Login gagal');
                return results;
            }

            // Step 2: Run Form Testing
            this.logger.info('Memulai testing formulir...');
            const testResults = await this.formTester.runAllTests();
            results.testResults = testResults;
            
            // Step 3: Calculate Summary
            results.summary.totalTests = testResults.length;
            results.summary.passed = testResults.filter(t => t.summary && t.summary.passed > 0).length;
            results.summary.failed = testResults.filter(t => t.summary && t.summary.failed > 0).length;
            
            // Collect all errors from all test results
            const allErrors = [];
            testResults.forEach(testResult => {
                if (testResult.summary && testResult.summary.errors) {
                    allErrors.push(...testResult.summary.errors);
                }
            });
            results.summary.errors = allErrors;

            this.logger.info(`Testing selesai. Passed: ${results.summary.passed}, Failed: ${results.summary.failed}`);
            
        } catch (error) {
            this.logger.error('Error selama testing:', error);
            results.summary.errors.push(error.message);
        }

        return results;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            this.logger.info('Browser ditutup');
        }
    }

    async saveResults(results, outputFile = 'test-results.json') {
        try {
            await fs.writeJson(outputFile, results, { spaces: 2 });
            this.logger.info(`Hasil testing disimpan ke: ${outputFile}`);
        } catch (error) {
            this.logger.error('Gagal menyimpan hasil testing:', error);
        }
    }
}

// CLI Setup  
const argv = yargs
    .option('url', {
        alias: 'u',
        describe: 'URL website target',
        type: 'string'
    })
    .option('username', {
        describe: 'Username atau email untuk login',
        type: 'string'
    })
    .option('password', {
        describe: 'Password untuk login',
        type: 'string'
    })
    .option('basic-auth-username', {
        describe: 'Username untuk Basic Authentication',
        type: 'string'
    })
    .option('basic-auth-password', {
        describe: 'Password untuk Basic Authentication',
        type: 'string'
    })
    .option('config', {
        alias: 'c',
        describe: 'Path ke file konfigurasi JSON',
        type: 'string'
    })
    .option('use-cookie', {
        describe: 'Path ke file session/cookie untuk login',
        type: 'string'
    })
    .option('output', {
        alias: 'o',
        describe: 'Path file output hasil testing',
        type: 'string',
        default: 'test-results.json'
    })
    .option('headless', {
        describe: 'Jalankan browser dalam mode headless',
        type: 'boolean',
        default: false
    })
    .help()
    .alias('help', 'h')
    .example('$0 --url=https://example.com --username=test@test.com --password=123456', 'Login dengan kredensial')
    .example('$0 --config=config.json', 'Gunakan file konfigurasi')
    .example('$0 --use-cookie=auth.json', 'Login dengan session/cookie')
    .example('$0 --url=https://example.com --basic-auth-username=admin --basic-auth-password=secret123', 'Login dengan Basic Auth')
    .argv;

// Main execution
async function main() {
    const autoTester = new AutoTester();
    
    try {
        // Load configuration
        let config;
        if (argv.config) {
            config = await autoTester.configLoader.loadFromFile(argv.config);
        } else if (argv['use-cookie']) {
            config = {
                url: argv.url,
                useCookie: true,
                cookieFile: argv['use-cookie']
            };
        } else {
            config = {
                url: argv.url,
                username: argv.username,
                password: argv.password,
                saveSession: true,
                sessionFile: 'auth.json'
            };
        }

        // Add basic auth from command line if provided
        if (argv['basic-auth-username'] && argv['basic-auth-password']) {
            config.basicAuth = {
                enabled: true,
                username: argv['basic-auth-username'],
                password: argv['basic-auth-password']
            };
        }

        // Validate configuration
        if (!config.url) {
            console.error('Error: URL diperlukan. Gunakan --url atau --config');
            process.exit(1);
        }

        if (!config.useCookie && (!config.username || !config.password)) {
            console.error('Error: Username dan password diperlukan untuk login kredensial');
            process.exit(1);
        }

        // Initialize and run test (pass config to init for basic auth setup)
        await autoTester.init(argv.headless, config);
        const results = await autoTester.runTest(config);
        await autoTester.saveResults(results, argv.output);
        
        // Print summary
        console.log('\n=== HASIL TESTING ===');
        console.log(`Login: ${results.loginResult.success ? 'BERHASIL' : 'GAGAL'}`);
        console.log(`Basic Auth: ${results.config.basicAuth}`);
        console.log(`Total Test: ${results.summary.totalTests}`);
        console.log(`Berhasil: ${results.summary.passed}`);
        console.log(`Gagal: ${results.summary.failed}`);
        
        if (results.summary.errors.length > 0) {
            console.log('\nError:');
            results.summary.errors.forEach(err => console.log(`- ${err}`));
        }
        
    } catch (error) {
        console.error('Fatal error:', error.message);
        process.exit(1);
    } finally {
        await autoTester.cleanup();
    }
}

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\nMenghentikan aplikasi...');
    process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

if (require.main === module) {
    main();
}

module.exports = AutoTester; 