import fs from 'fs-extra'
import path from 'path'

export default async function handler(req, res) {
  try {
    const { path: filePath } = req.query
    
    if (!filePath || !Array.isArray(filePath)) {
      return res.status(400).json({ message: 'Invalid file path' })
    }
    
    const fileName = filePath.join('/')
    const fullPath = path.join(process.cwd(), 'reports', fileName)
    
    // Security check - ensure file is within reports directory
    const reportsDir = path.join(process.cwd(), 'reports')
    if (!fullPath.startsWith(reportsDir)) {
      return res.status(403).json({ message: 'Access denied' })
    }
    
    // Check if file exists
    if (!await fs.pathExists(fullPath)) {
      return res.status(404).json({ message: 'File not found' })
    }
    
    // Get file extension
    const ext = path.extname(fileName).toLowerCase()
    
    // Set appropriate content type
    let contentType = 'application/octet-stream'
    if (ext === '.html') {
      contentType = 'text/html'
    } else if (ext === '.json') {
      contentType = 'application/json'
    } else if (ext === '.pdf') {
      contentType = 'application/pdf'
    } else if (ext === '.csv') {
      contentType = 'text/csv'
    }
    
    // Read and serve the file
    const fileContent = await fs.readFile(fullPath)
    
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(fileName)}"`)
    res.send(fileContent)
    
  } catch (error) {
    console.error('Error serving report file:', error)
    res.status(500).json({ 
      message: 'Failed to serve file',
      error: error.message 
    })
  }
} 