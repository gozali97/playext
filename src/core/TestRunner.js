const fs = require('fs-extra');
const path = require('path');
const yargs = require('yargs');
const chalk = require('chalk');
const ora = require('ora');

const Logger = require('../utils/logger');
const ReportGenerator = require('../utils/ReportGenerator');
const ConfigLoader = require('../config/configLoader');

// Test Type Imports
const UnitTestRunner = require('../tests/unit/UnitTestRunner');
const IntegrationTestRunner = require('../tests/integration/IntegrationTestRunner');
const FunctionalTestRunner = require('../tests/functional/FunctionalTestRunner');
const E2ETestRunner = require('../tests/e2e/E2ETestRunner');
const RegressionTestRunner = require('../tests/regression/RegressionTestRunner');
const SmokeTestRunner = require('../tests/smoke/SmokeTestRunner');
const PerformanceTestRunner = require('../tests/performance/PerformanceTestRunner');
const LoadTestRunner = require('../tests/load/LoadTestRunner');
const SecurityTestRunner = require('../tests/security/SecurityTestRunner');

class TestRunner {
    constructor() {
        this.logger = new Logger();
        this.reportGenerator = new ReportGenerator();
        this.configLoader = new ConfigLoader();
        this.testRunners = new Map();
        this.setupTestRunners();
    }

    setupTestRunners() {
        this.testRunners.set('unit', new UnitTestRunner(this.logger));
        this.testRunners.set('integration', new IntegrationTestRunner(this.logger));
        this.testRunners.set('functional', new FunctionalTestRunner(this.logger));
        this.testRunners.set('e2e', new E2ETestRunner(this.logger));
        this.testRunners.set('regression', new RegressionTestRunner(this.logger));
        this.testRunners.set('smoke', new SmokeTestRunner(this.logger));
        this.testRunners.set('performance', new PerformanceTestRunner(this.logger));
        this.testRunners.set('load', new LoadTestRunner(this.logger));
        this.testRunners.set('security', new SecurityTestRunner(this.logger));
    }

    async run(options = {}) {
        const startTime = Date.now();
        const spinner = ora('Initializing Test Framework...').start();

        try {
            // Load configuration
            const config = await this.loadConfiguration(options.config);
            
            // Override browser settings from CLI options
            this.applyBrowserOverrides(config, options);
            
            // Determine test types to run
            const testTypes = this.determineTestTypes(options.type, config);
            
            spinner.succeed('Test Framework Initialized');
            
            console.log(chalk.cyan('\n🚀 Universal Test Automation Framework v2.0'));
            console.log(chalk.gray('='.repeat(60)));
            console.log(chalk.yellow(`📋 Test Types: ${testTypes.join(', ')}`));
            console.log(chalk.yellow(`⚙️  Configuration: ${options.config || 'default'}`));
            console.log(chalk.yellow(`🎯 Target: ${config.target?.url || 'N/A'}\n`));

            // Initialize test results
            const testResults = {
                framework: {
                    name: 'Universal Test Automation Framework',
                    version: '2.0.0',
                    startTime: new Date(startTime).toISOString(),
                    endTime: null,
                    duration: null,
                    configuration: config
                },
                summary: {
                    totalTestTypes: testTypes.length,
                    executed: 0,
                    passed: 0,
                    failed: 0,
                    skipped: 0,
                    totalTests: 0,
                    errors: []
                },
                testTypes: {},
                environment: {
                    nodeVersion: process.version,
                    platform: process.platform,
                    architecture: process.arch,
                    memory: process.memoryUsage(),
                    timestamp: new Date().toISOString()
                }
            };

            // Run tests for each type
            for (const testType of testTypes) {
                await this.runTestType(testType, config, testResults);
            }

            // Finalize results
            const endTime = Date.now();
            testResults.framework.endTime = new Date(endTime).toISOString();
            testResults.framework.duration = endTime - startTime;

            // Generate report
            await this.generateReport(testResults, options);

            // Display summary
            this.displaySummary(testResults);

            return testResults;

        } catch (error) {
            spinner.fail('Test Framework Failed');
            this.logger.error('TestRunner Error:', error);
            throw error;
        }
    }

    async loadConfiguration(configPath) {
        try {
            return await this.configLoader.load(configPath);
        } catch (error) {
            this.logger.warn('Using default configuration due to error:', error.message);
            return this.configLoader.getDefaultConfig();
        }
    }

    applyBrowserOverrides(config, options) {
        // Ensure browser config exists
        if (!config.browser) {
            config.browser = {};
        }

        // Apply headless override from CLI
        if (options.headless !== null) {
            config.browser.headless = options.headless;
        } else if (options['show-browser']) {
            config.browser.headless = false;
            config.browser.slowMo = config.browser.slowMo || 100;
        }

        // Log browser mode
        const mode = config.browser.headless ? 'headless' : 'visible';
        this.logger.info(`🌐 Browser mode: ${mode}`);
    }

    determineTestTypes(typeOption, config = null) {
        const allTypes = ['unit', 'integration', 'functional', 'e2e', 'regression', 'smoke', 'performance', 'load', 'security'];
        
        if (typeOption === 'all') {
            return allTypes;
        }
        
        if (Array.isArray(typeOption)) {
            return typeOption.filter(type => allTypes.includes(type));
        }
        
        if (typeof typeOption === 'string' && typeOption !== 'auto') {
            return typeOption.split(',').map(t => t.trim()).filter(type => allTypes.includes(type));
        }
        
        // If no type specified or 'auto', determine from config
        if (!typeOption || typeOption === 'auto') {
            if (config && config.testTypes) {
                // Return only enabled test types from config
                const enabledTypes = allTypes.filter(type => {
                    const testConfig = config.testTypes[type];
                    return testConfig && testConfig.enabled !== false;
                });
                
                if (enabledTypes.length > 0) {
                    return enabledTypes;
                }
            }
            
            // Fallback to comprehensive default set
            return ['unit', 'integration', 'smoke', 'performance', 'security'];
        }
        
        return ['smoke']; // Final fallback
    }

    async runTestType(testType, config, testResults) {
        const spinner = ora(`Running ${testType.toUpperCase()} Tests...`).start();
        const startTime = Date.now();

        try {
            const runner = this.testRunners.get(testType);
            if (!runner) {
                throw new Error(`Test runner for type '${testType}' not found`);
            }

            // Run the specific test type
            const result = await runner.run(config);
            
            const endTime = Date.now();
            
            // Format result
            const formattedResult = {
                type: testType,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
                duration: endTime - startTime,
                status: result.success ? 'PASSED' : 'FAILED',
                summary: result.summary || {},
                tests: result.tests || [],
                metrics: result.metrics || {},
                errors: result.errors || []
            };

            testResults.testTypes[testType] = formattedResult;
            
            // Update overall summary
            testResults.summary.executed++;
            testResults.summary.totalTests += result.summary?.totalTests || 0;
            
            if (result.success) {
                testResults.summary.passed++;
                spinner.succeed(`${testType.toUpperCase()} Tests Completed`);
            } else {
                testResults.summary.failed++;
                testResults.summary.errors.push(...(result.errors || []));
                spinner.fail(`${testType.toUpperCase()} Tests Failed`);
            }

            console.log(chalk.gray(`   Duration: ${endTime - startTime}ms`));
            console.log(chalk.gray(`   Tests: ${result.summary?.totalTests || 0}`));
            console.log(chalk.gray(`   Status: ${result.success ? chalk.green('PASSED') : chalk.red('FAILED')}\n`));

        } catch (error) {
            const endTime = Date.now();
            
            testResults.testTypes[testType] = {
                type: testType,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
                duration: endTime - startTime,
                status: 'ERROR',
                error: error.message,
                stack: error.stack
            };

            testResults.summary.executed++;
            testResults.summary.failed++;
            testResults.summary.errors.push(`${testType}: ${error.message}`);

            spinner.fail(`${testType.toUpperCase()} Tests Error`);
            console.log(chalk.red(`   Error: ${error.message}\n`));
        }
    }

    async generateReport(testResults, options) {
        try {
            // Generate timestamp for unique filename
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const reportDir = path.join(process.cwd(), 'reports');
            
            // Ensure reports directory exists
            await fs.ensureDir(reportDir);
            
            // Generate main report
            const reportPath = path.join(reportDir, `test-report-${timestamp}.json`);
            await fs.writeJson(reportPath, testResults, { spaces: 2 });
            
            // Generate HTML report if requested
            if (options.html) {
                const htmlReportPath = path.join(reportDir, `test-report-${timestamp}.html`);
                await this.reportGenerator.generateHTMLReport(testResults, htmlReportPath);
            }
            
            // Generate summary report
            const summaryPath = path.join(reportDir, `test-summary-${timestamp}.json`);
            await fs.writeJson(summaryPath, {
                summary: testResults.summary,
                framework: testResults.framework,
                environment: testResults.environment
            }, { spaces: 2 });

            console.log(chalk.green(`📊 Test Report Generated: ${reportPath}`));
            if (options.html) {
                console.log(chalk.green(`🌐 HTML Report Generated: ${htmlReportPath}`));
            }

        } catch (error) {
            this.logger.error('Report generation failed:', error);
        }
    }

    displaySummary(testResults) {
        const { summary } = testResults;
        
        console.log(chalk.cyan('\n📈 TEST EXECUTION SUMMARY'));
        console.log(chalk.cyan('='.repeat(40)));
        console.log(chalk.yellow(`🔧 Test Types Executed: ${summary.executed}/${summary.totalTestTypes}`));
        console.log(chalk.yellow(`📝 Total Tests: ${summary.totalTests}`));
        console.log(chalk.green(`✅ Passed: ${summary.passed}`));
        console.log(chalk.red(`❌ Failed: ${summary.failed}`));
        console.log(chalk.gray(`⏭️  Skipped: ${summary.skipped}`));
        console.log(chalk.yellow(`⏱️  Duration: ${testResults.framework.duration}ms`));
        
        if (summary.errors.length > 0) {
            console.log(chalk.red('\n❌ ERRORS:'));
            summary.errors.forEach((error, index) => {
                console.log(chalk.red(`   ${index + 1}. ${error}`));
            });
        }
        
        console.log(chalk.cyan('\n🎯 NEXT STEPS:'));
        console.log(chalk.gray('   • Check detailed reports in ./reports/ directory'));
        console.log(chalk.gray('   • Use --html flag for interactive HTML reports'));
        console.log(chalk.gray('   • Run specific test types with --type flag'));
        console.log(chalk.gray('   • Update configuration in ./config/ directory\n'));
    }
}

// CLI Configuration
const argv = yargs
    .option('type', {
        alias: 't',
        describe: 'Test type(s) to run',
        type: 'string',
        choices: ['unit', 'integration', 'functional', 'e2e', 'regression', 'smoke', 'performance', 'load', 'security', 'all', 'auto'],
        default: 'auto'
    })
    .option('config', {
        alias: 'c',
        describe: 'Configuration file path',
        type: 'string',
        default: null
    })
    .option('html', {
        describe: 'Generate HTML report',
        type: 'boolean',
        default: false
    })
    .option('verbose', {
        alias: 'v',
        describe: 'Verbose output',
        type: 'boolean',
        default: false
    })
    .option('headless', {
        describe: 'Run browser in headless mode',
        type: 'boolean',
        default: null
    })
    .option('show-browser', {
        describe: 'Show browser window (opposite of headless)',
        type: 'boolean',
        default: false
    })
    .help()
    .alias('help', 'h')
    .example('$0', 'Run tests based on configuration (auto mode)')
    .example('$0 --type=smoke', 'Run smoke tests only')
    .example('$0 --type=unit,integration', 'Run unit and integration tests')
    .example('$0 --type=all --html', 'Run all tests with HTML report')
    .example('$0 --config=config/production.json', 'Run with specific configuration')
    .example('$0 --show-browser', 'Run with visible browser window')
    .example('$0 --headless', 'Run in headless mode')
    .argv;

// Main execution
async function main() {
    try {
        const testRunner = new TestRunner();
        const results = await testRunner.run(argv);
        
        // Exit with appropriate code
        const hasFailures = results.summary.failed > 0 || results.summary.errors.length > 0;
        process.exit(hasFailures ? 1 : 0);
        
    } catch (error) {
        console.error(chalk.red('Fatal Error:'), error.message);
        process.exit(1);
    }
}

// Run if this file is executed directly
if (require.main === module) {
    main();
}

module.exports = TestRunner; 