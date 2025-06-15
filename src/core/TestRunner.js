const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

// Conditionally require yargs only if running from CLI
let yargs = null;
const isProductionEnv = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

// Only try to require yargs if not in production environment or if explicitly needed
if (!isProductionEnv || process.argv.length > 2) {
    try {
        yargs = require('yargs');
    } catch (error) {
        console.warn('⚠️  yargs not available, using programmatic mode');
    }
}

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
            let htmlReportPath = null;
            if (options.html) {
                htmlReportPath = path.join(reportDir, `test-report-${timestamp}.html`);
                await this.generateHTMLReport(testResults, htmlReportPath);
            }
            
            // Generate summary report
            const summaryPath = path.join(reportDir, `test-summary-${timestamp}.json`);
            await fs.writeJson(summaryPath, {
                summary: testResults.summary,
                framework: testResults.framework,
                environment: testResults.environment
            }, { spaces: 2 });

            console.log(chalk.green(`📊 Test Report Generated: ${reportPath}`));
            if (options.html && htmlReportPath) {
                console.log(chalk.green(`🌐 HTML Report Generated: ${htmlReportPath}`));
            }

        } catch (error) {
            this.logger.error('Report generation failed:', error);
        }
    }

    async generateHTMLReport(testResults, htmlReportPath) {
        const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Report - ${testResults.framework.name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .summary-card h3 { color: #666; font-size: 14px; text-transform: uppercase; margin-bottom: 10px; }
        .summary-card .value { font-size: 32px; font-weight: bold; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .pending { color: #ffc107; }
        .test-results { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .test-type { border-bottom: 1px solid #eee; }
        .test-type:last-child { border-bottom: none; }
        .test-header { padding: 20px; background: #f8f9fa; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
        .test-header:hover { background: #e9ecef; }
        .test-content { padding: 20px; display: none; }
        .test-content.active { display: block; }
        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .status-passed { background: #d4edda; color: #155724; }
        .status-failed { background: #f8d7da; color: #721c24; }
        .status-error { background: #f8d7da; color: #721c24; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-top: 15px; }
        .metric { background: #f8f9fa; padding: 15px; border-radius: 5px; }
        .errors { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin-top: 15px; }
        .toggle-icon { transition: transform 0.3s; }
        .toggle-icon.active { transform: rotate(180deg); }
        .footer { text-align: center; margin-top: 40px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 ${testResults.framework.name}</h1>
            <p>Generated: ${new Date(testResults.framework.timestamp).toLocaleString()}</p>
            <p>Target: ${testResults.framework.target}</p>
            <p>Duration: ${testResults.framework.duration}ms</p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3>Test Types</h3>
                <div class="value">${testResults.summary.executed}/${testResults.summary.totalTestTypes}</div>
            </div>
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="value">${testResults.summary.totalTests}</div>
            </div>
            <div class="summary-card">
                <h3>Passed</h3>
                <div class="value passed">${testResults.summary.passed}</div>
            </div>
            <div class="summary-card">
                <h3>Failed</h3>
                <div class="value failed">${testResults.summary.failed}</div>
            </div>
            <div class="summary-card">
                <h3>Success Rate</h3>
                <div class="value">${Math.round((testResults.summary.passed / testResults.summary.executed) * 100)}%</div>
            </div>
        </div>

        <div class="test-results">
            ${Object.entries(testResults.testTypes).map(([type, result]) => `
                <div class="test-type">
                    <div class="test-header" onclick="toggleTestContent('${type}')">
                        <div>
                            <h3>${type.toUpperCase()} Tests</h3>
                            <span class="status-badge status-${result.status.toLowerCase()}">${result.status}</span>
                        </div>
                        <div>
                            <span>Duration: ${result.duration}ms</span>
                            <span class="toggle-icon" id="icon-${type}">▼</span>
                        </div>
                    </div>
                    <div class="test-content" id="content-${type}">
                        <p><strong>Start Time:</strong> ${new Date(result.startTime).toLocaleString()}</p>
                        <p><strong>End Time:</strong> ${new Date(result.endTime).toLocaleString()}</p>
                        <p><strong>Duration:</strong> ${result.duration}ms</p>
                        
                        ${result.summary ? `
                            <div class="metrics">
                                ${Object.entries(result.summary).map(([key, value]) => `
                                    <div class="metric">
                                        <strong>${key}:</strong> ${typeof value === 'object' ? JSON.stringify(value) : value}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        
                        ${result.errors && result.errors.length > 0 ? `
                            <div class="errors">
                                <h4>Errors:</h4>
                                <ul>
                                    ${result.errors.map(error => `<li>${error}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        ${result.error ? `
                            <div class="errors">
                                <h4>Error:</h4>
                                <p>${result.error}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>

        ${testResults.summary.errors.length > 0 ? `
            <div class="errors" style="margin-top: 30px;">
                <h3>Overall Errors:</h3>
                <ul>
                    ${testResults.summary.errors.map(error => `<li>${error}</li>`).join('')}
                </ul>
            </div>
        ` : ''}

        <div class="footer">
            <p>Generated by Universal Test Automation Framework v2.0</p>
        </div>
    </div>

    <script>
        function toggleTestContent(type) {
            const content = document.getElementById('content-' + type);
            const icon = document.getElementById('icon-' + type);
            
            if (content.classList.contains('active')) {
                content.classList.remove('active');
                icon.classList.remove('active');
            } else {
                content.classList.add('active');
                icon.classList.add('active');
            }
        }
    </script>
</body>
</html>`;

        await fs.writeFile(htmlReportPath, htmlTemplate);
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

// CLI Configuration (only if yargs is available)
let argv = {};
if (yargs) {
    argv = yargs
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
} else {
    // Parse command line arguments manually when yargs is not available
    const args = process.argv.slice(2);
    argv = {
        type: 'auto',
        config: null,
        html: false,
        verbose: false,
        headless: null,
        'show-browser': false
    };
    
    for (const arg of args) {
        if (arg.startsWith('--type=')) {
            argv.type = arg.split('=')[1];
        } else if (arg.startsWith('--config=')) {
            argv.config = arg.split('=')[1];
        } else if (arg === '--html') {
            argv.html = true;
        } else if (arg === '--verbose' || arg === '-v') {
            argv.verbose = true;
        } else if (arg === '--headless') {
            argv.headless = true;
        } else if (arg === '--show-browser') {
            argv['show-browser'] = true;
        }
    }
}

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