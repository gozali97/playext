import fs from 'fs-extra'
import path from 'path'

export default async function handler(req, res) {
  const reportsDir = path.join(process.cwd(), 'reports')
  
  try {
    // Pastikan direktori reports ada
    if (!await fs.pathExists(reportsDir)) {
      await fs.mkdir(reportsDir, { recursive: true })
    }

    if (req.method === 'GET') {
      const { type, id } = req.query
      
      if (id) {
        // Get specific report by ID
        const reportPath = path.join(reportsDir, `${id}.json`)
        if (await fs.pathExists(reportPath)) {
          const report = await fs.readJson(reportPath)
          return res.status(200).json(report)
        } else {
          return res.status(404).json({ message: 'Report not found' })
        }
      }
      
      // Get all reports
      const files = await fs.readdir(reportsDir)
      const reports = []
      
      for (const file of files) {
        if (file.endsWith('.json') && file.startsWith('test-report-')) {
          try {
            const reportPath = path.join(reportsDir, file)
            const report = await fs.readJson(reportPath)
            
            // Extract metadata
            const reportId = file.replace('.json', '')
            const htmlPath = path.join(reportsDir, `${reportId}.html`)
            const hasHtml = await fs.pathExists(htmlPath)
            
            reports.push({
              id: reportId,
              filename: file,
              startTime: report.framework?.startTime,
              endTime: report.framework?.endTime,
              duration: report.framework?.duration,
              totalTests: report.summary?.totalTests || 0,
              passed: report.summary?.passed || 0,
              failed: report.summary?.failed || 0,
              success: (report.summary?.passed || 0) > (report.summary?.failed || 0),
              target: report.framework?.configuration?.target?.url,
              testTypes: Object.keys(report.testTypes || {}),
              hasHtml,
              fileSize: (await fs.stat(reportPath)).size
            })
          } catch (error) {
            console.error(`Error reading report ${file}:`, error)
          }
        }
      }
      
      // Sort by date (newest first)
      reports.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      
      return res.status(200).json(reports)
    }
    
    else if (req.method === 'DELETE') {
      const { id } = req.query
      
      if (!id) {
        return res.status(400).json({ message: 'Report ID is required' })
      }
      
      // Delete both JSON and HTML files
      const jsonPath = path.join(reportsDir, `${id}.json`)
      const htmlPath = path.join(reportsDir, `${id}.html`)
      
      let deleted = 0
      if (await fs.pathExists(jsonPath)) {
        await fs.remove(jsonPath)
        deleted++
      }
      if (await fs.pathExists(htmlPath)) {
        await fs.remove(htmlPath)
        deleted++
      }
      
      if (deleted === 0) {
        return res.status(404).json({ message: 'Report not found' })
      }
      
      return res.status(200).json({ 
        message: `Report deleted successfully (${deleted} files removed)` 
      })
    }
    
    else {
      return res.status(405).json({ message: 'Method not allowed' })
    }
    
  } catch (error) {
    console.error('Reports API error:', error)
    return res.status(500).json({ 
      message: 'Failed to handle reports',
      error: error.message 
    })
  }
} 