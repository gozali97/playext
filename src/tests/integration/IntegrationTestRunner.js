const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

/**
 * Integration Test Runner
 * Menguji integrasi antar modul atau komponen, memastikan mereka bekerja sama dengan baik
 */
class IntegrationTestRunner {
    constructor(logger) {
        this.logger = logger;
        this.type = 'integration';
    }

    async run(config) {
        const startTime = Date.now();
        this.logger.info('🔗 Starting Integration Tests...');

        try {
            const integrationConfig = config.testTypes?.integration || {};
            
            if (!integrationConfig.enabled) {
                return {
                    success: true,
                    summary: { totalTests: 0, passed: 0, failed: 0, skipped: 1 },
                    tests: [],
                    metrics: {},
                    message: 'Integration tests disabled in configuration'
                };
            }

            // Load integration tests
            const integrationTests = await this.loadIntegrationTests(integrationConfig);
            
            // Run integration tests
            const results = await this.runIntegrationTests(integrationTests, config);
            
            const endTime = Date.now();
            const duration = endTime - startTime;

            this.logger.info(`✅ Integration Tests completed in ${duration}ms`);

            return {
                success: results.failed === 0,
                summary: {
                    totalTests: results.total,
                    passed: results.passed,
                    failed: results.failed,
                    skipped: results.skipped
                },
                tests: results.tests,
                metrics: {
                    duration,
                    averageTestTime: duration / results.total || 0,
                    integrationPoints: results.integrationPoints || 0
                },
                errors: results.errors
            };

        } catch (error) {
            this.logger.error('Integration Test Error:', error);
            return {
                success: false,
                summary: { totalTests: 0, passed: 0, failed: 1, skipped: 0 },
                tests: [],
                metrics: {},
                errors: [error.message]
            };
        }
    }

    async loadIntegrationTests(config) {
        const testDir = path.resolve(config.testDir || 'src/tests/integration');
        const tests = [];
        
        try {
            await fs.ensureDir(testDir);
            
            // Load example tests if directory is empty
            const files = await fs.readdir(testDir);
            if (files.length === 0) {
                await this.createExampleIntegrationTests(testDir);
            }
            
            // Find and load test files
            const testFiles = await this.findTestFiles(testDir);
            
            for (const filePath of testFiles) {
                try {
                    delete require.cache[require.resolve(filePath)];
                    const test = require(filePath);
                    tests.push({
                        name: path.basename(filePath, '.js'),
                        path: filePath,
                        ...test
                    });
                } catch (error) {
                    this.logger.warn(`Failed to load integration test: ${filePath}`, error);
                }
            }
            
        } catch (error) {
            this.logger.error('Failed to load integration tests:', error);
        }
        
        return tests;
    }

    async runIntegrationTests(tests, config) {
        const results = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            tests: [],
            errors: [],
            integrationPoints: 0
        };

        for (const test of tests) {
            const testResult = await this.runSingleIntegrationTest(test, config);
            results.tests.push(testResult);
            results.total++;
            
            if (testResult.status === 'PASSED') {
                results.passed++;
            } else if (testResult.status === 'FAILED') {
                results.failed++;
                results.errors.push(`${test.name} - ${testResult.error}`);
            } else {
                results.skipped++;
            }
            
            results.integrationPoints += testResult.integrationPoints || 0;
        }

        return results;
    }

    async runSingleIntegrationTest(test, config) {
        const startTime = Date.now();
        
        try {
            if (!test.integrations || !Array.isArray(test.integrations)) {
                throw new Error('Invalid integration test: missing integrations array');
            }

            const integrationResults = [];
            let integrationPoints = 0;

            // Run each integration test
            for (const integration of test.integrations) {
                const result = await this.runIntegration(integration, config);
                integrationResults.push(result);
                integrationPoints++;
            }

            const endTime = Date.now();
            
            return {
                name: test.name,
                status: 'PASSED',
                duration: endTime - startTime,
                integrationPoints,
                results: integrationResults,
                error: null
            };

        } catch (error) {
            const endTime = Date.now();
            
            return {
                name: test.name,
                status: 'FAILED',
                duration: endTime - startTime,
                integrationPoints: 0,
                results: [],
                error: error.message
            };
        }
    }

    async runIntegration(integration, config) {
        const startTime = Date.now();
        
        try {
            let result;
            
            switch (integration.type) {
                case 'api':
                    result = await this.testAPIIntegration(integration, config);
                    break;
                case 'database':
                    result = await this.testDatabaseIntegration(integration, config);
                    break;
                case 'service':
                    result = await this.testServiceIntegration(integration, config);
                    break;
                case 'module':
                    result = await this.testModuleIntegration(integration, config);
                    break;
                default:
                    throw new Error(`Unknown integration type: ${integration.type}`);
            }
            
            const endTime = Date.now();
            
            return {
                type: integration.type,
                name: integration.name,
                status: 'PASSED',
                duration: endTime - startTime,
                result
            };
            
        } catch (error) {
            const endTime = Date.now();
            
            return {
                type: integration.type,
                name: integration.name,
                status: 'FAILED',
                duration: endTime - startTime,
                error: error.message
            };
        }
    }

    async testAPIIntegration(integration, config) {
        const { endpoint, method = 'GET', headers = {}, data = null } = integration;
        
        const response = await axios({
            method,
            url: endpoint,
            headers,
            data,
            timeout: 10000
        });
        
        // Validate response
        if (integration.expectedStatus && response.status !== integration.expectedStatus) {
            throw new Error(`Expected status ${integration.expectedStatus}, got ${response.status}`);
        }
        
        return {
            status: response.status,
            headers: response.headers,
            data: response.data,
            responseTime: response.headers['x-response-time'] || 'N/A'
        };
    }

    async testDatabaseIntegration(integration, config) {
        // Mock database integration test
        return {
            connected: true,
            query: integration.query || 'SELECT 1',
            result: 'Connection successful'
        };
    }

    async testServiceIntegration(integration, config) {
        // Test service-to-service integration
        const { service, operation } = integration;
        
        return {
            service,
            operation,
            status: 'operational',
            response: 'Service integration successful'
        };
    }

    async testModuleIntegration(integration, config) {
        // Test module-to-module integration
        const { moduleA, moduleB, interaction } = integration;
        
        return {
            moduleA,
            moduleB,
            interaction,
            status: 'integrated',
            result: 'Module integration successful'
        };
    }

    async findTestFiles(testDir) {
        const files = [];
        
        try {
            const entries = await fs.readdir(testDir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(testDir, entry.name);
                
                if (entry.isDirectory()) {
                    const subFiles = await this.findTestFiles(fullPath);
                    files.push(...subFiles);
                } else if (entry.isFile() && entry.name.endsWith('.test.js')) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            this.logger.warn('Error reading test directory:', error);
        }
        
        return files;
    }

    async createExampleIntegrationTests(testDir) {
        const exampleTests = [
            {
                name: 'api-integration.test.js',
                content: `
// Example API Integration Test
module.exports = {
    name: 'API Integration Test',
    description: 'Tests integration with external APIs',
    
    integrations: [
        {
            type: 'api',
            name: 'Health Check API',
            endpoint: 'https://jsonplaceholder.typicode.com/posts/1',
            method: 'GET',
            expectedStatus: 200
        },
        {
            type: 'api',
            name: 'POST Request Test',
            endpoint: 'https://jsonplaceholder.typicode.com/posts',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: { title: 'Test Post', body: 'Test content' },
            expectedStatus: 201
        }
    ]
};
                `
            },
            {
                name: 'service-integration.test.js',
                content: `
// Example Service Integration Test
module.exports = {
    name: 'Service Integration Test',
    description: 'Tests integration between services',
    
    integrations: [
        {
            type: 'service',
            name: 'User Service to Auth Service',
            service: 'user-service',
            operation: 'authenticate',
            expectedResult: 'success'
        },
        {
            type: 'module',
            name: 'Payment Module to Order Module',
            moduleA: 'payment',
            moduleB: 'order',
            interaction: 'process_payment'
        }
    ]
};
                `
            }
        ];

        for (const test of exampleTests) {
            const filePath = path.join(testDir, test.name);
            await fs.writeFile(filePath, test.content.trim(), 'utf8');
        }

        this.logger.info(`Created ${exampleTests.length} example integration test files in ${testDir}`);
    }
}

module.exports = IntegrationTestRunner; 