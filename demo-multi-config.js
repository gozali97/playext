const AutoTester = require('./src/main.js');
const fs = require('fs-extra');

async function testMultipleConfigurations() {
    console.log('🚀 Demo Multi-Configuration Testing...\n');
    
    const configurations = [
        {
            name: 'Current Config (K24 with Basic Auth)',
            file: 'config.json',
            description: 'Website dengan Basic Auth dan mode standard'
        },
        {
            name: 'Standard Website',
            file: 'config-standard.json',
            description: 'Website standard tanpa React atau Basic Auth'
        },
        {
            name: 'React/SPA Website',
            file: 'config-react.json',
            description: 'Website React dengan enhanced detection'
        },
        {
            name: 'Basic Auth Website',
            file: 'config-basicauth.json',
            description: 'Website dengan Basic Authentication'
        }
    ];
    
    console.log('📋 Konfigurasi yang tersedia:');
    configurations.forEach((config, index) => {
        console.log(`   ${index + 1}. ${config.name}`);
        console.log(`      File: ${config.file}`);
        console.log(`      Deskripsi: ${config.description}\n`);
    });
    
    // Meminta input dari user
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.question('Pilih konfigurasi (1-4) atau "all" untuk semua: ', async (answer) => {
        rl.close();
        
        let configsToTest = [];
        
        if (answer.toLowerCase() === 'all') {
            configsToTest = configurations;
        } else {
            const index = parseInt(answer) - 1;
            if (index >= 0 && index < configurations.length) {
                configsToTest = [configurations[index]];
            } else {
                console.log('❌ Pilihan tidak valid');
                process.exit(1);
            }
        }
        
        for (const config of configsToTest) {
            await testConfiguration(config);
        }
        
        console.log('\n✅ Semua testing selesai!');
    });
}

async function testConfiguration(configInfo) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 Testing: ${configInfo.name}`);
    console.log(`📄 File: ${configInfo.file}`);
    console.log(`📝 Deskripsi: ${configInfo.description}`);
    console.log(`${'='.repeat(60)}\n`);
    
    const autoTester = new AutoTester();
    
    try {
        // Load configuration
        let config;
        try {
            config = await fs.readJson(configInfo.file);
        } catch (error) {
            console.log(`❌ Error loading config ${configInfo.file}:`, error.message);
            console.log('💡 Pastikan file konfigurasi ada dan valid');
            return;
        }
        
        // Show configuration details
        console.log('📋 Detail Konfigurasi:');
        console.log(`   URL: ${config.url}`);
        console.log(`   Username: ${config.username}`);
        console.log(`   React Mode: ${config.reactMode?.enabled ? 'Enabled' : 'Disabled'}`);
        console.log(`   Basic Auth: ${config.basicAuth?.enabled ? 'Enabled' : 'Disabled'}`);
        console.log(`   Debug Mode: ${config.debug ? 'Enabled' : 'Disabled'}`);
        console.log(`   Max Retries: ${config.retry?.maxAttempts || 3}`);
        console.log(`   Timeout: ${config.browser?.timeout || 30000}ms\n`);
        
        // Initialize browser
        await autoTester.init(false, config);
        
        console.log('🔍 Menjalankan test...\n');
        
        // Run test
        const results = await autoTester.runTest(config);
        
        // Display results
        console.log('\n📊 HASIL TESTING:');
        console.log('-'.repeat(40));
        
        if (results.loginResult) {
            const status = results.loginResult.success ? '✅ BERHASIL' : '❌ GAGAL';
            console.log(`🔐 Login Status: ${status}`);
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
        const timestamp = Date.now();
        const outputFile = `test-results-${configInfo.name.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}.json`;
        await autoTester.saveResults(results, outputFile);
        console.log(`\n💾 Hasil disimpan ke: ${outputFile}`);
        
        // Cleanup
        await autoTester.cleanup();
        
        console.log(`\n✅ Testing ${configInfo.name} selesai!`);
        
    } catch (error) {
        console.error(`\n❌ Error selama testing ${configInfo.name}:`, error.message);
        
        try {
            await autoTester.cleanup();
        } catch (cleanupError) {
            console.error('Error during cleanup:', cleanupError.message);
        }
    }
}

// Fungsi untuk membuat contoh konfigurasi
async function createExampleConfigs() {
    const configs = [
        {
            name: 'config-standard.json',
            exists: await fs.pathExists('config-standard.json')
        },
        {
            name: 'config-react.json',
            exists: await fs.pathExists('config-react.json')
        },
        {
            name: 'config-basicauth.json',
            exists: await fs.pathExists('config-basicauth.json')
        }
    ];
    
    const missingConfigs = configs.filter(c => !c.exists);
    
    if (missingConfigs.length > 0) {
        console.log('\n⚠️  Beberapa file konfigurasi tidak ditemukan:');
        missingConfigs.forEach(config => {
            console.log(`   - ${config.name}`);
        });
        console.log('\n💡 File konfigurasi contoh telah dibuat. Silakan edit sesuai kebutuhan.');
    }
}

// Fungsi untuk menampilkan bantuan
function showHelp() {
    console.log(`
🔧 Panduan Penggunaan Multi-Configuration Testing:

📁 File Konfigurasi:
   • config.json           - Konfigurasi utama (K24 dengan Basic Auth)
   • config-standard.json   - Template untuk website standard
   • config-react.json      - Template untuk website React/SPA
   • config-basicauth.json  - Template untuk website dengan Basic Auth

🚀 Cara Menjalankan:
   node demo-multi-config.js

⚙️ Opsi Konfigurasi Penting:
   • reactMode.enabled      - true untuk React/SPA, false untuk standard
   • basicAuth.enabled      - true jika website memerlukan Basic Auth
   • debug                  - true untuk debug mode dengan screenshots
   • retry.maxAttempts      - jumlah percobaan jika gagal
   • browser.timeout        - timeout untuk operasi browser

💡 Tips:
   • Gunakan reactMode.enabled: false untuk website non-React
   • Gunakan basicAuth.enabled: true untuk website yang memerlukan HTTP Basic Auth
   • Aktifkan debug: true untuk troubleshooting
   • Sesuaikan selectors berdasarkan struktur website target
`);
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        showHelp();
    } else {
        createExampleConfigs().then(() => {
            testMultipleConfigurations();
        });
    }
} else {
    module.exports = { testMultipleConfigurations, testConfiguration };
} 