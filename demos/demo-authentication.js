#!/usr/bin/env node

/**
 * Authentication Demo
 * Mendemonstrasikan berbagai jenis authentication yang didukung
 */

const TestRunner = require('../src/core/TestRunner');
const chalk = require('chalk');

async function authenticationDemo() {
    console.log(chalk.cyan('🔐 AUTHENTICATION TESTING DEMO'));
    console.log(chalk.cyan('=' .repeat(50)));
    console.log(chalk.yellow('Mendemonstrasikan berbagai jenis authentication:\n'));

    const testConfigs = [
        {
            name: 'Basic HTTP Authentication',
            config: 'config/basic-auth.json',
            description: 'Testing dengan HTTP Basic Auth (httpbin.org)'
        },
        {
            name: 'Standard HTML Form Login',
            config: 'config/standard-login.json', 
            description: 'Testing dengan form login standar (demo.testfire.net)'
        },
        {
            name: 'React Application Login',
            config: 'config/react-app.json',
            description: 'Testing untuk aplikasi React (localhost:3000)'
        },
        {
            name: 'Vue.js Application Login',
            config: 'config/vue-app.json',
            description: 'Testing untuk aplikasi Vue.js (localhost:8080)'
        }
    ];

    for (let i = 0; i < testConfigs.length; i++) {
        const testConfig = testConfigs[i];
        
        console.log(chalk.green(`\n${i + 1}. ${testConfig.name}`));
        console.log(chalk.gray(`   ${testConfig.description}`));
        console.log(chalk.gray(`   Config: ${testConfig.config}`));
        
        try {
            console.log(chalk.yellow('   🚀 Starting test...'));
            
            const testRunner = new TestRunner();
            const results = await testRunner.run({
                config: testConfig.config,
                type: 'smoke',
                html: false
            });

            // Display results
            const authTest = results.testTypes?.smoke?.tests?.find(t => t.name === 'Login Functionality');
            
            if (authTest) {
                if (authTest.result?.success) {
                    console.log(chalk.green(`   ✅ Authentication: SUCCESS`));
                    console.log(chalk.gray(`      Strategy: ${authTest.result.strategy}`));
                    console.log(chalk.gray(`      Final URL: ${authTest.result.finalUrl}`));
                } else if (authTest.result?.skipped) {
                    console.log(chalk.yellow(`   ⏭️  Authentication: SKIPPED`));
                    console.log(chalk.gray(`      Reason: ${authTest.result.reason}`));
                } else {
                    console.log(chalk.red(`   ❌ Authentication: FAILED`));
                    console.log(chalk.gray(`      Error: ${authTest.result?.error || authTest.error}`));
                }
            } else {
                console.log(chalk.gray(`   ℹ️  No authentication test found`));
            }

            // Overall test summary
            const summary = results.summary;
            console.log(chalk.gray(`   📊 Tests: ${summary.totalTests} | Passed: ${summary.passed} | Failed: ${summary.failed}`));
            console.log(chalk.gray(`   ⏱️  Duration: ${results.framework.duration}ms`));

        } catch (error) {
            console.log(chalk.red(`   ❌ Test Error: ${error.message}`));
        }

        // Add separator except for last item
        if (i < testConfigs.length - 1) {
            console.log(chalk.gray('   ' + '-'.repeat(40)));
        }
    }

    console.log(chalk.cyan('\n🎯 AUTHENTICATION STRATEGIES SUMMARY:'));
    console.log(chalk.cyan('=' .repeat(50)));
    
    const strategies = [
        {
            name: 'Basic Auth',
            description: 'HTTP Basic Authentication dengan username/password di header',
            usage: 'Website dengan popup login browser',
            config: 'auth.basicAuth.enabled = true'
        },
        {
            name: 'Form Login',
            description: 'Standard HTML form dengan input username/password',
            usage: 'Website tradisional dengan form login',
            config: 'auth.strategy = "form"'
        },
        {
            name: 'React Login',
            description: 'SPA React dengan form login yang dinamis',
            usage: 'Aplikasi React modern dengan state management',
            config: 'auth.strategy = "react"'
        },
        {
            name: 'Vue Login',
            description: 'SPA Vue.js dengan reactive form components',
            usage: 'Aplikasi Vue.js dengan v-model binding',
            config: 'auth.strategy = "vue"'
        },
        {
            name: 'Token Auth',
            description: 'API authentication dengan Bearer token atau API key',
            usage: 'REST API atau headless applications',
            config: 'auth.bearerToken atau auth.apiKey'
        }
    ];

    strategies.forEach((strategy, index) => {
        console.log(chalk.green(`\n${index + 1}. ${strategy.name}`));
        console.log(chalk.gray(`   📝 ${strategy.description}`));
        console.log(chalk.gray(`   🎯 Usage: ${strategy.usage}`));
        console.log(chalk.gray(`   ⚙️  Config: ${strategy.config}`));
    });

    console.log(chalk.cyan('\n📚 CONFIGURATION EXAMPLES:'));
    console.log(chalk.cyan('=' .repeat(50)));
    
    console.log(chalk.yellow('\n1. Basic Auth Configuration:'));
    console.log(chalk.gray(`{
  "auth": {
    "strategy": "basic",
    "basicAuth": {
      "enabled": true,
      "username": "user",
      "password": "pass"
    }
  }
}`));

    console.log(chalk.yellow('\n2. React App Configuration:'));
    console.log(chalk.gray(`{
  "auth": {
    "strategy": "react",
    "username": "user@example.com",
    "password": "password123",
    "loginUrl": "/login",
    "usernameField": "input[data-testid='username']",
    "passwordField": "input[data-testid='password']",
    "submitButton": "button[data-testid='login-submit']"
  }
}`));

    console.log(chalk.yellow('\n3. Vue.js App Configuration:'));
    console.log(chalk.gray(`{
  "auth": {
    "strategy": "vue",
    "username": "admin@vue-app.com",
    "password": "vuepass123",
    "usernameField": "input[v-model*='username']",
    "passwordField": "input[v-model*='password']",
    "submitButton": "button[data-cy='login-submit']"
  }
}`));

    console.log(chalk.cyan('\n🚀 NEXT STEPS:'));
    console.log(chalk.gray('• Edit konfigurasi sesuai dengan aplikasi Anda'));
    console.log(chalk.gray('• Jalankan: node src/core/TestRunner.js --config=your-config.json'));
    console.log(chalk.gray('• Gunakan --html flag untuk laporan visual'));
    console.log(chalk.gray('• Sesuaikan selector CSS untuk elemen form Anda'));
    
    console.log(chalk.green('\n✅ Authentication Demo Completed!'));
}

// Run demo if this file is executed directly
if (require.main === module) {
    authenticationDemo().catch(error => {
        console.error(chalk.red('Demo Error:'), error.message);
        process.exit(1);
    });
}

module.exports = authenticationDemo; 