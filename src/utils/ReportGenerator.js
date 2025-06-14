const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class ReportGenerator {
    constructor() {
        this.templates = {
            html: this.getHTMLTemplate(),
            markdown: this.getMarkdownTemplate()
        };
    }

    async generateHTMLReport(testResults, outputPath) {
        try {
            const html = this.generateHTML(testResults);
            await fs.writeFile(outputPath, html, 'utf8');
            return outputPath;
        } catch (error) {
            throw new Error(`Failed to generate HTML report: ${error.message}`);
        }
    }

    async generateMarkdownReport(testResults, outputPath) {
        try {
            const markdown = this.generateMarkdown(testResults);
            await fs.writeFile(outputPath, markdown, 'utf8');
            return outputPath;
        } catch (error) {
            throw new Error(`Failed to generate Markdown report: ${error.message}`);
        }
    }

    generateHTML(testResults) {
        const { framework, summary, testTypes, environment } = testResults;
        
        const testTypeRows = Object.entries(testTypes).map(([type, result]) => {
            const statusColor = result.status === 'PASSED' ? '#4CAF50' : 
                               result.status === 'FAILED' ? '#F44336' : '#FF9800';
            
            return `
                <tr>
                    <td>${type.toUpperCase()}</td>
                    <td><span style="color: ${statusColor}; font-weight: bold;">${result.status}</span></td>
                    <td>${result.summary?.totalTests || 0}</td>
                    <td>${result.summary?.passed || 0}</td>
                    <td>${result.summary?.failed || 0}</td>
                    <td>${result.duration}ms</td>
                </tr>
            `;
        }).join('');

        const errorsList = summary.errors.length > 0 ? 
            `<ul>${summary.errors.map(error => `<li>${error}</li>`).join('')}</ul>` :
            '<p>No errors reported.</p>';

        return this.templates.html
            .replace('{{TITLE}}', `Test Report - ${framework.name}`)
            .replace('{{FRAMEWORK_NAME}}', framework.name)
            .replace('{{FRAMEWORK_VERSION}}', framework.version)
            .replace('{{START_TIME}}', framework.startTime)
            .replace('{{END_TIME}}', framework.endTime)
            .replace('{{DURATION}}', framework.duration)
            .replace('{{TOTAL_TEST_TYPES}}', summary.totalTestTypes)
            .replace('{{EXECUTED}}', summary.executed)
            .replace('{{PASSED}}', summary.passed)
            .replace('{{FAILED}}', summary.failed)
            .replace('{{TOTAL_TESTS}}', summary.totalTests)
            .replace('{{TEST_TYPE_ROWS}}', testTypeRows)
            .replace('{{ERRORS_LIST}}', errorsList)
            .replace('{{ENVIRONMENT_JSON}}', JSON.stringify(environment, null, 2))
            .replace('{{FULL_RESULTS_JSON}}', JSON.stringify(testResults, null, 2));
    }

    generateMarkdown(testResults) {
        const { framework, summary, testTypes, environment } = testResults;
        
        let markdown = `# Test Report - ${framework.name}\n\n`;
        
        // Framework Info
        markdown += `## Framework Information\n`;
        markdown += `- **Name:** ${framework.name}\n`;
        markdown += `- **Version:** ${framework.version}\n`;
        markdown += `- **Start Time:** ${framework.startTime}\n`;
        markdown += `- **End Time:** ${framework.endTime}\n`;
        markdown += `- **Duration:** ${framework.duration}ms\n\n`;
        
        // Summary
        markdown += `## Test Summary\n`;
        markdown += `| Metric | Value |\n`;
        markdown += `|--------|-------|\n`;
        markdown += `| Test Types Executed | ${summary.executed}/${summary.totalTestTypes} |\n`;
        markdown += `| Total Tests | ${summary.totalTests} |\n`;
        markdown += `| Passed | ${summary.passed} |\n`;
        markdown += `| Failed | ${summary.failed} |\n`;
        markdown += `| Skipped | ${summary.skipped} |\n\n`;
        
        // Test Types
        markdown += `## Test Types Results\n`;
        markdown += `| Type | Status | Tests | Passed | Failed | Duration |\n`;
        markdown += `|------|--------|-------|--------|--------|---------|\n`;
        
        Object.entries(testTypes).forEach(([type, result]) => {
            markdown += `| ${type.toUpperCase()} | ${result.status} | ${result.summary?.totalTests || 0} | ${result.summary?.passed || 0} | ${result.summary?.failed || 0} | ${result.duration}ms |\n`;
        });
        
        // Errors
        if (summary.errors.length > 0) {
            markdown += `\n## Errors\n`;
            summary.errors.forEach((error, index) => {
                markdown += `${index + 1}. ${error}\n`;
            });
        }
        
        return markdown;
    }

    getHTMLTemplate() {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #667eea;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .summary-card .value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f8f9fa;
            font-weight: 600;
        }
        .section {
            margin: 30px 0;
        }
        .section h2 {
            color: #333;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        .error-list {
            background: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 4px;
            padding: 15px;
        }
        .json-container {
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 15px;
            overflow-x: auto;
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
            font-size: 12px;
        }
        .collapsible {
            cursor: pointer;
            background: #667eea;
            color: white;
            padding: 10px;
            border: none;
            border-radius: 4px;
            width: 100%;
            text-align: left;
            margin: 10px 0;
        }
        .collapsible:hover {
            background: #5a6fd8;
        }
        .collapsible-content {
            display: none;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{FRAMEWORK_NAME}}</h1>
            <p>Version {{FRAMEWORK_VERSION}} | {{START_TIME}} - {{END_TIME}} | Duration: {{DURATION}}ms</p>
        </div>
        
        <div class="content">
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>Test Types</h3>
                    <div class="value">{{EXECUTED}}/{{TOTAL_TEST_TYPES}}</div>
                </div>
                <div class="summary-card">
                    <h3>Total Tests</h3>
                    <div class="value">{{TOTAL_TESTS}}</div>
                </div>
                <div class="summary-card">
                    <h3>Passed</h3>
                    <div class="value" style="color: #4CAF50;">{{PASSED}}</div>
                </div>
                <div class="summary-card">
                    <h3>Failed</h3>
                    <div class="value" style="color: #F44336;">{{FAILED}}</div>
                </div>
            </div>
            
            <div class="section">
                <h2>Test Types Results</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Tests</th>
                            <th>Passed</th>
                            <th>Failed</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {{TEST_TYPE_ROWS}}
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <h2>Errors</h2>
                <div class="error-list">
                    {{ERRORS_LIST}}
                </div>
            </div>
            
            <div class="section">
                <button class="collapsible" onclick="toggleCollapsible(this)">Environment Information</button>
                <div class="collapsible-content">
                    <div class="json-container">
                        <pre>{{ENVIRONMENT_JSON}}</pre>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <button class="collapsible" onclick="toggleCollapsible(this)">Full Test Results (JSON)</button>
                <div class="collapsible-content">
                    <div class="json-container">
                        <pre>{{FULL_RESULTS_JSON}}</pre>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        function toggleCollapsible(element) {
            const content = element.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        }
    </script>
</body>
</html>
        `;
    }

    getMarkdownTemplate() {
        return `# Test Report Template`;
    }

    async generateSummaryReport(testResults, outputPath) {
        const summary = {
            framework: testResults.framework,
            summary: testResults.summary,
            environment: testResults.environment,
            testTypeSummary: {}
        };

        // Create summary for each test type
        Object.entries(testResults.testTypes).forEach(([type, result]) => {
            summary.testTypeSummary[type] = {
                status: result.status,
                duration: result.duration,
                totalTests: result.summary?.totalTests || 0,
                passed: result.summary?.passed || 0,
                failed: result.summary?.failed || 0,
                errors: result.errors?.length || 0
            };
        });

        await fs.writeJson(outputPath, summary, { spaces: 2 });
        return outputPath;
    }

    printConsoleReport(testResults) {
        const { framework, summary, testTypes } = testResults;
        
        console.log(chalk.cyan(`\n📊 ${framework.name} v${framework.version}`));
        console.log(chalk.cyan('='.repeat(60)));
        console.log(chalk.yellow(`⏱️  Duration: ${framework.duration}ms`));
        console.log(chalk.yellow(`🔧 Test Types: ${summary.executed}/${summary.totalTestTypes}`));
        console.log(chalk.yellow(`📝 Total Tests: ${summary.totalTests}`));
        console.log(chalk.green(`✅ Passed: ${summary.passed}`));
        console.log(chalk.red(`❌ Failed: ${summary.failed}`));

        console.log(chalk.cyan('\n📋 Test Type Details:'));
        Object.entries(testTypes).forEach(([type, result]) => {
            const statusColor = result.status === 'PASSED' ? chalk.green :
                               result.status === 'FAILED' ? chalk.red : chalk.yellow;
            
            console.log(`  ${type.padEnd(12)} ${statusColor(result.status.padEnd(8))} ${(result.summary?.totalTests || 0).toString().padEnd(6)} ${result.duration}ms`);
        });

        if (summary.errors.length > 0) {
            console.log(chalk.red('\n❌ Errors:'));
            summary.errors.forEach((error, index) => {
                console.log(chalk.red(`   ${index + 1}. ${error}`));
            });
        }
    }
}

module.exports = ReportGenerator; 