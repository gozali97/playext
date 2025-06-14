const AutoTester = require('./src/main.js');
const path = require('path');

async function demoReactLogin() {
    const autoTester = new AutoTester();
    
    try {
        console.log('🚀 Memulai Demo Testing untuk React App...\n');
        
        // Konfigurasi khusus untuk React
        const config = {
            url: 'https://klc.k24.co.id/login',
            username: 'ahmad.gozali@k24.co.id',
            password: 'Ahmad@0410',
            
            // Browser settings optimized for React
            browser: {
                headless: false,
                timeout: 60000,
                viewport: {
                    width: 1366,
                    height: 768
                }
            },
            
            // Basic Auth tetap diperlukan
            basicAuth: {
                enabled: true,
                username: 'project',
                password: 'k24multi'
            },
            
            // Delays yang lebih panjang untuk React
            delays: {
                min: 1000,
                max: 3000,
                beforeSubmit: 3000,
                afterSubmit: 5000
            },
            
            // Enhanced selectors for React
            selectors: {
                login: {
                    usernameFields: [
                        // Standard selectors
                        'input[name="username"]',
                        'input[name="email"]',
                        'input[type="email"]',
                        // React-specific selectors
                        '[data-testid*="username"]',
                        '[data-testid*="email"]',
                        '[data-cy*="username"]',
                        '[data-cy*="email"]',
                        // Common class patterns
                        '.username-input',
                        '.email-input',
                        '.login-input',
                        // ID selectors
                        '#username',
                        '#email',
                        '#user',
                        // Placeholder-based
                        'input[placeholder*="email"]',
                        'input[placeholder*="Email"]',
                        'input[placeholder*="username"]',
                        'input[placeholder*="Username"]'
                    ],
                    passwordFields: [
                        // Standard selectors
                        'input[name="password"]',
                        'input[type="password"]',
                        // React-specific selectors
                        '[data-testid*="password"]',
                        '[data-cy*="password"]',
                        // Common patterns
                        '.password-input',
                        '#password',
                        '#pass',
                        // Placeholder-based
                        'input[placeholder*="password"]',
                        'input[placeholder*="Password"]'
                    ],
                    submitButtons: [
                        // Standard selectors
                        'button[type="submit"]',
                        'input[type="submit"]',
                        // React-specific selectors
                        '[data-testid*="submit"]',
                        '[data-testid*="login"]',
                        '[data-cy*="submit"]',
                        '[data-cy*="login"]',
                        // Common button classes
                        '.login-btn',
                        '.submit-btn',
                        '.btn-login',
                        '.btn-submit',
                        '.btn-primary',
                        // Generic button with text content (handled by XPath in login.js)
                        'button'
                    ]
                }
            },
            
            // Enhanced security settings
            security: {
                handleCSRF: true,
                detectAntiBot: true,
                randomDelay: true
            },
            
            // Debug mode enabled
            debug: true,
            
            // Retry settings
            retry: {
                maxAttempts: 5,
                delay: 3000
            },
            
            // Session management
            saveSession: true,
            sessionFile: 'react-session.json',
            
            // Testing options (disable heavy testing for login demo)
            testingOptions: {
                testValidData: false,
                testInvalidData: false,
                testSecurity: false,
                testBoundary: false,
                maxFormsToTest: 0
            }
        };
        
        console.log('📋 Konfigurasi React Demo:');
        console.log(`   URL: ${config.url}`);
        console.log(`   Username: ${config.username}`);
        console.log(`   Basic Auth: ${config.basicAuth.enabled ? 'Enabled' : 'Disabled'}`);
        console.log(`   Debug Mode: ${config.debug ? 'Enabled' : 'Disabled'}`);
        console.log(`   Retry Attempts: ${config.retry.maxAttempts}`);
        console.log(`   Viewport: ${config.browser.viewport.width}x${config.browser.viewport.height}\n`);
        
        // Initialize browser dengan config
        await autoTester.init(false, config);
        
        console.log('🔍 Menjalankan test login untuk React app...\n');
        
        // Run the test
        const results = await autoTester.runTest(config);
        
        // Display results
        console.log('\n📊 HASIL TESTING:');
        console.log('=' . repeat(50));
        
        if (results.loginResult) {
            console.log(`\n🔐 Login Status: ${results.loginResult.success ? '✅ BERHASIL' : '❌ GAGAL'}`);
            console.log(`   Method: ${results.loginResult.method}`);
            console.log(`   Message: ${results.loginResult.message}`);
        }
        
        if (results.summary) {
            console.log(`\n📈 Summary:`);
            console.log(`   Total Tests: ${results.summary.totalTests}`);
            console.log(`   Passed: ${results.summary.passed}`);
            console.log(`   Failed: ${results.summary.failed}`);
            
            if (results.summary.errors.length > 0) {
                console.log(`\n❌ Errors:`);
                results.summary.errors.forEach((error, index) => {
                    console.log(`   ${index + 1}. ${error}`);
                });
            }
        }
        
        // Save results
        const outputFile = `react-test-results-${Date.now()}.json`;
        await autoTester.saveResults(results, outputFile);
        console.log(`\n💾 Hasil disimpan ke: ${outputFile}`);
        
        // Show debug screenshots if available
        if (config.debug) {
            console.log('\n📸 Debug Screenshots:');
            console.log('   - debug-navigate.png (jika ada)');
            console.log('   - debug-form-found.png (jika ada)');
            console.log('   - debug-form-filled.png (jika ada)');
        }
        
        console.log('\n✨ Demo selesai! Tekan Enter untuk menutup browser...');
        
        // Wait for user input to close
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', async () => {
            await autoTester.cleanup();
            process.exit(0);
        });
        
    } catch (error) {
        console.error('\n❌ Error selama demo:', error.message);
        console.error('\n📋 Stack trace untuk debugging:');
        console.error(error.stack);
        
        try {
            await autoTester.cleanup();
        } catch (cleanupError) {
            console.error('Error during cleanup:', cleanupError.message);
        }
        process.exit(1);
    }
}

// Helper function to repeat string (untuk display)
String.prototype.repeat = String.prototype.repeat || function(count) {
    if (count < 1) return '';
    var result = '', pattern = this.valueOf();
    while (count > 1) {
        if (count & 1) result += pattern;
        count >>>= 1, pattern += pattern;
    }
    return result + pattern;
};

// Run demo
if (require.main === module) {
    demoReactLogin();
} else {
    module.exports = demoReactLogin;
} 