import path from 'path'
import fs from 'fs-extra'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { testType, config, options = {} } = req.body

    if (!testType) {
      return res.status(400).json({ message: 'Test type is required' })
    }

    // Set up response for streaming
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    })

    // Send initial message
    res.write(`data: ${JSON.stringify({ type: 'start', message: 'Memulai eksekusi test...' })}\n\n`)

    // Import TestRunner dynamically
    const TestRunner = require(path.join(process.cwd(), 'src', 'core', 'TestRunner.js'))
    const testRunner = new TestRunner()

    // Prepare test options
    const testOptions = {
      type: testType,
      config: config ? 'custom' : null,
      html: options.html || false,
      verbose: options.verbose || false,
      headless: options.headless
    }

    // Create temporary config if custom config provided
    let configPath = null
    if (config) {
      configPath = path.join(process.cwd(), 'config', `temp-${Date.now()}.json`)
      await fs.writeJson(configPath, config, { spaces: 2 })
      testOptions.config = configPath
    }

    res.write(`data: ${JSON.stringify({ type: 'stdout', message: `Menjalankan test: ${testType}` })}\n\n`)

    // Run tests
    const results = await testRunner.run(testOptions)

    // Clean up temporary config
    if (configPath && await fs.pathExists(configPath)) {
      await fs.remove(configPath)
    }

    // Send completion message
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      code: 0,
      success: true,
      report: results,
      message: 'Test execution completed successfully'
    })}\n\n`)

    res.end()

  } catch (error) {
    console.error('Test execution API error:', error)
    
    // Send error message
    res.write(`data: ${JSON.stringify({
      type: 'error',
      message: `Test execution failed: ${error.message}`
    })}\n\n`)

    res.write(`data: ${JSON.stringify({
      type: 'complete',
      code: 1,
      success: false,
      message: 'Test execution completed with errors'
    })}\n\n`)

    res.end()
  }
} 