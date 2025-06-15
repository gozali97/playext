import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';

// Import TestRunner secara langsung untuk production
let TestRunner;
try {
    TestRunner = require('../../../src/core/TestRunner');
} catch (error) {
    console.error('Failed to import TestRunner:', error);
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { config, testTypes, options = {} } = req.body;

    // Set SSE headers untuk streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    const sendEvent = (type, data) => {
        res.write(`event: ${type}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
        sendEvent('start', { message: 'Starting test execution...' });

        // Validasi konfigurasi
        if (!config || !config.target || !config.target.url) {
            throw new Error('Invalid configuration: target URL is required');
        }

        // Tentukan test types
        const enabledTestTypes = testTypes && testTypes.length > 0 
            ? testTypes 
            : ['smoke']; // Default ke smoke test

        sendEvent('info', { 
            message: `Executing test types: ${enabledTestTypes.join(', ')}`,
            testTypes: enabledTestTypes 
        });

        // Jika TestRunner tersedia, gunakan secara langsung (untuk production)
        if (TestRunner && !process.env.USE_SPAWN) {
            try {
                const testRunner = new TestRunner();
                
                // Setup options untuk TestRunner
                const runOptions = {
                    type: enabledTestTypes.join(','),
                    config: null, // Konfigurasi akan dipass langsung
                    html: true,
                    verbose: options.verbose || false,
                    headless: options.headless !== false // Default headless di production
                };

                // Override konfigurasi dengan data dari request
                const configOverride = {
                    ...config,
                    browser: {
                        ...config.browser,
                        headless: runOptions.headless,
                        slowMo: options.slowMo || 0
                    }
                };

                // Simpan konfigurasi sementara
                const tempConfigPath = path.join(process.cwd(), 'temp-config.json');
                await fs.writeJson(tempConfigPath, configOverride);
                runOptions.config = tempConfigPath;

                sendEvent('progress', { 
                    message: 'Configuration loaded, starting tests...',
                    progress: 10 
                });

                // Jalankan test
                const results = await testRunner.run(runOptions);

                // Bersihkan file konfigurasi sementara
                await fs.remove(tempConfigPath).catch(() => {});

                sendEvent('progress', { 
                    message: 'Tests completed, generating report...',
                    progress: 90 
                });

                sendEvent('complete', {
                    message: 'Test execution completed successfully',
                    results: {
                        summary: results.summary,
                        duration: results.framework.duration,
                        testTypes: Object.keys(results.testTypes),
                        reportPath: results.reportPath || null
                    }
                });

            } catch (testError) {
                console.error('Direct TestRunner execution failed:', testError);
                sendEvent('error', { 
                    message: 'Test execution failed: ' + testError.message,
                    error: testError.message 
                });
            }
        } else {
            // Fallback ke spawn process jika TestRunner tidak tersedia
            sendEvent('info', { message: 'Using fallback spawn execution method' });

            // Simpan konfigurasi ke file sementara
            const tempConfigPath = path.join(process.cwd(), `temp-config-${Date.now()}.json`);
            await fs.writeJson(tempConfigPath, config);

            // Siapkan command
            const scriptPath = path.join(process.cwd(), 'scripts', 'test-local.js');
            const nodeArgs = [scriptPath];

            const testProcess = spawn('node', nodeArgs, {
                cwd: process.cwd(),
                env: {
                    ...process.env,
                    NODE_ENV: 'production',
                    TEST_CONFIG: tempConfigPath,
                    TEST_TYPES: enabledTestTypes.join(','),
                    HEADLESS: options.headless !== false ? 'true' : 'false'
                }
            });

            let outputBuffer = '';
            let errorBuffer = '';

            testProcess.stdout.on('data', (data) => {
                const output = data.toString();
                outputBuffer += output;
                
                // Parse output dan kirim sebagai events
                const lines = output.split('\n').filter(line => line.trim());
                lines.forEach(line => {
                    if (line.includes('✅') || line.includes('✔')) {
                        sendEvent('success', { message: line.trim() });
                    } else if (line.includes('❌') || line.includes('✗')) {
                        sendEvent('error', { message: line.trim() });
                    } else if (line.includes('🚀') || line.includes('🔍') || line.includes('🔐')) {
                        sendEvent('info', { message: line.trim() });
                    } else if (line.trim()) {
                        sendEvent('output', { message: line.trim() });
                    }
                });
            });

            testProcess.stderr.on('data', (data) => {
                const error = data.toString();
                errorBuffer += error;
                sendEvent('error', { message: error.trim() });
            });

            testProcess.on('close', async (code) => {
                // Bersihkan file konfigurasi sementara
                await fs.remove(tempConfigPath).catch(() => {});

                if (code === 0) {
                    sendEvent('complete', {
                        message: 'Test execution completed successfully',
                        results: {
                            exitCode: code,
                            output: outputBuffer,
                            testTypes: enabledTestTypes
                        }
                    });
                } else {
                    sendEvent('error', {
                        message: `Test execution failed with exit code ${code}`,
                        error: errorBuffer,
                        exitCode: code
                    });
                }
                
                res.end();
            });

            testProcess.on('error', async (error) => {
                await fs.remove(tempConfigPath).catch(() => {});
                sendEvent('error', { 
                    message: 'Failed to start test process: ' + error.message,
                    error: error.message 
                });
                res.end();
            });
        }

    } catch (error) {
        console.error('API Handler Error:', error);
        sendEvent('error', { 
            message: 'Internal server error: ' + error.message,
            error: error.message 
        });
        res.end();
    }
} 