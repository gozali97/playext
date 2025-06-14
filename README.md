# 🚀 Universal Test Automation Framework v2.0

**Framework komprehensif untuk automation testing yang mendukung 9 jenis testing berbeda dalam satu platform terpadu.**

## 📋 Jenis Testing yang Didukung

| Jenis Testing | Icon | Deskripsi | Status |
|---------------|------|-----------|--------|
| **Unit Testing** | 🧪 | Testing fungsi/method individual | ✅ Ready |
| **Integration Testing** | 🔗 | Testing integrasi antar modul | ✅ Ready |
| **Functional Testing** | 🎯 | Testing fitur sesuai spesifikasi | ✅ Ready |
| **End-to-End Testing** | 🌐 | Testing alur lengkap aplikasi | ✅ Ready |
| **Regression Testing** | 🔄 | Re-testing setelah perubahan | ✅ Ready |
| **Smoke Testing** | 💨 | Testing fungsi utama dengan cepat | ✅ Ready |
| **Performance Testing** | ⚡ | Testing kinerja aplikasi | ✅ Ready |
| **Load Testing** | 📈 | Testing dengan beban pengguna | ✅ Ready |
| **Security Testing** | 🔒 | Testing kerentanan keamanan | ✅ Ready |

## 🚀 Quick Start

### Installation
```bash
# Clone repository
git clone <repository-url>
cd playext

# Install dependencies
npm install

# Install browser dependencies
npx playwright install

# Run setup
npm run setup
```

### Basic Usage
```bash
# Run all tests
npm test

# Run specific test type
npm run test:unit
npm run test:smoke
npm run test:e2e
npm run test:security

# Run with HTML report
npm test -- --html

# Run comprehensive demo
npm run demo
```

## 📁 Struktur Project

```
playext/
├── src/
│   ├── core/                 # Framework core
│   │   └── TestRunner.js     # Main test runner
│   ├── tests/                # Test implementations
│   │   ├── unit/            # Unit tests
│   │   ├── integration/     # Integration tests  
│   │   ├── functional/      # Functional tests
│   │   ├── e2e/            # End-to-end tests
│   │   ├── regression/     # Regression tests
│   │   ├── smoke/          # Smoke tests
│   │   ├── performance/    # Performance tests
│   │   ├── load/           # Load tests
│   │   └── security/       # Security tests
│   ├── utils/              # Utilities
│   │   ├── logger.js       # Logging system
│   │   └── ReportGenerator.js # Report generation
│   └── config/             # Configuration
│       └── configLoader.js  # Config management
├── config/                 # Configuration files
├── reports/               # Generated reports
├── data/                  # Test data
├── demos/                # Demo files
└── templates/            # Test templates
```

## ⚙️ Konfigurasi

### Template Konfigurasi yang Tersedia

Framework menyediakan berbagai template konfigurasi untuk berbagai jenis aplikasi:

- **`config/universal-testing.json`** - Konfigurasi default komprehensif
- **`config/react-app.json`** - Testing aplikasi React
- **`config/vue-app.json`** - Testing aplikasi Vue.js  
- **`config/basic-auth.json`** - HTTP Basic Authentication
- **`config/standard-login.json`** - Standard HTML form login
- **`config/production.json`** - Environment production
- **`config/development.json`** - Environment development

### Struktur Konfigurasi Dasar
```json
{
  "target": {
    "url": "https://your-website.com",
    "name": "Your Application"
  },
  "auth": {
    "strategy": "auto",
    "username": "your-username",
    "password": "your-password",
    "loginUrl": "/login",
    "usernameField": "#username",
    "passwordField": "#password",
    "submitButton": "#login-button"
  },
  "testTypes": {
    "unit": { "enabled": true, "timeout": 5000 },
    "smoke": { "enabled": true, "criticalPaths": ["/login", "/dashboard"] },
    "security": { "enabled": true, "checks": ["xss", "headers", "ssl"] }
  }
}
```

### 🔐 Strategi Authentication

Framework mendukung berbagai metode authentication:

#### 1. **Auto-Detection** (Direkomendasikan)
```json
{
  "auth": {
    "strategy": "auto",
    "username": "user@example.com",
    "password": "password123"
  }
}
```

#### 2. **Aplikasi React**
```json
{
  "auth": {
    "strategy": "react",
    "username": "user@example.com",
    "password": "password123",
    "usernameField": "input[data-testid='username']",
    "passwordField": "input[data-testid='password']",
    "submitButton": "button[data-testid='login-submit']"
  }
}
```

#### 3. **Aplikasi Vue.js**
```json
{
  "auth": {
    "strategy": "vue",
    "username": "admin@vue-app.com",
    "password": "vuepass123",
    "usernameField": "input[v-model*='username']",
    "passwordField": "input[v-model*='password']",
    "submitButton": "button[data-cy='login-submit']"
  }
}
```

#### 4. **HTTP Basic Authentication**
```json
{
  "auth": {
    "strategy": "basic",
    "basicAuth": {
      "enabled": true,
      "username": "user",
      "password": "pass"
    }
  }
}
```

#### 5. **Standard HTML Form**
```json
{
  "auth": {
    "strategy": "form",
    "username": "admin",
    "password": "admin",
    "loginUrl": "/login",
    "usernameField": "input[name='username']",
    "passwordField": "input[name='password']",
    "submitButton": "input[type='submit']"
  }
}
```

#### 6. **API Token Authentication**
```json
{
  "auth": {
    "strategy": "token",
    "bearerToken": "your-bearer-token",
    "apiKey": "your-api-key"
  }
}
```

### Menggunakan Template Konfigurasi
```bash
# React application
node src/core/TestRunner.js --config=config/react-app.json --type=smoke

# Vue.js application  
node src/core/TestRunner.js --config=config/vue-app.json --type=smoke

# Basic Auth website
node src/core/TestRunner.js --config=config/basic-auth.json --type=smoke

# Standard login form
node src/core/TestRunner.js --config=config/standard-login.json --type=smoke
```

## 🧪 Menulis Test

### Unit Tests
Buat file di `src/tests/unit/`:
```javascript
// math-utils.test.js
module.exports = {
    tests: [
        {
            name: 'add two numbers',
            fn: async () => {
                const result = add(2, 3);
                if (result !== 5) throw new Error('Addition failed');
                return result;
            }
        }
    ]
};
```

### E2E Scenarios
Buat file di `src/tests/e2e/`:
```javascript
// user-journey.scenario.js
module.exports = {
    name: 'User Login Journey',
    steps: [
        {
            name: 'navigate-to-login',
            action: async (page, config) => {
                await page.goto(config.target.url + '/login');
            }
        },
        {
            name: 'login-user', 
            action: async (page, config) => {
                await page.fill('#username', config.auth.username);
                await page.fill('#password', config.auth.password);
                await page.click('button[type="submit"]');
            }
        }
    ]
};
```

## 📊 Reports

Framework menghasilkan laporan komprehensif dalam berbagai format:

### JSON Report
```json
{
  "framework": {
    "name": "Universal Test Automation Framework",
    "version": "2.0.0",
    "duration": 15420
  },
  "summary": {
    "totalTestTypes": 9,
    "executed": 9,
    "passed": 8,
    "failed": 1,
    "totalTests": 45
  },
  "testTypes": {
    "unit": {
      "status": "PASSED",
      "duration": 1200,
      "tests": 8
    }
  }
}
```

### HTML Report
Report interaktif dengan visualisasi data, grafik performance, dan detail lengkap setiap test.

## 🎯 Command Line Interface

```bash
# Test spesifik
node src/core/TestRunner.js --type=smoke
node src/core/TestRunner.js --type=unit,integration
node src/core/TestRunner.js --type=all

# Dengan konfigurasi khusus
node src/core/TestRunner.js --config=config/production.json

# Generate HTML report
node src/core/TestRunner.js --type=all --html

# Verbose output
node src/core/TestRunner.js --type=security --verbose
```

## 🔧 Customization

### Custom Test Runner
```javascript
const TestRunner = require('./src/core/TestRunner');

const runner = new TestRunner();
const results = await runner.run({
    type: ['unit', 'smoke'],
    config: 'custom-config.json',
    html: true
});
```

### Custom Test Types
Tambahkan test runner baru di `src/tests/`:
```javascript
class CustomTestRunner {
    constructor(logger) {
        this.logger = logger;
        this.type = 'custom';
    }
    
    async run(config) {
        // Custom test implementation
        return {
            success: true,
            summary: { totalTests: 1, passed: 1, failed: 0 },
            tests: [],
            metrics: {}
        };
    }
}
```

## 🛡️ Security Testing

Framework menyediakan security testing otomatis:

- **XSS Detection**: Test payload XSS pada input fields
- **SQL Injection**: Test vulnerability SQL injection
- **CSRF Protection**: Validasi CSRF token pada forms
- **Security Headers**: Check security headers (HSTS, CSP, dll)
- **SSL/TLS**: Validasi konfigurasi SSL certificate

## 🚦 Performance Testing

Monitoring performance otomatis:

- **Load Time**: Waktu total loading halaman
- **First Paint**: Waktu render pertama
- **DOM Content Loaded**: Waktu DOM ready
- **TTFB**: Time to First Byte
- **Resource Analysis**: Analisis loading resources

## 📈 Load Testing

Simulasi beban pengguna:

- **Virtual Users**: Simulasi multiple users
- **Ramp-up**: Gradual increase users
- **Duration**: Test duration control
- **Metrics**: Response time, throughput, errors

## 🔄 Integration dengan CI/CD

```yaml
# GitHub Actions example
- name: Run Universal Tests
  run: |
    npm install
    npx playwright install
    npm test -- --type=all --html
    
- name: Upload Test Reports
  uses: actions/upload-artifact@v2
  with:
    name: test-reports
    path: reports/
```

## 📚 Examples & Templates

Framework menyediakan examples siap pakai:

- **Unit Tests**: Math utilities, string helpers
- **Integration Tests**: API connections, database queries  
- **E2E Scenarios**: Complete user workflows
- **Security Tests**: Common vulnerability checks
- **Performance Tests**: Page load optimization

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Add tests for new functionality
4. Update documentation
5. Submit pull request

## 📄 License

MIT License - lihat [LICENSE](LICENSE) file.

## 🆘 Support

- **Documentation**: Check `/docs` directory
- **Examples**: Check `/examples` directory  
- **Issues**: Submit GitHub issues
- **Discussions**: GitHub Discussions

## 🎉 Changelog

### v2.0.0
- ✨ Complete framework rewrite
- ✅ Support for 9 test types
- 📊 Comprehensive reporting
- 🎯 Modular architecture
- 🔧 Flexible configuration
- 📚 Rich documentation

---

**Universal Test Automation Framework v2.0** - *Testing made comprehensive and easy!* 🚀