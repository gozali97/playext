import { spawn } from 'child_process'
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

    // Create temporary config if custom config provided
    let configPath = path.join(process.cwd(), 'config', 'default.json')
    if (config) {
      const tempConfigPath = path.join(process.cwd(), 'config', `temp-${Date.now()}.json`)
      await fs.writeJson(tempConfigPath, config, { spaces: 2 })
      configPath = tempConfigPath
    }

    // Build command arguments
    const args = [
      path.join(process.cwd(), 'src', 'core', 'TestRunner.js'),
      `--config=${configPath}`,
      `--type=${testType}`
    ]

    if (options.html) {
      args.push('--html')
    }

    if (options.verbose) {
      args.push('--verbose')
    }

    if (options.headless !== undefined) {
      args.push(options.headless ? '--headless' : '--show-browser')
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
    res.write(`data: ${JSON.stringify({ type: 'start', message: 'Starting test execution...' })}\n\n`)

    // Spawn test process
    const testProcess = spawn('node', args, {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe']
    })

    let output = ''
    let hasError = false

    // Handle stdout
    testProcess.stdout.on('data', (data) => {
      const message = data.toString()
      output += message
      res.write(`data: ${JSON.stringify({ type: 'stdout', message: message.trim() })}\n\n`)
    })

    // Handle stderr
    testProcess.stderr.on('data', (data) => {
      const message = data.toString()
      output += message
      hasError = true
      res.write(`data: ${JSON.stringify({ type: 'stderr', message: message.trim() })}\n\n`)
    })

    // Handle process completion
    testProcess.on('close', async (code) => {
      try {
        // Clean up temporary config
        if (config && configPath.includes('temp-')) {
          await fs.remove(configPath)
        }

        // Find latest report
        const reportsDir = path.join(process.cwd(), 'reports')
        const files = await fs.readdir(reportsDir)
        const reportFiles = files
          .filter(file => file.startsWith('test-report-') && file.endsWith('.json'))
          .sort()
          .reverse()

        let reportData = null
        if (reportFiles.length > 0) {
          const latestReport = path.join(reportsDir, reportFiles[0])
          reportData = await fs.readJson(latestReport)
        }

        // Send completion message
        res.write(`data: ${JSON.stringify({
          type: 'complete',
          code,
          success: code === 0 && !hasError,
          report: reportData,
          message: code === 0 ? 'Test execution completed successfully' : 'Test execution completed with errors'
        })}\n\n`)

      } catch (error) {
        res.write(`data: ${JSON.stringify({
          type: 'error',
          message: `Error processing results: ${error.message}`
        })}\n\n`)
      } finally {
        res.end()
      }
    })

    // Handle process error
    testProcess.on('error', (error) => {
      res.write(`data: ${JSON.stringify({
        type: 'error',
        message: `Failed to start test process: ${error.message}`
      })}\n\n`)
      res.end()
    })

    // Handle client disconnect
    req.on('close', () => {
      if (testProcess && !testProcess.killed) {
        testProcess.kill('SIGTERM')
      }
    })

  } catch (error) {
    console.error('Test execution API error:', error)
    res.status(500).json({
      message: 'Failed to execute tests',
      error: error.message
    })
  }
} 