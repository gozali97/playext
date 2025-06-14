import fs from 'fs-extra'
import path from 'path'

export default async function handler(req, res) {
  const reportsDir = path.join(process.cwd(), 'reports')
  
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' })
    }

    // Pastikan direktori reports ada
    if (!await fs.pathExists(reportsDir)) {
      return res.status(200).json({
        summary: { totalReports: 0, trends: [], testTypeStats: {} },
        trends: { daily: [], weekly: [], testTypes: [] },
        performance: { averageDuration: 0, successRateHistory: [] }
      })
    }

    const files = await fs.readdir(reportsDir)
    const reports = []
    
    // Collect all report data
    for (const file of files) {
      if (file.endsWith('.json') && file.startsWith('test-report-')) {
        try {
          const reportPath = path.join(reportsDir, file)
          const report = await fs.readJson(reportPath)
          reports.push(report)
        } catch (error) {
          console.error(`Error reading report ${file}:`, error)
        }
      }
    }

    // Calculate analytics
    const analytics = calculateAnalytics(reports)
    return res.status(200).json(analytics)
    
  } catch (error) {
    console.error('Analytics API error:', error)
    return res.status(500).json({ 
      message: 'Failed to generate analytics',
      error: error.message 
    })
  }
}

function calculateAnalytics(reports) {
  if (reports.length === 0) {
    return {
      summary: { totalReports: 0, trends: [], testTypeStats: {} },
      trends: { daily: [], weekly: [], testTypes: [] },
      performance: { averageDuration: 0, successRateHistory: [] }
    }
  }

  // Sort reports by date
  const sortedReports = reports.sort((a, b) => 
    new Date(a.framework?.startTime) - new Date(b.framework?.startTime)
  )

  // Calculate summary stats
  const totalReports = reports.length
  const totalTests = reports.reduce((sum, r) => sum + (r.summary?.totalTests || 0), 0)
  const totalPassed = reports.reduce((sum, r) => sum + (r.summary?.passed || 0), 0)
  const totalFailed = reports.reduce((sum, r) => sum + (r.summary?.failed || 0), 0)
  const averageSuccessRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0
  const averageDuration = reports.reduce((sum, r) => sum + (r.framework?.duration || 0), 0) / reports.length

  // Calculate test type statistics
  const testTypeStats = {}
  reports.forEach(report => {
    Object.keys(report.testTypes || {}).forEach(testType => {
      if (!testTypeStats[testType]) {
        testTypeStats[testType] = {
          name: testType,
          totalRuns: 0,
          totalTests: 0,
          passed: 0,
          failed: 0,
          averageDuration: 0,
          successRate: 0
        }
      }

      const testData = report.testTypes[testType]
      testTypeStats[testType].totalRuns++
      testTypeStats[testType].totalTests += testData.summary?.totalTests || 0
      testTypeStats[testType].passed += testData.summary?.passed || 0
      testTypeStats[testType].failed += testData.summary?.failed || 0
      testTypeStats[testType].averageDuration += testData.duration || 0
    })
  })

  // Calculate averages for test types
  Object.values(testTypeStats).forEach(stat => {
    stat.averageDuration = stat.averageDuration / stat.totalRuns
    stat.successRate = stat.totalTests > 0 ? (stat.passed / stat.totalTests) * 100 : 0
  })

  // Calculate trends (last 30 days)
  const dailyTrends = calculateDailyTrends(sortedReports)
  const testTypeTrends = calculateTestTypeTrends(sortedReports)

  // Performance trends
  const successRateHistory = sortedReports.map(report => ({
    date: report.framework?.startTime,
    successRate: report.summary?.totalTests > 0 
      ? (report.summary.passed / report.summary.totalTests) * 100 
      : 0,
    duration: report.framework?.duration || 0,
    totalTests: report.summary?.totalTests || 0
  }))

  return {
    summary: {
      totalReports,
      totalTests,
      totalPassed,
      totalFailed,
      averageSuccessRate: Math.round(averageSuccessRate * 100) / 100,
      averageDuration: Math.round(averageDuration),
      testTypeStats: Object.values(testTypeStats)
    },
    trends: {
      daily: dailyTrends,
      testTypes: testTypeTrends
    },
    performance: {
      averageDuration: Math.round(averageDuration),
      successRateHistory,
      durationTrend: calculateDurationTrend(sortedReports)
    }
  }
}

function calculateDailyTrends(reports) {
  const dailyData = {}
  
  reports.forEach(report => {
    const date = new Date(report.framework?.startTime).toISOString().split('T')[0]
    
    if (!dailyData[date]) {
      dailyData[date] = {
        date,
        totalTests: 0,
        passed: 0,
        failed: 0,
        reports: 0,
        duration: 0
      }
    }
    
    dailyData[date].totalTests += report.summary?.totalTests || 0
    dailyData[date].passed += report.summary?.passed || 0
    dailyData[date].failed += report.summary?.failed || 0
    dailyData[date].reports++
    dailyData[date].duration += report.framework?.duration || 0
  })

  return Object.values(dailyData).map(day => ({
    ...day,
    successRate: day.totalTests > 0 ? (day.passed / day.totalTests) * 100 : 0,
    averageDuration: day.duration / day.reports
  }))
}

function calculateTestTypeTrends(reports) {
  const testTypeData = {}
  
  reports.forEach(report => {
    Object.entries(report.testTypes || {}).forEach(([testType, data]) => {
      if (!testTypeData[testType]) {
        testTypeData[testType] = []
      }
      
      testTypeData[testType].push({
        date: report.framework?.startTime,
        status: data.status,
        duration: data.duration,
        totalTests: data.summary?.totalTests || 0,
        passed: data.summary?.passed || 0,
        failed: data.summary?.failed || 0
      })
    })
  })

  return Object.entries(testTypeData).map(([testType, history]) => ({
    testType,
    history,
    averageSuccessRate: history.length > 0 
      ? history.reduce((sum, h) => sum + (h.totalTests > 0 ? (h.passed / h.totalTests) * 100 : 0), 0) / history.length
      : 0
  }))
}

function calculateDurationTrend(reports) {
  if (reports.length < 2) return 0
  
  const recent = reports.slice(-5).reduce((sum, r) => sum + (r.framework?.duration || 0), 0) / 5
  const older = reports.slice(0, -5).reduce((sum, r) => sum + (r.framework?.duration || 0), 0) / Math.max(1, reports.length - 5)
  
  return ((recent - older) / older) * 100
} 