const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs-extra');
const path = require('path');

/**
 * Enhanced End-to-End Test Runner
 * Mendukung scenario testing yang dinamis dan dapat dikonfigurasi
 */
class E2ETestRunner {
    constructor(logger) {
        this.logger = logger;
        this.type = 'e2e';
        this.browser = null;
        this.context = null;
        this.variables = {};
        this.playwright = { chromium, firefox, webkit };
    }

    async run(config) {
        this.logger.info('🌐 Starting Enhanced E2E Tests...');
        
        const e2eConfig = config.testTypes?.e2e || {};
        if (!e2eConfig.enabled) {
            return {
                success: true,
                summary: { totalTests: 0, passed: 0, failed: 0, skipped: 1 },
                tests: [],
                metrics: {},
                message: 'E2E tests disabled in configuration'
            };
        }

        try {
            // Initialize browser
            await this.setupBrowser(config);
            
            // Initialize variables for template substitution
            this.initializeVariables(config);
            
            // Run E2E scenarios
            const results = await this.runE2EScenarios(config, e2eConfig);
            
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
                    duration: results.duration || 0,
                    scenarios: results.scenarios || 0
                },
                errors: results.errors || []
            };
            
        } catch (error) {
            this.logger.error('E2E Test Runner Error:', error);
        return {
                success: false,
                summary: { totalTests: 0, passed: 0, failed: 1, skipped: 0 },
                tests: [],
                metrics: {},
                errors: [error.message]
            };
        } finally {
            await this.cleanup();
        }
    }

    async setupBrowser(config) {
        const browserConfig = config.browser || {};
        
        this.browser = await this.playwright[browserConfig.type || 'chromium'].launch({
            headless: browserConfig.headless !== false,
            slowMo: browserConfig.slowMo || 0,
            timeout: browserConfig.timeout || 30000,
            args: browserConfig.options?.args || []
        });

        // Extract HTTP Basic Auth credentials from E2E scenarios
        const httpCredentials = this.extractHttpBasicAuthCredentials(config);
        
        this.context = await this.browser.newContext({
            viewport: browserConfig.viewport || { width: 1920, height: 1080 },
            ignoreHTTPSErrors: true,
            // Add HTTP authentication if basic auth is enabled but not form-based
            ...(config.auth?.basicAuth?.enabled && !config.auth.basicAuth.formBased && {
                httpCredentials: {
                    username: config.auth.basicAuth.username,
                    password: config.auth.basicAuth.password
                }
            }),
            // Add HTTP credentials from step-level basic auth
            ...(httpCredentials && { httpCredentials })
        });

        this.page = await this.context.newPage();
        
        // Enable tracing if configured
        if (config.testTypes?.e2e?.globalSettings?.tracing) {
        await this.context.tracing.start({ screenshots: true, snapshots: true });
        }
    }

    extractHttpBasicAuthCredentials(config) {
        // Look for HTTP Basic Auth credentials in E2E scenarios
        const scenarios = config.testTypes?.e2e?.scenarios || [];
        
        for (const scenario of scenarios) {
            for (const step of scenario.steps || []) {
                if (step.type === 'navigate' && step.basicAuth?.enabled) {
                    this.logger.info(`🔐 Found HTTP Basic Auth credentials in scenario: ${scenario.name}`);
                    return {
                        username: step.basicAuth.username,
                        password: step.basicAuth.password
                    };
                }
            }
        }
        
        return null;
    }

    initializeVariables(config) {
        this.variables = {
            auth: config.auth || {},
            target: config.target || {},
            custom: config.variables?.custom || {},
            browser: config.browser || {}
        };
    }

    async runE2EScenarios(config, e2eConfig) {
        const startTime = Date.now();
        const results = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            tests: [],
            errors: [],
            scenarios: 0,
            duration: 0
        };

        // Get scenarios from config
        const allScenarios = e2eConfig.scenarios || [];
        
        if (allScenarios.length === 0) {
            this.logger.warn('No E2E scenarios found in configuration');
            return results;
        }

        // Determine which scenarios to run
        let scenariosToRun = [];
        
        if (e2eConfig.runOnlySelected && e2eConfig.selectedScenarios && e2eConfig.selectedScenarios.length > 0) {
            // Run only selected scenarios
            scenariosToRun = allScenarios.filter(scenario => 
                e2eConfig.selectedScenarios.includes(scenario.id)
            );
            this.logger.info(`🎯 Running selected scenarios: ${e2eConfig.selectedScenarios.join(', ')}`);
        } else {
            // Check if we should run only main scenario
            const mainScenarios = allScenarios.filter(scenario => scenario.isMainScenario);
            
            if (mainScenarios.length > 0) {
                scenariosToRun = mainScenarios;
                this.logger.info(`🌟 Running main scenarios: ${mainScenarios.map(s => s.name).join(', ')}`);
            } else {
                // Run all enabled scenarios
                scenariosToRun = allScenarios.filter(scenario => scenario.enabled);
                this.logger.info(`🚀 Running all enabled scenarios`);
            }
        }
        
        if (scenariosToRun.length === 0) {
            this.logger.warn('No scenarios to run based on current selection criteria');
            return results;
        }

        results.scenarios = scenariosToRun.length;
        this.logger.info(`Found ${scenariosToRun.length} scenarios to run`);

        // Run each scenario
        for (const scenario of scenariosToRun) {
            if (!scenario.enabled) {
                this.logger.info(`⏭️  Skipping disabled scenario: ${scenario.name}`);
                results.skipped++;
                continue;
            }

            const scenarioResult = await this.runScenario(scenario, config);
            
            // Merge results
            results.tests.push(...scenarioResult.tests);
            results.total += scenarioResult.total;
            results.passed += scenarioResult.passed;
            results.failed += scenarioResult.failed;
            results.skipped += scenarioResult.skipped;
            results.errors.push(...scenarioResult.errors);

            // Stop on critical failure
            if (scenarioResult.failed > 0 && scenario.critical) {
                this.logger.error(`❌ Critical scenario failed: ${scenario.name}`);
                break;
            }
        }

        results.duration = Date.now() - startTime;
        return results;
    }

    async runScenario(scenario, config) {
        const results = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            tests: [],
            errors: []
        };

        this.logger.info(`🎬 Running E2E Scenario: ${scenario.name}`);
        
        // Store config for use in step execution
        this.config = config;
        
        const page = await this.context.newPage();
        
        try {
            // Run scenario steps
            const steps = scenario.steps || [];
            for (let i = 0; i < steps.length; i++) {
                const step = steps[i];
                const stepResult = await this.runScenarioStep(step, page, config, scenario, i + 1);
                
                results.tests.push({
                    scenario: scenario.name,
                    scenarioId: scenario.id,
                    step: i + 1,
                    stepId: step.id,
                    ...stepResult
                });
                
                results.total++;
                
                if (stepResult.status === 'PASSED') {
                    results.passed++;
                } else if (stepResult.status === 'FAILED') {
                    results.failed++;
                    results.errors.push(`${scenario.name} Step ${i + 1} (${step.id}): ${stepResult.error}`);
                    
                    // Take screenshot on failure
                    await this.takeScreenshotOnFailure(page, scenario, step, i + 1, config);
                    
                    // Stop scenario on critical failure
                    if (step.critical !== false) {
                        this.logger.error(`💥 Critical step failed, stopping scenario: ${step.name}`);
                        break;
                    }
                } else {
                    results.skipped++;
                }
            }

        } catch (error) {
            results.failed++;
            results.errors.push(`Scenario ${scenario.name}: ${error.message}`);
            this.logger.error(`Scenario execution error: ${error.message}`);
        } finally {
            await page.close();
        }

        return results;
    }

    async runScenarioStep(step, page, config, scenario, stepNumber) {
        const startTime = Date.now();
        
        try {
            this.logger.info(`  📋 Step ${stepNumber}: ${step.name} (${step.type})`);
            
            // Substitute variables in step configuration
            const processedStep = this.substituteVariables(step);
            
            // Execute step based on type
            let result;
            switch (processedStep.type) {
                case 'navigate':
                    result = await this.executeNavigateStep(processedStep, page);
                    break;
                case 'click':
                    result = await this.executeClickStep(processedStep, page);
                    break;
                case 'fill':
                    result = await this.executeFillStep(processedStep, page);
                    break;
                case 'fill_form':
                    result = await this.executeFillFormStep(processedStep, page);
                    break;
                case 'verify':
                    result = await this.executeVerifyStep(processedStep, page);
                    break;
                case 'wait':
                    result = await this.executeWaitStep(processedStep, page);
                    break;
                case 'execute_scenario':
                    result = await this.executeScenarioStep(processedStep, page, config);
                    break;
                case 'custom':
                    result = await this.executeCustomStep(processedStep, page);
                    break;
                default:
                    throw new Error(`Unknown step type: ${processedStep.type}`);
            }
            
            // Run assertions if present
            if (processedStep.assertions && processedStep.assertions.length > 0) {
                await this.runAssertions(processedStep.assertions, page);
            }
            
            const duration = Date.now() - startTime;
            
            return {
                name: processedStep.name,
                type: processedStep.type,
                status: 'PASSED',
                duration,
                details: result
            };

        } catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(`  ❌ Step ${stepNumber} failed: ${error.message}`);
            
            return {
                name: step.name,
                type: step.type,
                status: 'FAILED',
                duration,
                error: error.message
            };
        }
    }

    async executeNavigateStep(step, page) {
        const { url, waitFor = 'networkidle', timeout = 10000, basicAuth } = step;
        
        // Handle basic authentication if configured in step
        if (basicAuth?.enabled) {
            await this.handleStepBasicAuth(url, basicAuth, page);
            // After basic auth, we're already on the target page or redirected
            // Just verify we're on the right page
            const currentUrl = page.url();
            this.logger.info(`🔐 After basic auth, current URL: ${currentUrl}`);
        } else {
            // Normal navigation without basic auth
            await page.goto(url, { 
                waitUntil: waitFor,
                timeout 
            });
        }
        
        return { url: page.url() };
    }

    async executeClickStep(step, page) {
        const { selector, waitFor, timeout = 5000, forceClick = false, waitForVisible = true } = step;
        
        // Wait for element based on waitForVisible setting
        if (waitForVisible) {
            await page.waitForSelector(selector, { timeout });
        } else {
            // Just wait for element to exist in DOM (might be hidden)
            await page.waitForSelector(selector, { timeout, state: 'attached' });
        }
        
        // Click function based on forceClick setting
        const clickElement = async () => {
            if (forceClick) {
                // Force click even if element is hidden or not clickable
                await page.evaluate((sel) => {
                    const element = document.querySelector(sel);
                    if (element) {
                        element.click();
                    } else {
                        throw new Error(`Element not found: ${sel}`);
                    }
                }, selector);
            } else {
                await page.click(selector);
            }
        };
        
        if (waitFor === 'navigation') {
            await Promise.all([
                page.waitForNavigation({ timeout }),
                clickElement()
            ]);
        } else if (waitFor === 'response') {
            await Promise.all([
                page.waitForResponse(response => response.status() < 400, { timeout }),
                clickElement()
            ]);
        } else {
            await clickElement();
        }
        
        return { clicked: selector };
    }

    async executeFillStep(step, page) {
        const { selector, value, clearFirst = true, timeout = 5000 } = step;
        
        await page.waitForSelector(selector, { timeout });
        
        if (clearFirst) {
            await page.fill(selector, '');
        }
        
        await page.fill(selector, value);
        
        // Verify value was set (unless it's a password field)
        if (!step.sensitive) {
            const actualValue = await page.inputValue(selector);
            if (actualValue !== value) {
                throw new Error(`Failed to fill field. Expected: ${value}, Actual: ${actualValue}`);
            }
        }
        
        return { filled: selector, value: step.sensitive ? '[HIDDEN]' : value };
    }

    async executeFillFormStep(step, page) {
        const { form } = step;
        const results = [];
        
        // Wait for form to be present
        if (form.selector) {
            await page.waitForSelector(form.selector, { timeout: step.timeout || 10000 });
        }
        
        // Fill each field
        for (const field of form.fields || []) {
            try {
                await page.waitForSelector(field.selector, { timeout: 5000 });
                
                switch (field.type) {
                    case 'text':
                    case 'textarea':
                        await page.fill(field.selector, field.value);
                        break;
                    case 'select':
                        await page.selectOption(field.selector, field.value);
                        break;
                    case 'checkbox':
                        if (field.value) {
                            await page.check(field.selector);
                        } else {
                            await page.uncheck(field.selector);
                        }
                        break;
                    case 'radio':
                        await page.click(field.selector);
                        break;
                }
                
                results.push({ field: field.selector, status: 'filled' });
            } catch (error) {
                results.push({ field: field.selector, status: 'failed', error: error.message });
            }
        }
        
        return { formFilled: form.selector, fields: results };
    }

    async executeVerifyStep(step, page) {
        // Verification step just runs assertions
        return { verified: true };
    }

    async executeWaitStep(step, page) {
        const { waitType, selector, timeout = 5000, condition } = step;
        
        switch (waitType) {
            case 'selector':
                await page.waitForSelector(selector, { timeout });
                break;
            case 'url':
                await page.waitForURL(condition, { timeout });
                break;
            case 'timeout':
                await page.waitForTimeout(timeout);
                break;
            case 'function':
                await page.waitForFunction(condition, {}, { timeout });
                break;
        }
        
        return { waited: waitType };
    }

    async executeScenarioStep(step, page, config) {
        // This would execute specific steps from another scenario
        // For now, just return success
        return { executedScenario: step.scenario };
    }

    async executeCustomStep(step, page) {
        // Custom step execution - can be extended
        return { customStep: step.action };
    }

    async runAssertions(assertions, page) {
        for (const assertion of assertions) {
            try {
                await this.runSingleAssertion(assertion, page);
            } catch (error) {
                if (!assertion.optional) {
                    throw error;
                }
                this.logger.warn(`Optional assertion failed: ${error.message}`);
            }
        }
    }

    async runSingleAssertion(assertion, page) {
        const { type, condition, value, selector } = assertion;
        
        switch (type) {
            case 'url':
                const currentUrl = page.url();
                switch (condition) {
                    case 'contains':
                        if (!currentUrl.includes(value)) {
                            throw new Error(`URL should contain '${value}', but was '${currentUrl}'`);
                        }
                        break;
                    case 'not_contains':
                        if (currentUrl.includes(value)) {
                            throw new Error(`URL should not contain '${value}', but was '${currentUrl}'`);
                        }
                        break;
                    case 'equals':
                        if (currentUrl !== value) {
                            throw new Error(`URL should equal '${value}', but was '${currentUrl}'`);
                        }
                        break;
                }
                break;
                
            case 'element':
                switch (condition) {
                    case 'visible':
                        await page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
                        break;
                    case 'hidden':
                        await page.waitForSelector(selector, { state: 'hidden', timeout: 5000 });
                        break;
                    case 'hasValue':
                        const inputValue = await page.inputValue(selector);
                        if (inputValue !== value) {
                            throw new Error(`Element ${selector} should have value '${value}', but was '${inputValue}'`);
                        }
                        break;
                    case 'hasText':
                        const textContent = await page.textContent(selector);
                        if (!textContent.includes(value)) {
                            throw new Error(`Element ${selector} should contain text '${value}', but was '${textContent}'`);
                        }
                        break;
                }
                break;
                
            case 'title':
                const title = await page.title();
                switch (condition) {
                    case 'equals':
                        if (title !== value) {
                            throw new Error(`Title should equal '${value}', but was '${title}'`);
                        }
                        break;
                    case 'not_equals':
                        if (title === value) {
                            throw new Error(`Title should not equal '${value}'`);
                        }
                        break;
                    case 'contains':
                        if (!title.includes(value)) {
                            throw new Error(`Title should contain '${value}', but was '${title}'`);
                        }
                        break;
                }
                break;
        }
    }

    substituteVariables(step) {
        const stepStr = JSON.stringify(step);
        const substituted = stepStr.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
            const value = this.getVariableValue(path.trim());
            return value !== undefined ? value : match;
        });
        return JSON.parse(substituted);
    }

    getVariableValue(path) {
        const parts = path.split('.');
        let current = this.variables;
        
        for (const part of parts) {
            if (current && typeof current === 'object' && part in current) {
                current = current[part];
            } else {
                return undefined;
            }
        }
        
        return current;
    }

    async takeScreenshotOnFailure(page, scenario, step, stepNumber, config) {
        try {
            const globalSettings = config.testTypes?.e2e?.globalSettings || {};
            if (!globalSettings.screenshotOnFailure) return;
            
            const screenshotDir = path.join('reports', 'screenshots', 'e2e');
            await fs.ensureDir(screenshotDir);
            
            const filename = `${scenario.id}-step-${stepNumber}-${step.id}-failure.png`;
            const screenshotPath = path.join(screenshotDir, filename);
            
            await page.screenshot({ path: screenshotPath, fullPage: true });
            this.logger.info(`📸 Screenshot saved: ${screenshotPath}`);
        } catch (error) {
            this.logger.warn(`Failed to take screenshot: ${error.message}`);
        }
    }

    async cleanup() {
        try {
            if (this.context) {
                // Stop tracing if enabled
                try {
                    await this.context.tracing.stop({ path: 'reports/traces/e2e-trace.zip' });
                } catch (error) {
                    // Tracing might not be enabled
                }
                
                await this.context.close();
            }
            
            if (this.browser) {
                await this.browser.close();
            }
        } catch (error) {
            this.logger.warn('Error during E2E cleanup:', error.message);
        }
    }

    async handleStepBasicAuth(url, basicAuthConfig, page) {
        try {
            this.logger.info('🔐 Handling step-level basic authentication...');
            this.logger.info(`🔐 Target URL: ${url}`);
            this.logger.info(`🔐 Basic auth config: ${JSON.stringify(basicAuthConfig, null, 2)}`);
            
            // Navigate to the target URL (HTTP Basic Auth should be handled by browser context)
            this.logger.info(`🔐 Navigating to target URL with HTTP Basic Auth: ${url}`);
            await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
            
            // Check current URL after HTTP Basic Auth
            const currentUrl = page.url();
            this.logger.info(`🔐 Current URL after HTTP Basic Auth: ${currentUrl}`);
            
            // Check if we're redirected to a form login page (double authentication)
            if (basicAuthConfig.loginPage && currentUrl.includes(basicAuthConfig.loginPage)) {
                this.logger.info('🔐 Detected form-based login after HTTP Basic Auth (double authentication)');
                
                // Wait for login form to be visible
                let formFound = false;
                const selectors = basicAuthConfig.usernameField.split(',').map(s => s.trim());
                
                for (const selector of selectors) {
                    try {
                        await page.waitForSelector(selector, { timeout: 5000 });
                        formFound = true;
                        this.logger.info(`🔐 Found login form with selector: ${selector}`);
                        break;
                    } catch (error) {
                        this.logger.info(`🔐 Selector ${selector} not found, trying next...`);
                    }
                }
                
                if (formFound) {
                    // Use different credentials for form login (from global auth config)
                    const formUsername = this.config?.auth?.username || basicAuthConfig.username;
                    const formPassword = this.config?.auth?.password || basicAuthConfig.password;
                    
                    this.logger.info('🔐 Filling form login after HTTP Basic Auth...');
                    
                    // Fill username
                    const usernameSelector = await this.findWorkingSelector(basicAuthConfig.usernameField, page);
                    if (usernameSelector) {
                        await page.fill(usernameSelector, formUsername);
                        this.logger.info(`🔐 Filled form username: ${formUsername}`);
                    }

                    // Fill password
                    const passwordSelector = await this.findWorkingSelector(basicAuthConfig.passwordField, page);
                    if (passwordSelector) {
                        await page.fill(passwordSelector, formPassword);
                        this.logger.info('🔐 Filled form password');
                    }

                    // Submit form
                    const submitSelector = await this.findWorkingSelector(basicAuthConfig.submitButton, page);
                    if (submitSelector) {
                        this.logger.info('🔐 Submitting form login...');
                        
                        try {
                            // Try with navigation wait first
                            await Promise.all([
                                page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }),
                                page.click(submitSelector)
                            ]);
                        } catch (navigationError) {
                            // If navigation wait fails, just click and wait
                            this.logger.info('🔐 Navigation wait failed, trying simple click...');
                            await page.click(submitSelector);
                            await page.waitForTimeout(3000);
                        }
                        
                        this.logger.info('🔐 Form login submitted successfully');
                    }
                }
            } else {
                this.logger.info('🔐 No form login required, HTTP Basic Auth was sufficient');
            }

            // Verify authentication success
            await page.waitForTimeout(2000);
            const finalUrl = page.url();
            this.logger.info(`🔐 Final URL after complete authentication: ${finalUrl}`);
            
            // Check if we're still on login/auth page (indicating failure)
            if (basicAuthConfig.loginPage && finalUrl.includes(basicAuthConfig.loginPage)) {
                throw new Error(`Authentication failed - still on login page: ${finalUrl}`);
            }

            this.logger.info('✅ Complete authentication (HTTP Basic Auth + Form Login) completed successfully');
            return true;

        } catch (error) {
            this.logger.error(`❌ Authentication failed: ${error.message}`);
            this.logger.error(`❌ Auth error stack: ${error.stack}`);
            this.logger.error(`❌ Auth config: ${JSON.stringify(basicAuthConfig, null, 2)}`);
            this.logger.error(`❌ Target URL: ${url}`);
            throw error;
        }
    }

    async findWorkingSelector(selectorString, page) {
        const selectors = selectorString.split(',').map(s => s.trim());
        
        for (const selector of selectors) {
            try {
                await page.waitForSelector(selector, { timeout: 2000 });
                return selector;
            } catch (error) {
                // Continue to next selector
            }
        }
        
        throw new Error(`None of the selectors found: ${selectorString}`);
    }
}

module.exports = E2ETestRunner; 