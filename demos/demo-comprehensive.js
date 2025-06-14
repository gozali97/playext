const chalk = require('chalk');
const TestRunner = require('../src/core/TestRunner');

/**
 * Comprehensive Demo
 * Demonstrasi lengkap semua fitur Universal Test Automation Framework
 */
async function comprehensiveDemo() {
    console.log(chalk.cyan('🚀 Universal Test Automation Framework - Comprehensive Demo'));
    console.log(chalk.cyan('='.repeat(70)));
    console.log(chalk.yellow('Testing all 9 types of automation testing:\n'));
    
    const testTypes = [
        { type: 'unit', icon: '🧪', description: 'Unit Testing - Testing individual functions/methods' },
        { type: 'integration', icon: '🔗', description: 'Integration Testing - Testing module interactions' },
        { type: 'functional', icon: '🎯', description: 'Functional Testing - Testing features per specification' },
        { type: 'e2e', icon: '🌐', description: 'End-to-End Testing - Testing complete user flows' },
        { type: 'regression', icon: '🔄', description: 'Regression Testing - Re-testing after changes' },
        { type: 'smoke', icon: '💨', description: 'Smoke Testing - Testing core functionality' },
        { type: 'performance', icon: '⚡', description: 'Performance Testing - Testing speed & stability' },
        { type: 'load', icon: '📈', description: 'Load Testing - Testing under user load' },
        { type: 'security', icon: '🔒', description: 'Security Testing - Testing security vulnerabilities' }
    ];

    testTypes.forEach(test => {
        console.log(`${test.icon} ${test.type.toUpperCase().padEnd(12)} - ${test.description}`);
    });

    console.log(chalk.cyan('\n' + '='.repeat(70)));
    console.log(chalk.yellow('Starting comprehensive test execution...\n'));

    try {
        // Create test runner instance
        const testRunner = new TestRunner();
        
        // Configuration for demo
        const demoConfig = {
            target: {
                url: 'https://example.com',
                name: 'Demo Target Application',
                description: 'Comprehensive testing demo target'
            },
            auth: {
                username: 'demo@example.com',
                password: 'demo123',
                basicAuth: {
                    enabled: false,
                    username: '',
                    password: ''
                }
            },
            testTypes: {
                unit: { enabled: true, timeout: 5000 },
                integration: { enabled: true, timeout: 10000 },
                functional: { enabled: true, timeout: 15000 },
                e2e: { enabled: true, timeout: 30000 },
                regression: { enabled: true, tolerance: 0.1 },
                smoke: { enabled: true, criticalPaths: ['/home', '/about'] },
                performance: { 
                    enabled: true, 
                    thresholds: { 
                        loadTime: 3000, 
                        domContentLoaded: 2000 
                    } 
                },
                load: { 
                    enabled: true, 
                    virtualUsers: 5, 
                    duration: 10000 
                },
                security: { 
                    enabled: true, 
                    checks: ['headers', 'ssl'] 
                }
            },
            browser: {
                headless: true,
                slowMo: 0
            },
            reporting: {
                enabled: true,
                formats: ['json', 'html']
            },
            global: {
                retries: 1,
                timeout: 30000,
                verbose: true
            }
        };

        // Run comprehensive tests
        const results = await testRunner.run({
            type: 'all',
            config: null, // Will use the demoConfig passed directly
            html: true,
            verbose: true
        });

        // Display final summary
        console.log(chalk.cyan('\n🎊 COMPREHENSIVE DEMO COMPLETED!'));
        console.log(chalk.cyan('='.repeat(50)));
        
        // Show results summary
        console.log(chalk.yellow(`📊 Overall Results:`));
        console.log(chalk.green(`   ✅ Test Types Executed: ${results.summary.executed}`));
        console.log(chalk.green(`   ✅ Total Tests: ${results.summary.totalTests}`));
        console.log(chalk.green(`   ✅ Passed: ${results.summary.passed}`));
        
        if (results.summary.failed > 0) {
            console.log(chalk.red(`   ❌ Failed: ${results.summary.failed}`));
        }
        
        if (results.summary.skipped > 0) {
            console.log(chalk.gray(`   ⏭️ Skipped: ${results.summary.skipped}`));
        }
        
        console.log(chalk.yellow(`   ⏱️ Total Duration: ${results.framework.duration}ms`));

        // Show test type breakdown
        console.log(chalk.cyan('\n📋 Test Type Breakdown:'));
        Object.entries(results.testTypes).forEach(([type, result]) => {
            const icon = testTypes.find(t => t.type === type)?.icon || '🔧';
            const statusColor = result.status === 'PASSED' ? chalk.green : 
                               result.status === 'FAILED' ? chalk.red : chalk.yellow;
            
            console.log(`   ${icon} ${type.toUpperCase().padEnd(12)} ${statusColor(result.status)} (${result.duration}ms)`);
        });

        // Next steps
        console.log(chalk.cyan('\n🎯 Next Steps:'));
        console.log(chalk.gray('   • Check generated reports in ./reports/ directory'));
        console.log(chalk.gray('   • Customize configuration in config.json'));
        console.log(chalk.gray('   • Add your own test files in src/tests/ directories'));
        console.log(chalk.gray('   • Run specific test types with: npm run test:unit, test:e2e, etc.'));
        console.log(chalk.gray('   • Use --html flag for interactive HTML reports'));

        // Framework info
        console.log(chalk.cyan('\n📚 Framework Information:'));
        console.log(chalk.gray(`   • Framework: ${results.framework.name}`));
        console.log(chalk.gray(`   • Version: ${results.framework.version}`));
        console.log(chalk.gray(`   • Node.js: ${results.environment.nodeVersion}`));
        console.log(chalk.gray(`   • Platform: ${results.environment.platform}`));

        console.log(chalk.cyan('\n🚀 Happy Testing with Universal Test Automation Framework!'));
        
        process.exit(results.summary.failed > 0 ? 1 : 0);

    } catch (error) {
        console.error(chalk.red('\n❌ Demo failed:'), error.message);
        console.log(chalk.gray('Please check your configuration and try again.'));
        process.exit(1);
    }
}

// Command line interface
if (require.main === module) {
    comprehensiveDemo().catch(error => {
        console.error(chalk.red('Fatal error:'), error);
        process.exit(1);
    });
}

module.exports = comprehensiveDemo; 