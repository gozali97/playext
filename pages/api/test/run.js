import TestRunner from '../../../src/core/TestRunner';
import ConfigLoader from '../../../src/config/configLoader';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Declare variables in function scope for error handling
    let testTypes = [];
    let selectedScenarios = null;
    let runOnlySelected = false;
    let config = null;

    try {
        // Extract request body
        const requestBody = req.body || {};
        testTypes = requestBody.testTypes || [];
        selectedScenarios = requestBody.selectedScenarios || null;
        runOnlySelected = requestBody.runOnlySelected || false;
        
        // Load configuration
        const configLoader = new ConfigLoader();
        config = await configLoader.load();
        
        // Override E2E scenario selection if provided
        if (selectedScenarios && Array.isArray(selectedScenarios)) {
            config.testTypes.e2e.selectedScenarios = selectedScenarios;
            config.testTypes.e2e.runOnlySelected = runOnlySelected;
        }
        
        // Initialize test runner
        const testRunner = new TestRunner();
        
        // Run tests
        const results = await testRunner.runTests(config, testTypes);
        
        // Return results
        res.status(200).json({
            success: true,
            results,
            timestamp: new Date().toISOString(),
            scenarioSelection: {
                selectedScenarios: config.testTypes.e2e.selectedScenarios,
                runOnlySelected: config.testTypes.e2e.runOnlySelected
            }
        });
        
    } catch (error) {
        console.error('Test execution error:', error);
        console.error('Error stack:', error.stack);
        
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            details: {
                testTypes,
                selectedScenarios,
                runOnlySelected,
                configLoaded: !!config
            }
        });
    }
} 