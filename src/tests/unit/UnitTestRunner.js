const fs = require('fs-extra');
const path = require('path');

/**
 * Unit Test Runner
 * Menguji bagian terkecil dari aplikasi (fungsi, method, class) secara terpisah
 */
class UnitTestRunner {
    constructor(logger) {
        this.logger = logger;
        this.type = 'unit';
    }

    async run(config) {
        const startTime = Date.now();
        this.logger.info('🧪 Starting Unit Tests...');

        try {
            const unitConfig = config.testTypes?.unit || {};
            
            if (!unitConfig.enabled) {
                return {
                    success: true,
                    summary: { totalTests: 0, passed: 0, failed: 0, skipped: 1 },
                    tests: [],
                    metrics: {},
                    message: 'Unit tests disabled in configuration'
                };
            }

            // Load test modules
            const testModules = await this.loadTestModules(unitConfig);
            
            // Run unit tests
            const results = await this.runTestModules(testModules, unitConfig);
            
            const endTime = Date.now();
            const duration = endTime - startTime;

            this.logger.info(`✅ Unit Tests completed in ${duration}ms`);

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
                    testsPerSecond: results.total / (duration / 1000),
                    averageTestTime: duration / results.total || 0
                },
                errors: results.errors
            };

        } catch (error) {
            this.logger.error('Unit Test Error:', error);
            return {
                success: false,
                summary: { totalTests: 0, passed: 0, failed: 1, skipped: 0 },
                tests: [],
                metrics: {},
                errors: [error.message]
            };
        }
    }

    async loadTestModules(config) {
        const testDir = path.resolve(config.testDir || 'src/tests/unit');
        const pattern = config.pattern || '**/*.test.js';
        
        const modules = [];
        
        try {
            // Ensure test directory exists
            await fs.ensureDir(testDir);
            
            // Load example tests if directory is empty
            const files = await fs.readdir(testDir);
            if (files.length === 0) {
                await this.createExampleTests(testDir);
            }
            
            // Find test files
            const testFiles = await this.findTestFiles(testDir, pattern);
            
            // Load test modules
            for (const filePath of testFiles) {
                try {
                    // Clear require cache for fresh load
                    delete require.cache[require.resolve(filePath)];
                    const module = require(filePath);
                    modules.push({
                        name: path.basename(filePath, '.js'),
                        path: filePath,
                        tests: module.tests || [],
                        setup: module.setup,
                        teardown: module.teardown
                    });
                } catch (error) {
                    this.logger.warn(`Failed to load test module: ${filePath}`, error);
                }
            }
            
        } catch (error) {
            this.logger.error('Failed to load test modules:', error);
        }
        
        return modules;
    }

    async runTestModules(modules, config) {
        const results = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            tests: [],
            errors: []
        };

        for (const module of modules) {
            try {
                // Run module setup
                if (module.setup && typeof module.setup === 'function') {
                    await module.setup();
                }

                // Run tests in module
                for (const test of module.tests) {
                    const testResult = await this.runSingleTest(test, module, config);
                    results.tests.push(testResult);
                    results.total++;
                    
                    if (testResult.status === 'PASSED') {
                        results.passed++;
                    } else if (testResult.status === 'FAILED') {
                        results.failed++;
                        results.errors.push(`${module.name}:${test.name} - ${testResult.error}`);
                    } else {
                        results.skipped++;
                    }
                }

                // Run module teardown
                if (module.teardown && typeof module.teardown === 'function') {
                    await module.teardown();
                }

            } catch (error) {
                results.failed++;
                results.errors.push(`Module ${module.name}: ${error.message}`);
            }
        }

        return results;
    }

    async runSingleTest(test, module, config) {
        const startTime = Date.now();
        
        try {
            // Validate test structure
            if (!test.name || typeof test.fn !== 'function') {
                throw new Error('Invalid test structure: missing name or function');
            }

            // Set timeout
            const timeout = test.timeout || config.timeout || 5000;
            
            // Run test with timeout
            const result = await Promise.race([
                test.fn(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Test timeout')), timeout)
                )
            ]);

            const endTime = Date.now();
            
            return {
                name: test.name,
                module: module.name,
                status: 'PASSED',
                duration: endTime - startTime,
                result: result,
                error: null
            };

        } catch (error) {
            const endTime = Date.now();
            
            return {
                name: test.name,
                module: module.name,
                status: 'FAILED',
                duration: endTime - startTime,
                result: null,
                error: error.message
            };
        }
    }

    async findTestFiles(testDir, pattern) {
        const files = [];
        
        try {
            const entries = await fs.readdir(testDir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(testDir, entry.name);
                
                if (entry.isDirectory()) {
                    // Recursively search subdirectories
                    const subFiles = await this.findTestFiles(fullPath, pattern);
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

    async createExampleTests(testDir) {
        const exampleTests = [
            {
                name: 'math-utils.test.js',
                content: `
// Example Unit Tests for Math Utilities
const mathUtils = {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    multiply: (a, b) => a * b,
    divide: (a, b) => b !== 0 ? a / b : null
};

module.exports = {
    tests: [
        {
            name: 'add two positive numbers',
            fn: async () => {
                const result = mathUtils.add(2, 3);
                if (result !== 5) {
                    throw new Error(\`Expected 5, got \${result}\`);
                }
                return result;
            }
        },
        {
            name: 'subtract two numbers',
            fn: async () => {
                const result = mathUtils.subtract(10, 4);
                if (result !== 6) {
                    throw new Error(\`Expected 6, got \${result}\`);
                }
                return result;
            }
        },
        {
            name: 'multiply two numbers',
            fn: async () => {
                const result = mathUtils.multiply(3, 4);
                if (result !== 12) {
                    throw new Error(\`Expected 12, got \${result}\`);
                }
                return result;
            }
        },
        {
            name: 'divide by zero returns null',
            fn: async () => {
                const result = mathUtils.divide(10, 0);
                if (result !== null) {
                    throw new Error(\`Expected null, got \${result}\`);
                }
                return result;
            }
        }
    ],
    setup: async () => {
        console.log('Setting up math utils tests...');
    },
    teardown: async () => {
        console.log('Cleaning up math utils tests...');
    }
};
                `
            },
            {
                name: 'string-utils.test.js',
                content: `
// Example Unit Tests for String Utilities  
const stringUtils = {
    capitalize: str => str.charAt(0).toUpperCase() + str.slice(1),
    reverse: str => str.split('').reverse().join(''),
    isPalindrome: str => {
        const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');
        return clean === clean.split('').reverse().join('');
    }
};

module.exports = {
    tests: [
        {
            name: 'capitalize first letter',
            fn: async () => {
                const result = stringUtils.capitalize('hello');
                if (result !== 'Hello') {
                    throw new Error(\`Expected 'Hello', got '\${result}'\`);
                }
                return result;
            }
        },
        {
            name: 'reverse string',
            fn: async () => {
                const result = stringUtils.reverse('hello');
                if (result !== 'olleh') {
                    throw new Error(\`Expected 'olleh', got '\${result}'\`);
                }
                return result;
            }
        },
        {
            name: 'detect palindrome',
            fn: async () => {
                const result = stringUtils.isPalindrome('A man a plan a canal Panama');
                if (result !== true) {
                    throw new Error(\`Expected true, got \${result}\`);
                }
                return result;
            }
        },
        {
            name: 'detect non-palindrome',
            fn: async () => {
                const result = stringUtils.isPalindrome('hello world');
                if (result !== false) {
                    throw new Error(\`Expected false, got \${result}\`);
                }
                return result;
            }
        }
    ]
};
                `
            }
        ];

        for (const testFile of exampleTests) {
            const filePath = path.join(testDir, testFile.name);
            await fs.writeFile(filePath, testFile.content.trim(), 'utf8');
        }

        this.logger.info(`Created ${exampleTests.length} example unit test files in ${testDir}`);
    }
}

module.exports = UnitTestRunner; 