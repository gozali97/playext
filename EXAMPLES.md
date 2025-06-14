# Contoh Penggunaan Playwright Auto Tester

Dokumen ini berisi berbagai contoh penggunaan aplikasi untuk berbagai skenario testing.

## 🚀 Quick Start

### 1. Setup Awal
```bash
# Clone project
git clone <repository-url>
cd playwright-auto-tester

# Setup otomatis
npm run setup
```

### 2. Demo Cepat
```bash
# Jalankan demo langsung
npm run demo

# Demo interaktif
npm run demo-interactive
```

## 📋 Skenario Testing

### 1. Login dengan Kredensial + Testing Forms

```bash
# Testing website dengan login
node src/main.js \
  --url=https://yourwebsite.com/login \
  --username=your-username \
  --password=your-password \
  --output=results.json
```

**Konfigurasi File:**
```json
{
  "url": "https://yourwebsite.com/login",
  "username": "your-username", 
  "password": "your-password",
  "saveSession": true,
  "sessionFile": "my-session.json",
  "testingOptions": {
    "forms": {
      "maxFormsToTest": 10,
      "testSecurity": true
    }
  }
}
```

### 2. Login dengan Session/Cookie

```bash
# Pertama kali login dan simpan session
node src/main.js --config=config.json

# Gunakan session untuk testing selanjutnya
node src/main.js --use-cookie=auth.json --url=https://yourwebsite.com/dashboard
```

### 3. Testing Multi-Website

**Website 1:**
```json
{
  "url": "https://website1.com/login",
  "username": "user1@example.com",
  "password": "password1",
  "sessionFile": "website1-auth.json"
}
```

**Website 2:**
```json
{
  "url": "https://website2.com/admin",
  "username": "admin@website2.com", 
  "password": "adminpass",
  "sessionFile": "website2-auth.json"
}
```

```bash
# Test website 1
node src/main.js --config=website1-config.json --output=website1-results.json

# Test website 2
node src/main.js --config=website2-config.json --output=website2-results.json
```

### 4. Security Testing Fokus

```json
{
  "url": "https://targetapp.com",
  "username": "tester@example.com",
  "password": "testpass",
  "testingOptions": {
    "forms": {
      "fillRandom": false,
      "testValidation": false,
      "testSecurity": true,
      "maxFormsToTest": 20
    },
    "security": {
      "checkCSRF": true,
      "checkXSS": true,
      "checkSQLInjection": true
    }
  }
}
```

### 5. Mode Headless untuk CI/CD

```bash
# Untuk continuous integration
node src/main.js \
  --config=production-config.json \
  --headless \
  --output=ci-results.json
```

## 🔧 Konfigurasi Advanced

### Custom Selectors untuk Website Unik

```json
{
  "url": "https://customapp.com",
  "username": "user@test.com",
  "password": "password",
  "selectors": {
    "login": {
      "usernameFields": [
        "input[data-testid='username']",
        ".custom-username-field",
        "#loginEmail"
      ],
      "passwordFields": [
        "input[data-testid='password']", 
        ".custom-password-field",
        "#loginPassword"
      ],
      "submitButtons": [
        "button[data-testid='login-submit']",
        ".custom-login-btn"
      ],
      "csrfTokens": [
        "input[name='_csrf']",
        "meta[name='custom-token']"
      ]
    },
    "dashboard": [
      ".main-dashboard",
      "div[data-testid='user-area']",
      "a[data-testid='logout']"
    ]
  }
}
```

### Rate Limiting & Anti-Bot Protection

```json
{
  "url": "https://protected-site.com",
  "username": "user@example.com",
  "password": "password",
  "waitDelay": {
    "min": 3000,
    "max": 8000
  },
  "timeout": 60000,
  "testingOptions": {
    "forms": {
      "maxFormsToTest": 3
    }
  }
}
```

## 🎯 Use Cases Spesifik

### 1. E-commerce Testing

```json
{
  "url": "https://mystore.com/admin",
  "username": "admin@mystore.com",
  "password": "adminpass",
  "testingOptions": {
    "forms": {
      "fillRandom": true,
      "testValidation": true,
      "testSecurity": true,
      "maxFormsToTest": 15
    }
  },
  "selectors": {
    "login": {
      "usernameFields": ["#admin_email"],
      "passwordFields": ["#admin_password"],
      "submitButtons": [".admin-login-btn"]
    },
    "dashboard": [
      ".admin-dashboard",
      "a[href*='logout']",
      ".admin-menu"
    ]
  }
}
```

### 2. CMS/Blog Testing

```json
{
  "url": "https://myblog.com/wp-admin",
  "username": "blogadmin",
  "password": "blogpass",
  "selectors": {
    "login": {
      "usernameFields": ["#user_login"],
      "passwordFields": ["#user_pass"],
      "submitButtons": ["#wp-submit"]
    },
    "dashboard": [
      "#wpadminbar",
      ".wp-admin",
      "a[href*='wp-login.php?action=logout']"
    ]
  }
}
```

### 3. SaaS Application Testing

```json
{
  "url": "https://saasapp.com/signin",
  "username": "user@company.com",
  "password": "securepass",
  "testingOptions": {
    "security": {
      "checkCSRF": true,
      "checkXSS": true,
      "checkSQLInjection": false
    }
  },
  "selectors": {
    "login": {
      "usernameFields": ["input[type='email']"],
      "passwordFields": ["input[type='password']"],
      "submitButtons": ["button[type='submit']"]
    }
  }
}
```

## 🔒 Session Management Examples

### Save dan Reuse Session

```bash
# Login dan simpan session
node src/main.js \
  --url=https://app.com/login \
  --username=user@test.com \
  --password=password123

# Gunakan session yang tersimpan
node src/main.js \
  --use-cookie=auth.json \
  --url=https://app.com/dashboard \
  --output=dashboard-test.json
```

### Session Validation

```javascript
const SessionHandler = require('./src/auth/session');
const Logger = require('./src/utils/logger');

const logger = new Logger();
const sessionHandler = new SessionHandler(logger);

// Validasi session
const validation = await sessionHandler.validateSession('auth.json');
if (validation.valid) {
    console.log('Session valid, dapat digunakan');
} else {
    console.log('Session invalid:', validation.message);
}
```

### Session Backup dan Restore

```javascript
// Backup session
const backupPath = await sessionHandler.backupSession('auth.json');
console.log('Session backed up to:', backupPath);

// Restore session
await sessionHandler.restoreSession(backupPath, 'auth-restored.json');
```

## 📊 Output Analysis

### Analisis Hasil Security Testing

```javascript
const fs = require('fs');
const results = JSON.parse(fs.readFileSync('test-results.json'));

// Cek XSS vulnerabilities
const xssIssues = [];
results.testResults.forEach(form => {
    form.tests.forEach(test => {
        if (test.testName === 'XSS Security Test' && !test.success) {
            xssIssues.push({
                form: form.formId,
                payload: test.payload
            });
        }
    });
});

console.log('XSS Issues found:', xssIssues.length);
```

### Generate Report

```javascript
const results = JSON.parse(fs.readFileSync('test-results.json'));

console.log('=== SECURITY REPORT ===');
console.log(`Total Forms Tested: ${results.summary.totalTests}`);
console.log(`Security Issues: ${results.summary.errors.length}`);

results.testResults.forEach((form, index) => {
    console.log(`\nForm ${index + 1}: ${form.formId || 'Unknown'}`);
    console.log(`  Tests: ${form.summary.totalTests}`);
    console.log(`  Passed: ${form.summary.passed}`);
    console.log(`  Failed: ${form.summary.failed}`);
    
    if (form.summary.errors.length > 0) {
        console.log('  Issues:');
        form.summary.errors.forEach(error => {
            console.log(`    - ${error}`);
        });
    }
});
```

## 🚨 Error Handling

### Handling Login Failures

```json
{
  "url": "https://app.com/login",
  "username": "user@test.com",
  "password": "wrongpassword",
  "onLoginFail": {
    "retryCount": 3,
    "retryDelay": 5000,
    "fallbackAction": "skip"
  }
}
```

### Handling Network Issues

```bash
# Dengan timeout yang lebih besar untuk koneksi lambat
node src/main.js \
  --config=config.json \
  --timeout=60000
```

### Custom Error Handling

```javascript
// Dalam konfigurasi JavaScript
const config = {
    url: "https://app.com",
    username: "user@test.com", 
    password: "password",
    onError: async (error, context) => {
        console.log('Custom error handler:', error.message);
        // Custom logging atau recovery logic
        return 'continue'; // atau 'stop'
    }
};
```

## 🔄 Automation & Scheduling

### Cron Job Example

```bash
# Crontab entry untuk testing harian
0 2 * * * cd /path/to/playwright-auto-tester && node src/main.js --config=production-config.json --headless --output=daily-results.json
```

### CI/CD Pipeline Example

```yaml
# GitHub Actions example
name: Security Testing
on:
  schedule:
    - cron: '0 6 * * *'
  
jobs:
  security-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npx playwright install
      - run: node src/main.js --config=ci-config.json --headless
      - uses: actions/upload-artifact@v2
        with:
          name: test-results
          path: test-results.json
```

## 💡 Tips & Best Practices

### 1. Optimasi Performance
```json
{
  "testingOptions": {
    "forms": {
      "maxFormsToTest": 5,
      "testSecurity": true
    }
  },
  "waitDelay": {
    "min": 500,
    "max": 1500
  }
}
```

### 2. Security-First Configuration
```json
{
  "testingOptions": {
    "security": {
      "checkCSRF": true,
      "checkXSS": true,
      "checkSQLInjection": true
    },
    "forms": {
      "testSecurity": true,
      "testValidation": false
    }
  }
}
```

### 3. Development vs Production
```bash
# Development (dengan UI)
node src/main.js --config=dev-config.json

# Production (headless)
node src/main.js --config=prod-config.json --headless
```

---

**Note**: Selalu pastikan Anda memiliki izin untuk melakukan testing pada website target. Gunakan aplikasi ini secara bertanggung jawab dan ethical.