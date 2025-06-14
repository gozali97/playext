import fs from 'fs-extra'
import path from 'path'

export default async function handler(req, res) {
  try {
    // Pastikan direktori config ada
    const configDir = path.join(process.cwd(), 'config')
    const configPath = path.join(configDir, 'default.json')
    
    // Periksa apakah direktori config ada, jika tidak buat
    if (!await fs.pathExists(configDir)) {
      await fs.mkdir(configDir, { recursive: true })
    }
    
    // Periksa apakah file config ada, jika tidak buat default
    if (!await fs.pathExists(configPath)) {
      const defaultConfig = {
        target: {
          url: "https://example.com",
          name: "Example Application"
        },
        auth: {
          username: "",
          password: ""
        },
        browser: {
          headless: false,
          slowMo: 100
        }
      }
      await fs.writeJson(configPath, defaultConfig, { spaces: 2 })
    }

    if (req.method === 'GET') {
      // Load configuration
      const config = await fs.readJson(configPath)
      return res.status(200).json(config)
    } 
    else if (req.method === 'POST') {
      // Save configuration
      const newConfig = req.body
      
      // Validate required fields
      if (!newConfig.target?.url) {
        return res.status(400).json({ message: 'Target URL is required' })
      }
      
      try {
        // Backup current config
        const backupPath = path.join(configDir, `backup-${Date.now()}.json`)
        const currentConfig = await fs.readJson(configPath)
        await fs.writeJson(backupPath, currentConfig, { spaces: 2 })
        
        // Save new config
        await fs.writeJson(configPath, newConfig, { spaces: 2 })
        
        return res.status(200).json({ message: 'Configuration saved successfully' })
      } catch (writeError) {
        console.error('Error writing config:', writeError)
        return res.status(500).json({ 
          message: 'Failed to save configuration',
          error: writeError.message 
        })
      }
    } 
    else {
      return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Config API error:', error)
    return res.status(500).json({ 
      message: 'Failed to handle configuration',
      error: error.message 
    })
  }
} 