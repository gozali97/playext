const { chromium } = require('playwright');

/**
 * Performance Test Runner
 * Menguji kinerja aplikasi (kecepatan, stabilitas, scalability)
 */
class PerformanceTestRunner {
    constructor(logger) {
        this.logger = logger;
        this.type = 'performance';
        this.browser = null;
        this.context = null;
    }

    async run(config) {
        const startTime = Date.now();
        this.logger.info('⚡ Starting Performance Tests...');

        try {
            const perfConfig = config.testTypes?.performance || {};
            
            if (!perfConfig.enabled) {
                return {
                    success: true,
                    summary: { totalTests: 0, passed: 0, failed: 0, skipped: 1 },
                    tests: [],
                    metrics: {},
                    message: 'Performance tests disabled in configuration'
                };
            }

            // Initialize browser with performance monitoring
            await this.initializeBrowser(config);
            
            // Run performance tests
            const results = await this.runPerformanceTests(config, perfConfig);
            
            // Cleanup
            await this.cleanup();
            
            const endTime = Date.now();
            const duration = endTime - startTime;

            this.logger.info(`✅ Performance Tests completed in ${duration}ms`);

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
                    performanceMetrics: results.performanceMetrics
                },
                errors: results.errors
            };

        } catch (error) {
            await this.cleanup();
            this.logger.error('Performance Test Error:', error);
            return {
                success: false,
                summary: { totalTests: 0, passed: 0, failed: 1, skipped: 0 },
                tests: [],
                metrics: {},
                errors: [error.message]
            };
        }
    }

    async initializeBrowser(config) {
        this.browser = await chromium.launch({
            headless: config.browser?.headless !== false,
            args: ['--no-sandbox', '--disable-web-security']
        });

        this.context = await this.browser.newContext({
            viewport: config.browser?.viewport || { width: 1920, height: 1080 },
            userAgent: 'Universal Test Automation Framework - Performance Tests',
            ...(config.auth?.basicAuth?.enabled && {
                httpCredentials: {
                    username: config.auth.basicAuth.username,
                    password: config.auth.basicAuth.password
                }
            })
        });
    }

    async runPerformanceTests(config, perfConfig) {
        const results = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            tests: [],
            errors: [],
            performanceMetrics: {}
        };

        const baseUrl = config.target?.url || 'https://example.com';
        const metrics = perfConfig.metrics || ['loadTime', 'domContentLoaded', 'firstPaint'];
        const thresholds = perfConfig.thresholds || {};

        // Performance tests to run
        const performanceTests = [
            {
                name: 'Page Load Performance',
                fn: () => this.testPageLoadPerformance(baseUrl, config, metrics, thresholds)
            },
            {
                name: 'Resource Loading Performance',
                fn: () => this.testResourceLoadingPerformance(baseUrl, config)
            },
            {
                name: 'JavaScript Performance',
                fn: () => this.testJavaScriptPerformance(baseUrl, config)
            },
            {
                name: 'Network Performance',
                fn: () => this.testNetworkPerformance(baseUrl, config)
            }
        ];

        // Run each performance test
        for (const test of performanceTests) {
            const testResult = await this.runSinglePerformanceTest(test, perfConfig);
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

            // Aggregate performance metrics
            if (testResult.metrics) {
                Object.assign(results.performanceMetrics, testResult.metrics);
            }
        }

        return results;
    }

    async runSinglePerformanceTest(test, config) {
        const startTime = Date.now();
        
        try {
            const result = await test.fn();
            const endTime = Date.now();
            
            return {
                name: test.name,
                status: 'PASSED',
                duration: endTime - startTime,
                metrics: result,
                error: null
            };

        } catch (error) {
            const endTime = Date.now();
            
            return {
                name: test.name,
                status: 'FAILED',
                duration: endTime - startTime,
                metrics: {},
                error: error.message
            };
        }
    }

    async testPageLoadPerformance(url, config, metrics, thresholds) {
        const page = await this.context.newPage();
        
        try {
            this.logger.info(`📊 Testing page load performance: ${url}`);
            
            // Start performance measurement
            const startTime = Date.now();
            
            // Navigate to page
            await page.goto(url, { waitUntil: 'networkidle' });
            
            // Get performance metrics
            const performanceMetrics = await page.evaluate(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const paintEntries = performance.getEntriesByType('paint');
                
                return {
                    loadTime: perfData.loadEventEnd - perfData.navigationStart,
                    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
                    firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
                    firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
                    ttfb: perfData.responseStart - perfData.navigationStart,
                    domComplete: perfData.domComplete - perfData.navigationStart
                };
            });

            // Check against thresholds
            const failures = [];
            for (const [metric, value] of Object.entries(performanceMetrics)) {
                if (thresholds[metric] && value > thresholds[metric]) {
                    failures.push(`${metric}: ${value}ms > ${thresholds[metric]}ms`);
                }
            }

            if (failures.length > 0) {
                throw new Error(`Performance thresholds exceeded: ${failures.join(', ')}`);
            }

            this.logger.info(`✅ Page load performance test passed`);
            return performanceMetrics;

        } finally {
            await page.close();
        }
    }

    async testResourceLoadingPerformance(url, config) {
        const page = await this.context.newPage();
        
        try {
            this.logger.info(`📦 Testing resource loading performance: ${url}`);
            
            const resourceMetrics = [];
            
            // Monitor resource loading
            page.on('response', response => {
                resourceMetrics.push({
                    url: response.url(),
                    status: response.status(),
                    size: response.headers()['content-length'] || 0,
                    type: response.request().resourceType(),
                    timing: null // timing() method not available in this context
                });
            });
            
            await page.goto(url, { waitUntil: 'networkidle' });
            
            // Analyze resources
            const analysis = {
                totalResources: resourceMetrics.length,
                totalSize: resourceMetrics.reduce((sum, r) => sum + parseInt(r.size || 0), 0),
                slowResources: [], // Cannot determine without timing data
                failedResources: resourceMetrics.filter(r => r.status >= 400),
                resourceTypes: {}
            };

            // Group by resource type
            resourceMetrics.forEach(resource => {
                const type = resource.type;
                if (!analysis.resourceTypes[type]) {
                    analysis.resourceTypes[type] = { count: 0, totalSize: 0 };
                }
                analysis.resourceTypes[type].count++;
                analysis.resourceTypes[type].totalSize += parseInt(resource.size || 0);
            });

            this.logger.info(`✅ Resource loading performance test completed`);
            return analysis;

        } finally {
            await page.close();
        }
    }

    async testJavaScriptPerformance(url, config) {
        const page = await this.context.newPage();
        
        try {
            this.logger.info(`🔧 Testing JavaScript performance: ${url}`);
            
            await page.goto(url, { waitUntil: 'networkidle' });
            
            // Measure JavaScript performance
            const jsMetrics = await page.evaluate(() => {
                const startTime = Date.now();
                
                // Run some JavaScript operations
                let result = 0;
                for (let i = 0; i < 100000; i++) {
                    result += Math.random();
                }
                
                const endTime = Date.now();
                
                return {
                    executionTime: endTime - startTime,
                    memoryUsage: performance.memory ? {
                        used: performance.memory.usedJSHeapSize,
                        total: performance.memory.totalJSHeapSize,
                        limit: performance.memory.jsHeapSizeLimit
                    } : null,
                    result
                };
            });

            this.logger.info(`✅ JavaScript performance test completed`);
            return jsMetrics;

        } finally {
            await page.close();
        }
    }

    async testNetworkPerformance(url, config) {
        const page = await this.context.newPage();
        
        try {
            this.logger.info(`🌐 Testing network performance: ${url}`);
            
            const networkMetrics = [];
            
            // Monitor network requests
            page.on('request', request => {
                networkMetrics.push({
                    type: 'request',
                    url: request.url(),
                    method: request.method(),
                    timestamp: Date.now()
                });
            });
            
            page.on('response', response => {
                networkMetrics.push({
                    type: 'response',
                    url: response.url(),
                    status: response.status(),
                    size: response.headers()['content-length'] || 0,
                    timestamp: Date.now()
                });
            });
            
            await page.goto(url, { waitUntil: 'networkidle' });
            
            // Analyze network performance
            const requests = networkMetrics.filter(m => m.type === 'request');
            const responses = networkMetrics.filter(m => m.type === 'response');
            
            const analysis = {
                totalRequests: requests.length,
                totalResponses: responses.length,
                averageResponseTime: 0,
                successfulRequests: responses.filter(r => r.status < 400).length,
                failedRequests: responses.filter(r => r.status >= 400).length
            };

            this.logger.info(`✅ Network performance test completed`);
            return analysis;

        } finally {
            await page.close();
        }
    }

    async cleanup() {
        try {
            if (this.context) {
                await this.context.close();
                this.context = null;
            }
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
            }
        } catch (error) {
            this.logger.warn('Performance cleanup error:', error);
        }
    }
}

module.exports = PerformanceTestRunner; 