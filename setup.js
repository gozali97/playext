#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Playwright Auto Tester Setup');
console.log('================================\n');

async function setup() {
    try {
        // 1. Create necessary directories
        console.log('📁 Membuat direktori yang diperlukan...');
        await fs.ensureDir('logs');
        await fs.ensureDir('backups');
        console.log('✅ Direktori berhasil dibuat\n');

        // 2. Create .env file if not exists
        if (!await fs.pathExists('.env')) {
            console.log('📝 Membuat file .env...');
            await fs.copy('env.example', '.env');
            console.log('✅ File .env berhasil dibuat dari env.example\n');
        } else {
            console.log('ℹ️  File .env sudah ada\n');
        }

        // 3. Install dependencies
        console.log('📦 Menginstall dependencies...');
        try {
            execSync('npm install', { stdio: 'inherit' });
            console.log('✅ Dependencies berhasil diinstall\n');
        } catch (error) {
            console.error('❌ Gagal install dependencies:', error.message);
            return;
        }

        // 4. Install Playwright browsers
        console.log('🌐 Menginstall Playwright browsers...');
        try {
            execSync('npx playwright install', { stdio: 'inherit' });
            console.log('✅ Playwright browsers berhasil diinstall\n');
        } catch (error) {
            console.error('⚠️  Warning: Gagal install Playwright browsers:', error.message);
            console.log('Anda dapat menjalankan "npx playwright install" secara manual\n');
        }

        // 5. Create sample configuration
        console.log('⚙️  Mempersiapkan konfigurasi contoh...');
        const sampleConfig = {
            url: "https://httpbin.org/forms/post",
            username: "demo@example.com",
            password: "demopassword",
            useCookie: false,
            saveSession: true,
            sessionFile: "auth.json",
            headless: false,
            timeout: 30000,
            waitDelay: {
                min: 1000,
                max: 3000
            },
            testingOptions: {
                forms: {
                    fillRandom: true,
                    testValidation: true,
                    testSecurity: true,
                    maxFormsToTest: 3
                },
                security: {
                    checkCSRF: true,
                    checkXSS: true,
                    checkSQLInjection: false
                }
            }
        };

        await fs.writeJson('config-demo.json', sampleConfig, { spaces: 2 });
        console.log('✅ Konfigurasi demo berhasil dibuat (config-demo.json)\n');

        // 6. Setup complete
        console.log('🎉 Setup berhasil diselesaikan!\n');
        console.log('Cara penggunaan:');
        console.log('1. Edit file config.json atau config-demo.json sesuai kebutuhan');
        console.log('2. Jalankan testing dengan:');
        console.log('   node src/main.js --config=config-demo.json');
        console.log('   atau');
        console.log('   npm test\n');
        
        console.log('Contoh command lainnya:');
        console.log('• Login dengan kredensial:');
        console.log('  node src/main.js --url=https://example.com --username=user --password=pass');
        console.log('• Login dengan cookie:');
        console.log('  node src/main.js --use-cookie=auth.json');
        console.log('• Mode headless:');
        console.log('  node src/main.js --config=config.json --headless\n');

    } catch (error) {
        console.error('❌ Setup gagal:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    setup();
} 