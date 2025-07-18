# 🎬 E2E Scenarios Configuration Guide

## Overview

Fitur E2E Scenarios memungkinkan Anda untuk membuat, mengelola, dan menjalankan test scenarios end-to-end yang kompleks dan dinamis melalui antarmuka web. Sistem ini mendukung konfigurasi test flows yang dapat disesuaikan dari login hingga logout dengan berbagai jenis aksi dan validasi.

## ✨ Fitur Utama

### 🔧 Konfigurasi Dinamis
- **Visual Scenario Builder**: Buat dan edit scenarios melalui UI yang intuitif
- **Step-by-Step Configuration**: Definisikan setiap langkah test secara detail
- **Variable Substitution**: Gunakan template variables untuk konfigurasi yang fleksibel
- **Assertion System**: Tambahkan validasi pada setiap step

### 🎯 Jenis Step Actions

#### 1. **Navigate** 🌐
Navigasi ke URL tertentu
```json
{
  "type": "navigate",
  "name": "Navigate to Login Page",
  "url": "https://project.k24.co.id/scp",
  "waitFor": "networkidle",
  "timeout": 10000
}
```

#### 2. **Click** 👆
Klik elemen di halaman
```json
{
  "type": "click",
  "name": "Click Login Button",
  "selector": "#login-button",
  "waitFor": "navigation",
  "timeout": 5000
}
```

#### 3. **Fill** ✏️
Mengisi input field
```json
{
  "type": "fill",
  "name": "Fill Username",
  "selector": "#username",
  "value": "{{auth.username}}",
  "clearFirst": true,
  "sensitive": false
}
```

#### 4. **Fill Form** 📝
Mengisi multiple fields dalam form
```json
{
  "type": "fill_form",
  "name": "Fill Registration Form",
  "form": {
    "selector": "form",
    "fields": [
      {
        "selector": "input[name='name']",
        "value": "Test User",
        "type": "text"
      },
      {
        "selector": "select[name='country']",
        "value": "ID",
        "type": "select"
      }
    ]
  }
}
```

#### 5. **Verify** ✅
Menjalankan validasi/assertions
```json
{
  "type": "verify",
  "name": "Verify Dashboard Loaded",
  "assertions": [
    {
      "type": "url",
      "condition": "contains",
      "value": "/dashboard"
    }
  ]
}
```

#### 6. **Wait** ⏳
Menunggu kondisi tertentu
```json
{
  "type": "wait",
  "name": "Wait for Element",
  "waitType": "selector",
  "selector": ".loading-complete",
  "timeout": 10000
}
```

### 🔍 Assertion System

#### URL Assertions
```json
{
  "type": "url",
  "condition": "contains|not_contains|equals",
  "value": "/expected-path"
}
```

#### Element Assertions
```json
{
  "type": "element",
  "selector": "#element-id",
  "condition": "visible|hidden|hasValue|hasText",
  "value": "expected-value"
}
```

#### Title Assertions
```json
{
  "type": "title",
  "condition": "equals|not_equals|contains",
  "value": "Expected Title"
}
```

### 🔄 Variable Substitution

Gunakan template variables untuk membuat konfigurasi yang dinamis:

#### Available Variables
- `{{auth.username}}` - Username dari konfigurasi auth
- `{{auth.password}}` - Password dari konfigurasi auth
- `{{target.url}}` - URL aplikasi target
- `{{custom.variableName}}` - Custom variables yang didefinisikan

#### Contoh Penggunaan
```json
{
  "type": "navigate",
  "url": "{{target.url}}/login"
},
{
  "type": "fill",
  "selector": "#username",
  "value": "{{auth.username}}"
}
```

## 📋 Contoh Scenario Lengkap

### Login to Logout Flow
```json
{
  "id": "login-logout-flow",
  "name": "Complete Login to Logout Flow",
  "description": "Test complete user journey from login to logout",
  "enabled": true,
  "critical": true,
  "timeout": 60000,
  "retries": 2,
  "steps": [
    {
      "id": "navigate-to-login",
      "type": "navigate",
      "name": "Navigate to Login Page",
      "url": "{{target.url}}/login",
      "waitFor": "networkidle",
      "timeout": 10000,
      "assertions": [
        {
          "type": "url",
          "condition": "contains",
          "value": "/login"
        },
        {
          "type": "element",
          "selector": "#username",
          "condition": "visible"
        }
      ]
    },
    {
      "id": "perform-login",
      "type": "fill",
      "name": "Fill Login Credentials",
      "selector": "#username",
      "value": "{{auth.username}}",
      "clearFirst": true
    },
    {
      "id": "fill-password",
      "type": "fill",
      "name": "Fill Password",
      "selector": "#password",
      "value": "{{auth.password}}",
      "sensitive": true
    },
    {
      "id": "submit-login",
      "type": "click",
      "name": "Submit Login",
      "selector": "#login-button",
      "waitFor": "navigation",
      "timeout": 10000,
      "assertions": [
        {
          "type": "url",
          "condition": "not_contains",
          "value": "/login"
        }
      ]
    },
    {
      "id": "verify-dashboard",
      "type": "verify",
      "name": "Verify Dashboard Access",
      "assertions": [
        {
          "type": "url",
          "condition": "contains",
          "value": "/dashboard"
        },
        {
          "type": "element",
          "selector": ".user-menu",
          "condition": "visible"
        }
      ]
    },
    {
      "id": "logout",
      "type": "click",
      "name": "Logout",
      "selector": ".logout-link",
      "waitFor": "navigation",
      "assertions": [
        {
          "type": "url",
          "condition": "contains",
          "value": "/login"
        }
      ]
    }
  ]
}
```

## 🎮 Menggunakan UI Manager

### 1. Akses E2E Scenarios
1. Buka halaman **Configuration**
2. Klik tab **E2E Scenarios** 🎬
3. Anda akan melihat interface untuk mengelola scenarios

### 2. Membuat Scenario Baru
1. Klik tombol **"+ New Scenario"**
2. Isi informasi dasar scenario:
   - **Name**: Nama scenario
   - **Description**: Deskripsi scenario
   - **Enabled**: Aktifkan/nonaktifkan scenario
   - **Critical**: Tandai sebagai critical (akan menghentikan test jika gagal)
   - **Timeout**: Timeout untuk seluruh scenario

### 3. Menambah Steps
1. Pilih scenario yang ingin diedit
2. Klik **"+ Add Step"**
3. Konfigurasi step:
   - **Step Name**: Nama step
   - **Step Type**: Pilih jenis aksi
   - **Configuration**: Isi konfigurasi sesuai jenis step
   - **Assertions**: Tambahkan validasi (optional)

### 4. Mengelola Assertions
1. Dalam modal step, klik **"Add Assertion"**
2. Pilih jenis assertion:
   - **URL Assertion**: Validasi URL
   - **Element Assertion**: Validasi elemen
   - **Title Assertion**: Validasi title halaman
3. Konfigurasi kondisi dan nilai yang diharapkan

## ⚙️ Konfigurasi Global Settings

```json
{
  "globalSettings": {
    "screenshotOnFailure": true,
    "videoRecording": false,
    "tracing": true,
    "slowMo": 500,
    "retryOnFailure": true,
    "maxRetries": 2,
    "parallelExecution": false,
    "waitForSelectors": true,
    "autoWait": true
  }
}
```

### Setting Descriptions
- **screenshotOnFailure**: Ambil screenshot saat step gagal
- **videoRecording**: Rekam video selama test
- **tracing**: Aktifkan Playwright tracing
- **slowMo**: Delay antar aksi (ms)
- **retryOnFailure**: Retry otomatis saat gagal
- **maxRetries**: Maksimal retry
- **parallelExecution**: Jalankan scenarios secara parallel
- **waitForSelectors**: Tunggu selector tersedia
- **autoWait**: Auto-wait untuk actionability

## 🔧 Tips & Best Practices

### 1. Selector Strategy
```javascript
// ✅ Good - Specific and stable
"#login-button"
"input[name='username']"
"[data-testid='submit-btn']"

// ❌ Avoid - Fragile selectors
".btn.btn-primary.large"
"div > div > button:nth-child(3)"
```

### 2. Variable Usage
```javascript
// ✅ Use variables for dynamic values
"url": "{{target.url}}/dashboard"
"value": "{{auth.username}}"

// ✅ Define custom variables
"variables": {
  "custom": {
    "testEmail": "test@example.com",
    "testData": "Sample Data"
  }
}
```

### 3. Assertion Strategy
```javascript
// ✅ Multiple assertions for robust validation
"assertions": [
  {
    "type": "url",
    "condition": "contains",
    "value": "/success"
  },
  {
    "type": "element",
    "selector": ".success-message",
    "condition": "visible"
  },
  {
    "type": "element",
    "selector": ".error-message",
    "condition": "hidden"
  }
]
```

### 4. Error Handling
```javascript
// ✅ Use optional assertions for non-critical checks
{
  "type": "element",
  "selector": ".optional-banner",
  "condition": "visible",
  "optional": true
}

// ✅ Set appropriate timeouts
{
  "type": "click",
  "selector": "#slow-button",
  "timeout": 15000
}
```

## 🚀 Advanced Features

### 1. Scenario Dependencies
```json
{
  "id": "form-test",
  "prerequisites": ["login-logout-flow"],
  "steps": [
    {
      "type": "execute_scenario",
      "scenario": "login-logout-flow",
      "steps": ["navigate-to-login", "perform-login", "verify-dashboard"]
    }
  ]
}
```

### 2. Dynamic Form Filling
```json
{
  "type": "fill_form",
  "form": {
    "selector": "form",
    "fields": [
      {
        "selector": "input[name='email']",
        "value": "{{custom.testEmail}}",
        "type": "text"
      },
      {
        "selector": "select[name='country']",
        "value": "ID",
        "type": "select"
      },
      {
        "selector": "input[name='agree']",
        "value": true,
        "type": "checkbox"
      }
    ]
  }
}
```

### 3. Wait Strategies
```json
// Wait for selector
{
  "type": "wait",
  "waitType": "selector",
  "selector": ".data-loaded",
  "timeout": 10000
}

// Wait for URL
{
  "type": "wait",
  "waitType": "url",
  "condition": "**/dashboard",
  "timeout": 5000
}

// Wait for custom function
{
  "type": "wait",
  "waitType": "function",
  "condition": "() => document.readyState === 'complete'",
  "timeout": 5000
}
```

## 📊 Monitoring & Debugging

### 1. Screenshots
- Otomatis diambil saat step gagal
- Disimpan di `reports/screenshots/e2e/`
- Format: `{scenario-id}-step-{number}-{step-id}-failure.png`

### 2. Tracing
- Playwright trace tersedia di `reports/traces/e2e-trace.zip`
- Buka dengan Playwright Trace Viewer
- Berisi timeline lengkap eksekusi test

### 3. Logs
- Detail eksekusi tersedia di console logs
- Error messages dengan context yang jelas
- Step-by-step execution tracking

## 🔄 Integration dengan Test Runner

E2E scenarios terintegrasi penuh dengan Universal Test Framework:

1. **Konfigurasi**: Disimpan dalam `config/default.json`
2. **Eksekusi**: Melalui E2ETestRunner yang enhanced
3. **Reporting**: Hasil terintegrasi dalam report utama
4. **API**: Dapat dijalankan melalui `/api/test/run`

## 📝 Troubleshooting

### Common Issues

1. **Selector tidak ditemukan**
   - Periksa selector dengan browser dev tools
   - Gunakan `waitForSelector` dengan timeout yang cukup
   - Pertimbangkan dynamic content loading

2. **Timeout errors**
   - Tingkatkan timeout untuk steps yang lambat
   - Gunakan `waitFor: "networkidle"` untuk SPA
   - Periksa network conditions

3. **Authentication failures**
   - Verifikasi credentials di konfigurasi auth
   - Periksa selector untuk form login
   - Pastikan URL login benar

4. **Variable substitution tidak bekerja**
   - Periksa format `{{variable.path}}`
   - Pastikan variable didefinisikan di config
   - Cek case sensitivity

### Debug Mode
```json
{
  "browser": {
    "headless": false,
    "slowMo": 1000
  },
  "globalSettings": {
    "screenshotOnFailure": true,
    "tracing": true
  }
}
```

## 🎯 Next Steps

1. **Buat scenario pertama** melalui UI
2. **Test dengan data real** dari aplikasi Anda
3. **Iterasi dan improve** berdasarkan hasil
4. **Scale up** dengan multiple scenarios
5. **Integrate** dengan CI/CD pipeline

---

Dengan sistem E2E Scenarios ini, Anda dapat membuat test automation yang comprehensive dan maintainable untuk aplikasi web Anda. Happy testing! 🚀 