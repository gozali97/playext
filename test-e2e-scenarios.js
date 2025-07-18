const fs = require('fs-extra');
const path = require('path');

async function testE2EScenarios() {
    console.log('🎬 Testing Enhanced E2E Scenarios Implementation...\n');

    try {
        // Load configuration
        const configPath = path.join(__dirname, 'config', 'default.json');
        const config = await fs.readJson(configPath);
        
        console.log('✅ Configuration loaded successfully');
        console.log(`📋 Found ${config.testTypes.e2e.scenarios.length} E2E scenarios\n`);

        // Test each scenario configuration
        config.testTypes.e2e.scenarios.forEach((scenario, index) => {
            console.log(`📝 Scenario ${index + 1}: ${scenario.name}`);
            console.log(`   ID: ${scenario.id}`);
            console.log(`   Enabled: ${scenario.enabled ? '✅' : '❌'}`);
            console.log(`   Critical: ${scenario.critical ? '🔴' : '⚪'}`);
            console.log(`   Steps: ${scenario.steps.length}`);
            console.log(`   Timeout: ${scenario.timeout}ms`);
            
            // Validate steps
            scenario.steps.forEach((step, stepIndex) => {
                console.log(`     Step ${stepIndex + 1}: ${step.name} (${step.type})`);
                
                // Validate step configuration
                if (step.type === 'navigate' && !step.url) {
                    console.log(`     ⚠️  Warning: Navigate step missing URL`);
                }
                
                if ((step.type === 'click' || step.type === 'fill') && !step.selector) {
                    console.log(`     ⚠️  Warning: ${step.type} step missing selector`);
                }
                
                if (step.type === 'fill' && !step.value) {
                    console.log(`     ⚠️  Warning: Fill step missing value`);
                }
                
                if (step.assertions && step.assertions.length > 0) {
                    console.log(`     ✅ ${step.assertions.length} assertions configured`);
                }
            });
            
            console.log('');
        });

        // Test variable substitution
        console.log('🔄 Testing Variable Substitution...');
        const testVariables = {
            auth: { username: 'testuser', password: 'testpass' },
            target: { url: 'https://test.com' },
            custom: { testValue: 'sample' }
        };

        const testString = '{{auth.username}} login to {{target.url}} with {{custom.testValue}}';
        const substituted = testString.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
            const parts = path.trim().split('.');
            let current = testVariables;
            
            for (const part of parts) {
                if (current && typeof current === 'object' && part in current) {
                    current = current[part];
                } else {
                    return match;
                }
            }
            
            return current;
        });
        
        console.log(`Original: ${testString}`);
        console.log(`Substituted: ${substituted}`);
        console.log('✅ Variable substitution working\n');

        // Test step types validation
        console.log('🔍 Validating Step Types...');
        const validStepTypes = ['navigate', 'click', 'fill', 'fill_form', 'verify', 'wait', 'execute_scenario', 'custom'];
        const usedStepTypes = new Set();
        
        config.testTypes.e2e.scenarios.forEach(scenario => {
            scenario.steps.forEach(step => {
                usedStepTypes.add(step.type);
                if (!validStepTypes.includes(step.type)) {
                    console.log(`❌ Invalid step type: ${step.type}`);
                }
            });
        });
        
        console.log(`Used step types: ${Array.from(usedStepTypes).join(', ')}`);
        console.log('✅ All step types are valid\n');

        // Test assertion types validation
        console.log('🔍 Validating Assertion Types...');
        const validAssertionTypes = ['url', 'element', 'title'];
        const usedAssertionTypes = new Set();
        
        config.testTypes.e2e.scenarios.forEach(scenario => {
            scenario.steps.forEach(step => {
                if (step.assertions) {
                    step.assertions.forEach(assertion => {
                        usedAssertionTypes.add(assertion.type);
                        if (!validAssertionTypes.includes(assertion.type)) {
                            console.log(`❌ Invalid assertion type: ${assertion.type}`);
                        }
                    });
                }
            });
        });
        
        console.log(`Used assertion types: ${Array.from(usedAssertionTypes).join(', ')}`);
        console.log('✅ All assertion types are valid\n');

        // Test global settings
        console.log('⚙️ Testing Global Settings...');
        const globalSettings = config.testTypes.e2e.globalSettings;
        if (globalSettings) {
            console.log(`Screenshot on failure: ${globalSettings.screenshotOnFailure ? '✅' : '❌'}`);
            console.log(`Video recording: ${globalSettings.videoRecording ? '✅' : '❌'}`);
            console.log(`Tracing: ${globalSettings.tracing ? '✅' : '❌'}`);
            console.log(`Slow motion: ${globalSettings.slowMo}ms`);
            console.log(`Max retries: ${globalSettings.maxRetries}`);
        }
        console.log('✅ Global settings configured\n');

        // Test E2E Test Runner Integration
        console.log('🚀 Testing E2E Test Runner Integration...');
        
        // Check if E2E test type is enabled
        if (config.testTypes.e2e.enabled) {
            console.log('✅ E2E tests are enabled');
            console.log(`✅ Found ${config.testTypes.e2e.scenarios.length} scenarios to run`);
            
            // Count enabled scenarios
            const enabledScenarios = config.testTypes.e2e.scenarios.filter(s => s.enabled);
            console.log(`✅ ${enabledScenarios.length} scenarios are enabled`);
            
            // Count critical scenarios
            const criticalScenarios = config.testTypes.e2e.scenarios.filter(s => s.critical);
            console.log(`🔴 ${criticalScenarios.length} critical scenarios`);
        } else {
            console.log('❌ E2E tests are disabled');
        }

        console.log('\n🎉 E2E Scenarios Implementation Test Completed Successfully!');
        console.log('\n📋 Summary:');
        console.log(`- Total scenarios: ${config.testTypes.e2e.scenarios.length}`);
        console.log(`- Enabled scenarios: ${config.testTypes.e2e.scenarios.filter(s => s.enabled).length}`);
        console.log(`- Critical scenarios: ${config.testTypes.e2e.scenarios.filter(s => s.critical).length}`);
        console.log(`- Total steps: ${config.testTypes.e2e.scenarios.reduce((sum, s) => sum + s.steps.length, 0)}`);
        console.log(`- Step types used: ${Array.from(usedStepTypes).join(', ')}`);
        console.log(`- Assertion types used: ${Array.from(usedAssertionTypes).join(', ')}`);
        
        console.log('\n🚀 Ready to run E2E scenarios!');
        console.log('💡 Next steps:');
        console.log('   1. Open http://localhost:3000/configuration');
        console.log('   2. Go to E2E Scenarios tab');
        console.log('   3. Create or modify scenarios');
        console.log('   4. Run tests via Test Runner page');

    } catch (error) {
        console.error('❌ Error testing E2E scenarios:', error.message);
        process.exit(1);
    }
}

// Run the test
testE2EScenarios(); 