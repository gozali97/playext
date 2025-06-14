import fs from 'fs-extra'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const reportsDir = path.join(process.cwd(), 'reports')
    
    // Create reports directory if it doesn't exist
    await fs.ensureDir(reportsDir)
    
    // Get all JSON report files
    const files = await fs.readdir(reportsDir)
    const reportFiles = files.filter(file => file.startsWith('test-report-') && file.endsWith('.json'))
    
    let totalTests = 0
    let passedTests = 0
    let failedTests = 0
    let lastRunTime = null
    const recentTests = []

    // Process recent reports (last 10)
    const sortedFiles = reportFiles.sort().reverse().slice(0, 10)
    
    for (const file of sortedFiles) {
      try {
        const filePath = path.join(reportsDir, file)
        const report = await fs.readJson(filePath)
        
        // Update stats
        totalTests += report.summary?.totalTests || 0
        passedTests += report.summary?.passed || 0
        failedTests += report.summary?.failed || 0
        
        if (!lastRunTime || new Date(report.framework?.timestamp) > new Date(lastRunTime)) {
          lastRunTime = report.framework?.timestamp
        }
        
        // Add to recent tests
        recentTests.push({
          type: 'mixed',
          status: (report.summary?.failed || 0) > 0 ? 'FAILED' : 'PASSED',
          startTime: report.framework?.timestamp,
          duration: report.framework?.duration || 0,
          totalTests: report.summary?.totalTests || 0,
          reportId: file.replace('.json', ''),
          errors: report.summary?.errors || []
        })
      } catch (error) {
        console.error(`Error reading report ${file}:`, error)
      }
    }

    res.status(200).json({
      stats: {
        totalTests,
        passedTests,
        failedTests,
        lastRunTime
      },
      recentTests
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    res.status(500).json({ 
      message: 'Failed to load dashboard data',
      error: error.message 
    })
  }
} 