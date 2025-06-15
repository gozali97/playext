#!/usr/bin/env node

/**
 * Local Test Script
 * Menjalankan test tanpa dependency yargs untuk testing production environment
 */

const TestRunner = require('../src/core/TestRunner');

async function runLocalTest() {
    console.log('🚀 Starting Local Test (No CLI dependencies)...\n');
    
    try {
        const testRunner = new TestRunner();
        
        // Test dengan konfigurasi minimal
        const options = {
            type: 'smoke', // Test type yang ringan untuk testing
            config: 'config/default.json',
            html: true,
            verbose: false,
            headless: true
        };
        
        const results = await testRunner.run(options);
        
        console.log('\n✅ Local test completed successfully!');
        console.log('📊 Results:', {
            passed: results.summary.passed,
            failed: results.summary.failed,
            total: results.summary.totalTests
        });
        
        return results;
        
    } catch (error) {
        console.error('❌ Local test failed:', error.message);
        throw error;
    }
}

// Jalankan hanya jika file ini dieksekusi langsung
if (require.main === module) {
    runLocalTest()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = runLocalTest; 