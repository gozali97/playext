#!/usr/bin/env node

const AutoTester = require('./src/main');
const fs = require('fs-extra');

console.log('🎬 Playwright Auto Tester - Demo');
console.log('=================================\n');

async function runDemo() {
    const autoTester = new AutoTester();
    
    try {
        console.log('📋 Demo akan menjalankan testing pada formulir contoh...\n');
        
        // Demo configuration
        const demoConfig = {
            url: "https://httpbin.org/forms/post",
            username: "demo@example.com",
            password: "demopassword",
            useCookie: false,
            saveSession: false,
            headless: false,
            timeout: 30000,
            waitDelay: {
                min: 1000,
                max: 2000
            },
            testingOptions: {
                forms: {
                    fillRandom: true,
                    testValidation: true,
                    testSecurity: true,
                    maxFormsToTest: 2
                },
                security: {
                    checkCSRF: false,
                    checkXSS: true,
                    checkSQLInjection: true
                }
            }
        };

        console.log('⚙️  Konfigurasi Demo:');
        console.log(`   URL: ${demoConfig.url}`);
        console.log(`   Mode: ${demoConfig.headless ? 'Headless' : 'Dengan UI'}`);
        console.log(`   Security Testing: ${demoConfig.testingOptions.security.checkXSS ? 'Aktif' : 'Nonaktif'}\n`);

        // Initialize
        await autoTester.init(demoConfig.headless);

        // Navigate to demo form
        console.log('🌐 Membuka halaman demo form...');
        await autoTester.page.goto(demoConfig.url);
        
        // Wait for page load
        await autoTester.page.waitForTimeout(2000);

        console.log('📝 Memulai testing formulir...\n');

        // Run form testing
        const testResults = await autoTester.formTester.runAllTests();

        // Prepare results
        const results = {
            timestamp: new Date().toISOString(),
            config: {
                url: demoConfig.url,
                loginMethod: 'demo' 
            },
            loginResult: {
                method: 'demo',
                success: true,
                message: 'Demo mode - skip login'
            },
            testResults: testResults,
            summary: {
                totalTests: testResults.length,
                passed: testResults.filter(t => t.summary && t.summary.passed > 0).length,
                failed: testResults.filter(t => t.summary && t.summary.failed > 0).length,
                errors: []
            }
        };

        // Collect errors
        testResults.forEach(testResult => {
            if (testResult.summary && testResult.summary.errors) {
                results.summary.errors.push(...testResult.summary.errors);
            }
        });

        // Save results
        await autoTester.saveResults(results, 'demo-results.json');

        // Print summary
        console.log('\n🎯 HASIL DEMO TESTING');
        console.log('====================');
        console.log(`📊 Total Formulir Ditest: ${results.summary.totalTests}`);
        console.log(`✅ Berhasil: ${results.summary.passed}`);
        console.log(`❌ Gagal: ${results.summary.failed}`);
        
        if (results.summary.errors.length > 0) {
            console.log('\n🔍 Issues Ditemukan:');
            results.summary.errors.forEach((err, index) => {
                console.log(`   ${index + 1}. ${err}`);
            });
        } else {
            console.log('✨ Tidak ada security issues ditemukan!');
        }

        console.log(`\n📄 Hasil lengkap tersimpan di: demo-results.json`);
        console.log('\n🎉 Demo selesai!');
        
    } catch (error) {
        console.error('\n❌ Demo error:', error.message);
    } finally {
        await autoTester.cleanup();
    }
}

// Interactive demo prompt
async function interactiveDemo() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        console.log('🤖 Mode Demo Interaktif');
        console.log('======================\n');
        console.log('Demo ini akan menjalankan testing pada formulir contoh di httpbin.org');
        console.log('Testing yang akan dilakukan:');
        console.log('• Pengisian form dengan data valid');
        console.log('• Testing validasi form');
        console.log('• Security testing (XSS, SQL Injection)');
        console.log('• Boundary testing\n');

        rl.question('Mulai demo? (y/n): ', (answer) => {
            rl.close();
            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                resolve(true);
            } else {
                console.log('Demo dibatalkan.');
                resolve(false);
            }
        });
    });
}

async function main() {
    if (process.argv.includes('--interactive') || process.argv.includes('-i')) {
        const shouldRun = await interactiveDemo();
        if (shouldRun) {
            await runDemo();
        }
    } else {
        await runDemo();
    }
}

if (require.main === module) {
    main();
} 