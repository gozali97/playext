const fs = require('fs-extra');
const path = require('path');
const Joi = require('joi');

class ConfigLoader {
    constructor() {
        this.schema = this.getConfigSchema();
        this.defaultConfig = this.getDefaultConfig();
    }

    async load(configPath) {
        try {
            let config;
            
            if (configPath) {
                // Load specific config file
                const fullPath = path.resolve(configPath);
                if (await fs.pathExists(fullPath)) {
                    config = await fs.readJson(fullPath);
                } else {
                    throw new Error(`Configuration file not found: ${fullPath}`);
                }
            } else {
                // Try to load default configs in order
                const defaultPaths = [
                    'config/universal-testing.json',
                    'config.json',
                    'config/default.json',
                    'config/config.json'
                ];
                
                for (const defaultPath of defaultPaths) {
                    if (await fs.pathExists(defaultPath)) {
                        config = await fs.readJson(defaultPath);
                        break;
                    }
                }
                
                if (!config) {
                    config = this.defaultConfig;
                }
            }
            
            // Validate configuration
            const validated = await this.validate(config);
            
            // Merge with defaults
            return this.mergeWithDefaults(validated);
            
        } catch (error) {
            throw new Error(`Failed to load configuration: ${error.message}`);
        }
    }

    async validate(config) {
        try {
            const { error, value } = this.schema.validate(config, { 
                allowUnknown: true,
                stripUnknown: false 
            });
            
            if (error) {
                throw new Error(`Configuration validation failed: ${error.details.map(d => d.message).join(', ')}`);
            }
            
            return value;
        } catch (error) {
            throw new Error(`Configuration validation error: ${error.message}`);
        }
    }

    mergeWithDefaults(config) {
        return {
            ...this.defaultConfig,
            ...config,
            testTypes: {
                ...this.defaultConfig.testTypes,
                ...(config.testTypes || {})
            },
            browser: {
                ...this.defaultConfig.browser,
                ...(config.browser || {})
            },
            performance: {
                ...this.defaultConfig.performance,
                ...(config.performance || {})
            },
            security: {
                ...this.defaultConfig.security,
                ...(config.security || {})
            }
        };
    }

    getConfigSchema() {
        return Joi.object({
            // Target application
            target: Joi.object({
                url: Joi.string().uri().required(),
                name: Joi.string().default('Target Application'),
                description: Joi.string().default('')
            }).required(),

            // Authentication
            auth: Joi.object({
                username: Joi.string().allow(''),
                password: Joi.string().allow(''),
                basicAuth: Joi.object({
                    enabled: Joi.boolean().default(false),
                    username: Joi.string().allow(''),
                    password: Joi.string().allow('')
                }).default({}),
                loginSelectors: Joi.object({
                    usernameField: Joi.array().items(Joi.string()).default(['input[name="username"]', '#username']),
                    passwordField: Joi.array().items(Joi.string()).default(['input[name="password"]', '#password']),
                    submitButton: Joi.array().items(Joi.string()).default(['input[type="submit"]', 'button[type="submit"]'])
                }).default({})
            }).default({}),

            // Test Types Configuration
            testTypes: Joi.object({
                unit: Joi.object({
                    enabled: Joi.boolean().default(true),
                    testDir: Joi.string().default('src/tests/unit'),
                    pattern: Joi.string().default('**/*.test.js'),
                    timeout: Joi.number().default(5000)
                }).default({}),
                
                integration: Joi.object({
                    enabled: Joi.boolean().default(true),
                    testDir: Joi.string().default('src/tests/integration'),
                    pattern: Joi.string().default('**/*.test.js'),
                    timeout: Joi.number().default(30000)
                }).default({}),
                
                functional: Joi.object({
                    enabled: Joi.boolean().default(true),
                    testDir: Joi.string().default('src/tests/functional'),
                    pattern: Joi.string().default('**/*.test.js'),
                    timeout: Joi.number().default(60000)
                }).default({}),
                
                e2e: Joi.object({
                    enabled: Joi.boolean().default(true),
                    testDir: Joi.string().default('src/tests/e2e'),
                    pattern: Joi.string().default('**/*.test.js'),
                    timeout: Joi.number().default(120000)
                }).default({}),
                
                regression: Joi.object({
                    enabled: Joi.boolean().default(true),
                    baselineDir: Joi.string().default('data/baselines'),
                    compareDir: Joi.string().default('data/comparisons'),
                    tolerance: Joi.number().default(0.1)
                }).default({}),
                
                smoke: Joi.object({
                    enabled: Joi.boolean().default(true),
                    criticalPaths: Joi.array().items(Joi.string()).default(['/login', '/dashboard']),
                    timeout: Joi.number().default(30000)
                }).default({}),
                
                performance: Joi.object({
                    enabled: Joi.boolean().default(true),
                    metrics: Joi.array().items(Joi.string()).default(['loadTime', 'domContentLoaded', 'firstPaint']),
                    thresholds: Joi.object({
                        loadTime: Joi.number().default(3000),
                        domContentLoaded: Joi.number().default(2000),
                        firstPaint: Joi.number().default(1500)
                    }).default({})
                }).default({}),
                
                load: Joi.object({
                    enabled: Joi.boolean().default(true),
                    virtualUsers: Joi.number().default(10),
                    duration: Joi.number().default(60000),
                    rampUp: Joi.number().default(10000)
                }).default({}),
                
                security: Joi.object({
                    enabled: Joi.boolean().default(true),
                    checks: Joi.array().items(Joi.string()).default(['xss', 'sqlInjection', 'csrf']),
                    timeout: Joi.number().default(30000)
                }).default({})
            }).default({}),

            // Browser Configuration
            browser: Joi.object({
                type: Joi.string().valid('chromium', 'firefox', 'webkit').default('chromium'),
                headless: Joi.boolean().default(true),
                slowMo: Joi.number().default(0),
                timeout: Joi.number().default(30000),
                viewport: Joi.object({
                    width: Joi.number().default(1920),
                    height: Joi.number().default(1080)
                }).default({}),
                options: Joi.object().default({})
            }).default({}),

            // Reporting Configuration
            reporting: Joi.object({
                enabled: Joi.boolean().default(true),
                formats: Joi.array().items(Joi.string().valid('json', 'html', 'markdown')).default(['json']),
                outputDir: Joi.string().default('reports'),
                includeScreenshots: Joi.boolean().default(true),
                includeVideos: Joi.boolean().default(false)
            }).default({}),

            // Performance Testing
            performance: Joi.object({
                metrics: Joi.array().items(Joi.string()).default(['loadTime', 'domContentLoaded', 'firstPaint']),
                thresholds: Joi.object().default({}),
                collectNetworkLogs: Joi.boolean().default(true),
                collectConsoleLogs: Joi.boolean().default(true)
            }).default({}),

            // Security Testing
            security: Joi.object({
                payloads: Joi.object({
                    xss: Joi.array().items(Joi.string()).default(['<script>alert("XSS")</script>']),
                    sqlInjection: Joi.array().items(Joi.string()).default(["' OR '1'='1"]),
                    csrf: Joi.array().items(Joi.string()).default(['../../../etc/passwd'])
                }).default({}),
                headers: Joi.array().items(Joi.string()).default(['X-Frame-Options', 'X-Content-Type-Options']),
                ssl: Joi.object({
                    checkCertificate: Joi.boolean().default(true),
                    checkProtocols: Joi.boolean().default(true)
                }).default({})
            }).default({}),

            // Global Settings
            global: Joi.object({
                retries: Joi.number().default(2),
                parallel: Joi.boolean().default(true),
                maxWorkers: Joi.number().default(4),
                timeout: Joi.number().default(60000),
                verbose: Joi.boolean().default(false)
            }).default({})
        });
    }

    getDefaultConfig() {
        return {
            target: {
                url: 'https://example.com',
                name: 'Default Test Target',
                description: 'Default configuration for testing'
            },
            auth: {
                username: '',
                password: '',
                basicAuth: {
                    enabled: false,
                    username: '',
                    password: ''
                },
                loginSelectors: {
                    usernameField: ['input[name="username"]', '#username', 'input[type="email"]'],
                    passwordField: ['input[name="password"]', '#password'],
                    submitButton: ['input[type="submit"]', 'button[type="submit"]', 'button:contains("Login")']
                }
            },
            testTypes: {
                unit: {
                    enabled: true,
                    testDir: 'src/tests/unit',
                    pattern: '**/*.test.js',
                    timeout: 5000
                },
                integration: {
                    enabled: true,
                    testDir: 'src/tests/integration',
                    pattern: '**/*.test.js',
                    timeout: 30000
                },
                functional: {
                    enabled: true,
                    testDir: 'src/tests/functional',
                    pattern: '**/*.test.js',
                    timeout: 60000
                },
                e2e: {
                    enabled: true,
                    testDir: 'src/tests/e2e',
                    pattern: '**/*.test.js',
                    timeout: 120000
                },
                regression: {
                    enabled: true,
                    baselineDir: 'data/baselines',
                    compareDir: 'data/comparisons',
                    tolerance: 0.1
                },
                smoke: {
                    enabled: true,
                    criticalPaths: ['/login', '/dashboard', '/profile'],
                    timeout: 30000
                },
                performance: {
                    enabled: true,
                    metrics: ['loadTime', 'domContentLoaded', 'firstPaint', 'firstContentfulPaint'],
                    thresholds: {
                        loadTime: 3000,
                        domContentLoaded: 2000,
                        firstPaint: 1500,
                        firstContentfulPaint: 2000
                    }
                },
                load: {
                    enabled: true,
                    virtualUsers: 10,
                    duration: 60000,
                    rampUp: 10000
                },
                security: {
                    enabled: true,
                    checks: ['xss', 'sqlInjection', 'csrf', 'headers', 'ssl'],
                    timeout: 30000
                }
            },
            browser: {
                type: 'chromium',
                headless: true,
                slowMo: 0,
                timeout: 30000,
                viewport: {
                    width: 1920,
                    height: 1080
                },
                options: {
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                }
            },
            reporting: {
                enabled: true,
                formats: ['json', 'html'],
                outputDir: 'reports',
                includeScreenshots: true,
                includeVideos: false
            },
            performance: {
                metrics: ['loadTime', 'domContentLoaded', 'firstPaint', 'firstContentfulPaint'],
                thresholds: {
                    loadTime: 3000,
                    domContentLoaded: 2000,
                    firstPaint: 1500,
                    firstContentfulPaint: 2000
                },
                collectNetworkLogs: true,
                collectConsoleLogs: true
            },
            security: {
                payloads: {
                    xss: [
                        '<script>alert("XSS")</script>',
                        '"><script>alert("XSS")</script>',
                        'javascript:alert("XSS")'
                    ],
                    sqlInjection: [
                        "' OR '1'='1",
                        "'; DROP TABLE users; --",
                        "1' UNION SELECT * FROM users --"
                    ],
                    csrf: [
                        '../../../etc/passwd',
                        '../../../../windows/system32/drivers/etc/hosts'
                    ]
                },
                headers: [
                    'X-Frame-Options',
                    'X-Content-Type-Options',
                    'X-XSS-Protection',
                    'Strict-Transport-Security',
                    'Content-Security-Policy'
                ],
                ssl: {
                    checkCertificate: true,
                    checkProtocols: true
                }
            },
            global: {
                retries: 2,
                parallel: true,
                maxWorkers: 4,
                timeout: 60000,
                verbose: false
            }
        };
    }

    async createSampleConfig(outputPath) {
        const sampleConfig = {
            ...this.defaultConfig,
            target: {
                url: 'https://your-website.com',
                name: 'Your Website',
                description: 'Configuration for testing your website'
            },
            auth: {
                username: 'your-username@example.com',
                password: 'your-password',
                basicAuth: {
                    enabled: false,
                    username: '',
                    password: ''
                }
            }
        };

        await fs.writeJson(outputPath, sampleConfig, { spaces: 2 });
        return outputPath;
    }

    async createConfigFromTemplate(templateName, outputPath) {
        const templates = {
            standard: this.getStandardTemplate(),
            spa: this.getSPATemplate(),
            api: this.getAPITemplate(),
            mobile: this.getMobileTemplate()
        };

        const template = templates[templateName];
        if (!template) {
            throw new Error(`Template '${templateName}' not found. Available templates: ${Object.keys(templates).join(', ')}`);
        }

        await fs.writeJson(outputPath, template, { spaces: 2 });
        return outputPath;
    }

    getStandardTemplate() {
        return {
            ...this.defaultConfig,
            target: {
                url: 'https://your-standard-website.com',
                name: 'Standard Website',
                description: 'Configuration for standard HTML websites'
            },
            testTypes: {
                ...this.defaultConfig.testTypes,
                performance: {
                    ...this.defaultConfig.testTypes.performance,
                    thresholds: {
                        loadTime: 2000,
                        domContentLoaded: 1500,
                        firstPaint: 1000
                    }
                }
            }
        };
    }

    getSPATemplate() {
        return {
            ...this.defaultConfig,
            target: {
                url: 'https://your-spa-website.com',
                name: 'SPA Website',
                description: 'Configuration for Single Page Applications (React, Vue, Angular)'
            },
            browser: {
                ...this.defaultConfig.browser,
                slowMo: 100, // Slower for SPA loading
                timeout: 60000
            },
            testTypes: {
                ...this.defaultConfig.testTypes,
                performance: {
                    ...this.defaultConfig.testTypes.performance,
                    thresholds: {
                        loadTime: 4000,
                        domContentLoaded: 3000,
                        firstPaint: 2000
                    }
                }
            }
        };
    }

    getAPITemplate() {
        return {
            ...this.defaultConfig,
            target: {
                url: 'https://api.your-website.com',
                name: 'API Endpoints',
                description: 'Configuration for API testing'
            },
            testTypes: {
                unit: { enabled: true, testDir: 'src/tests/api/unit' },
                integration: { enabled: true, testDir: 'src/tests/api/integration' },
                functional: { enabled: false },
                e2e: { enabled: false },
                regression: { enabled: true },
                smoke: { enabled: true, criticalPaths: ['/health', '/status'] },
                performance: { enabled: true },
                load: { enabled: true, virtualUsers: 50 },
                security: { enabled: true }
            }
        };
    }

    getMobileTemplate() {
        return {
            ...this.defaultConfig,
            target: {
                url: 'https://m.your-website.com',
                name: 'Mobile Website',
                description: 'Configuration for mobile website testing'
            },
            browser: {
                ...this.defaultConfig.browser,
                viewport: {
                    width: 375,
                    height: 667
                },
                options: {
                    ...this.defaultConfig.browser.options,
                    deviceScaleFactor: 2,
                    isMobile: true,
                    hasTouch: true
                }
            }
        };
    }
}

module.exports = ConfigLoader; 