# Panduan Authentication Universal Test Automation Framework v2.0

## Overview
Framework ini mendukung berbagai strategi authentication dengan kemampuan auto-detection dan konfigurasi yang fleksibel.

## Fitur Authentication

### 1. Auto-Detection Strategy
Framework secara otomatis mendeteksi jenis authentication yang digunakan website:
- **Basic HTTP Authentication**
- **Standard HTML Form Login**
- **React Application Login**
- **Vue.js Application Login**
- **API Token Authentication**

### 2. Support untuk Login URL Terpisah
Framework mendukung konfigurasi dimana:
- `target.url`: URL utama website (contoh: `https://project.k24.co.id/`)
- `auth.loginUrl`: Path spesifik untuk login (contoh: `/scp`)

## Konfigurasi Authentication

### Basic HTTP Authentication
```json
{
  "target": {
    "url": "https://project.k24.co.id/",
    "name": "K24 Project"
  },
  "auth": {
    "strategy": "basic",
    "username": "ahmad.gozali@k24.co.id",
    "password": "multi123T",
    "loginUrl": "/scp",
    "basicAuth": {
      "enabled": true,
      "username": "c",
      "password": "c"
    }
  }
}
```

### Standard Form Login
```json
{
  "auth": {
    "strategy": "form",
    "username": "user@example.com",
    "password": "password123",
    "loginUrl": "/login",
    "selectors": {
      "username": "#username, [name='email']",
      "password": "#password, [name='password']",
      "submit": "#login-btn, [type='submit']"
    }
  }
}
```

### React Application Login
```json
{
  "auth": {
    "strategy": "react",
    "username": "user@example.com",
    "password": "password123",
    "loginUrl": "/auth/login",
    "selectors": {
      "username": "[data-testid='username'], #email",
      "password": "[data-testid='password'], #password",
      "submit": "[data-testid='login-button']"
    }
  }
}
```

## Cara Kerja Authentication

### 1. Inisialisasi Browser Context
Semua test runners (Smoke, Performance, Security, E2E) secara otomatis menerapkan HTTP Basic Authentication jika dikonfigurasi:

```javascript
this.context = await this.browser.newContext({
  viewport: { width: 1920, height: 1080 },
  userAgent: 'Universal Test Automation Framework',
  ...(config.auth?.basicAuth?.enabled && {
    httpCredentials: {
      username: config.auth.basicAuth.username,
      password: config.auth.basicAuth.password
    }
  })
});
```

### 2. Navigation ke Login URL
Jika `loginUrl` dikonfigurasi, framework akan:
1. Mengambil base URL dari `target.url`
2. Menggabungkan dengan `auth.loginUrl`
3. Menghindari double slash dalam URL
4. Navigate ke URL login yang benar

```javascript
// Construct full login URL
const baseUrl = config.target?.url || page.url();
const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
const cleanLoginUrl = config.auth.loginUrl.startsWith('/') ? config.auth.loginUrl : '/' + config.auth.loginUrl;
const targetUrl = cleanBaseUrl + cleanLoginUrl;
```

### 3. Authentication Process
1. **Auto-detection**: Framework mendeteksi jenis authentication
2. **Strategy execution**: Menjalankan strategi yang sesuai
3. **Verification**: Memverifikasi keberhasilan login
4. **Fallback**: Mencoba strategi alternatif jika gagal

## Test Types yang Mendukung Authentication

### ✅ Smoke Tests
- Website Accessibility Test
- **Login Functionality Test** (menggunakan AuthenticationHandler)
- Critical Path Tests

### ✅ Performance Tests
- Page Load Performance (dengan authentication)
- Resource Loading Performance
- JavaScript Performance
- Network Performance

### ✅ Security Tests
- Security Headers Test (dengan authentication)
- SSL/TLS Configuration Test
- XSS Vulnerability Test
- SQL Injection Test

### ✅ E2E Tests
- End-to-end scenarios dengan authentication
- Video recording dan screenshots
- Tracing untuk debugging

## Troubleshooting

### 1. Login Timeout
Jika login timeout, tingkatkan timeout di konfigurasi:
```json
{
  "testTypes": {
    "smoke": {
      "timeout": 60000
    }
  },
  "global": {
    "timeout": 30000
  }
}
```

### 2. Authentication Failed
- Periksa credentials di konfigurasi
- Pastikan `loginUrl` benar
- Cek log untuk melihat strategi yang digunakan
- Gunakan `--show-browser` untuk debugging visual

### 3. 401 Unauthorized
- Pastikan Basic Auth credentials benar
- Periksa apakah server memerlukan authentication header khusus
- Cek apakah URL login sudah benar

## Contoh Penggunaan

### Menjalankan Test dengan Authentication
```bash
# Test dengan browser visible untuk debugging
node src/core/TestRunner.js --config=config/basic-auth.json --show-browser

# Test dengan browser headless
node src/core/TestRunner.js --config=config/basic-auth.json --headless

# Test hanya smoke tests
node src/core/TestRunner.js --config=config/basic-auth.json --type=smoke
```

### Konfigurasi untuk Website K24
```json
{
  "target": {
    "url": "https://project.k24.co.id/",
    "name": "K24 Project"
  },
  "auth": {
    "strategy": "basic",
    "username": "ahmad.gozali@k24.co.id",
    "password": "multi123T",
    "loginUrl": "/scp",
    "basicAuth": {
      "enabled": true,
      "username": "c",
      "password": "c"
    }
  }
}
```

## Hasil Test Authentication

### ✅ Berhasil
- Basic HTTP Authentication berfungsi
- Login URL terpisah berfungsi
- Critical path tests berhasil
- Authentication strategy auto-detection berfungsi

### 📊 Metrics
- Login functionality test: ✅ PASSED
- Authentication time: ~10-15 detik
- Critical paths: 4/4 berhasil
- Browser mode: Visible/Headless sesuai konfigurasi

## Update Terbaru

### v2.0.1 - Authentication Enhancement
- ✅ Support untuk `loginUrl` terpisah dari `target.url`
- ✅ Perbaikan double slash di URL construction
- ✅ HTTP Basic Authentication di semua test runners
- ✅ Improved timeout handling
- ✅ Better error reporting untuk authentication issues
- ✅ Enhanced logging untuk debugging authentication

### Perbaikan yang Dilakukan
1. **AuthenticationHandler**: Menambahkan support untuk `loginUrl` di Basic Auth strategy
2. **SmokeTestRunner**: Memperbaiki URL construction untuk menghindari double slash
3. **PerformanceTestRunner**: Menambahkan httpCredentials support
4. **SecurityTestRunner**: Menambahkan httpCredentials support
5. **Configuration**: Meningkatkan timeout dan threshold yang lebih realistis 