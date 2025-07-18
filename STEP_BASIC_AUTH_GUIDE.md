# 🔐 Step-Level Basic Authentication Guide

## Overview
Framework E2E Testing sekarang mendukung **Step-Level Basic Authentication** dimana setiap step `navigate` dapat memiliki konfigurasi basic auth sendiri. Pendekatan ini memberikan kontrol yang lebih granular dan fleksibilitas maksimal.

## 🎯 Keunggulan Step-Level Basic Auth

### ✅ **Granular Control**
- Setiap step navigate dapat memiliki basic auth terpisah
- Enable/disable per step, bukan per scenario atau global
- Konfigurasi yang berbeda untuk URL yang berbeda dalam satu scenario

### ✅ **Simplicity**
- Tidak perlu complex URL matching logic
- Konfigurasi langsung di step yang membutuhkan
- Clear visibility: step mana yang butuh auth, mana yang tidak

### ✅ **Flexibility**
- Mix authenticated dan non-authenticated steps dalam satu scenario
- Credentials berbeda per step jika diperlukan
- Step-specific selectors dan login pages

## 🔧 Configuration Structure

### Step-Level Basic Auth
```json
{
  "scenarios": [
    {
      "id": "test-scenario",
      "name": "Test Scenario",
      "steps": [
        {
          "id": "navigate-protected",
          "type": "navigate",
          "name": "Navigate to Protected Page",
          "url": "https://staging-app.example.com",
          "basicAuth": {
            "enabled": true,
            "username": "admin",
            "password": "secret123",
            "loginPage": "/login",
            "usernameField": "#username, input[name='username'], input[type='text']",
            "passwordField": "#password, input[name='password'], input[type='password']",
            "submitButton": "input[type='submit'], button[type='submit'], .btn-login"
          }
        },
        {
          "id": "navigate-public",
          "type": "navigate", 
          "name": "Navigate to Public Page",
          "url": "https://public-app.example.com"
          // No basicAuth needed
        }
      ]
    }
  ]
}
```

## 🎮 UI Configuration

### Step Editor dengan Basic Auth
Dalam **Configuration Page → E2E Scenarios → Edit Step**:

1. **Basic Auth Checkbox**
   ```
   ☑️ 🔐 Require Basic Authentication
   ```

2. **Credentials Section** (muncul jika enabled)
   ```
   Username: [admin        ]
   Password: [••••••••••••]
   ```

3. **Advanced Settings**
   ```
   Login Page: [/login                    ] (optional)
   Username Field: [#username, input[name='username']]
   Password Field: [#password, input[name='password']]
   Submit Button: [input[type='submit'], button[type='submit']]
   ```

4. **Visual Indicator**
   - Step dengan basic auth menampilkan badge **🔐 Basic Auth**
   - Orange color untuk easy identification

## 🚀 How It Works

### Execution Flow
```
1. Execute Navigate Step
2. Check if step.basicAuth.enabled = true
3. If yes:
   a. Navigate to URL or loginPage
   b. Wait for username field
   c. Fill username with step.basicAuth.username
   d. Fill password with step.basicAuth.password
   e. Click submit button
   f. Wait for navigation away from login
   g. Continue to next step
4. If no: Direct navigation to URL
5. Continue with next step
```

### Code Implementation
```javascript
async executeNavigateStep(step, page) {
    const { url, basicAuth } = step;
    
    // Handle basic auth if configured in step
    if (basicAuth?.enabled) {
        await this.handleStepBasicAuth(url, basicAuth, page);
    }
    
    await page.goto(url, { waitUntil: 'networkidle' });
    return { url: page.url() };
}
```

## 📝 Configuration Properties

### Step Basic Auth Properties
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `enabled` | boolean | Yes | Enable basic auth for this step |
| `username` | string | Yes* | Basic auth username |
| `password` | string | Yes* | Basic auth password |
| `loginPage` | string | No | Login page path (optional) |
| `usernameField` | string | Yes* | Username field selector(s) |
| `passwordField` | string | Yes* | Password field selector(s) |
| `submitButton` | string | Yes* | Submit button selector(s) |

*Required only if `enabled: true`

### Selector Fallbacks
```json
{
  "usernameField": "#username, input[name='username'], input[type='text']",
  "passwordField": "#password, input[name='password'], input[type='password']",
  "submitButton": "input[type='submit'], button[type='submit'], .btn-login"
}
```
- Multiple selectors separated by commas
- Framework tries each selector until one works
- First working selector is used

## 🎯 Use Cases

### 1. **Mixed Environment Testing**
```json
{
  "steps": [
    {
      "type": "navigate",
      "url": "https://staging.app.com",
      "basicAuth": { "enabled": true, "username": "admin", "password": "staging123" }
    },
    {
      "type": "navigate", 
      "url": "https://api.app.com/public"
      // No auth needed
    }
  ]
}
```

### 2. **Multi-Stage Authentication**
```json
{
  "steps": [
    {
      "type": "navigate",
      "url": "https://admin.app.com",
      "basicAuth": { "enabled": true, "username": "admin", "password": "admin123" }
    },
    {
      "type": "navigate",
      "url": "https://user.app.com", 
      "basicAuth": { "enabled": true, "username": "user", "password": "user123" }
    }
  ]
}
```

### 3. **Conditional Basic Auth**
```json
{
  "steps": [
    {
      "type": "navigate",
      "url": "https://staging.app.com",
      "basicAuth": { "enabled": true }  // Only for staging
    },
    {
      "type": "navigate",
      "url": "https://app.com"
      // Production doesn't need basic auth
    }
  ]
}
```

## 🔍 Current Configuration Analysis

Berdasarkan test yang baru saja dijalankan:

### ✅ **Configuration Status**
- **Total scenarios**: 2
- **Total navigate steps**: 5  
- **Steps with basic auth**: 1
- **Valid configurations**: 1
- **Validation**: ✅ Passed

### 🎯 **Active Configuration**
```
Scenario: Complete Login to Logout Flow Checklist
Step 1: Navigate to Login Page
  URL: https://staging-checklist.k24.co.id
  🔐 Basic Auth: admin / [password]
  Login Page: /login
  Selectors: 3 username, 3 password, 4 submit fallbacks
```

### 📊 **Execution Plan**
Ketika menjalankan scenario `login-logout-flow-checklist`:
1. **Step 1**: Basic auth ke staging-checklist → Login form
2. **Step 2-9**: Normal steps tanpa basic auth

## 🛠️ Implementation Details

### Enhanced E2E Test Runner
```javascript
async handleStepBasicAuth(url, basicAuthConfig, page) {
    // Navigate to login page if specified
    if (basicAuthConfig.loginPage) {
        const loginUrl = new URL(basicAuthConfig.loginPage, url).href;
        await page.goto(loginUrl, { waitUntil: 'networkidle' });
    }
    
    // Find and fill form using fallback selectors
    const usernameSelector = await this.findWorkingSelector(basicAuthConfig.usernameField, page);
    const passwordSelector = await this.findWorkingSelector(basicAuthConfig.passwordField, page);
    const submitSelector = await this.findWorkingSelector(basicAuthConfig.submitButton, page);
    
    await page.fill(usernameSelector, basicAuthConfig.username);
    await page.fill(passwordSelector, basicAuthConfig.password);
    
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }),
        page.click(submitSelector)
    ]);
}
```

### UI Integration
- **Step Modal**: Enhanced dengan basic auth section
- **Visual Indicators**: 🔐 badge untuk steps dengan auth
- **Real-time Preview**: Show auth status dalam step list
- **Form Validation**: Required fields validation

## 🔄 Migration from Global Auth

### Before (Global/Target-based)
```json
{
  "auth": {
    "targets": {
      "staging": {
        "url": "staging.app.com",
        "basicAuth": { "enabled": true }
      }
    }
  }
}
```

### After (Step-level)
```json
{
  "steps": [
    {
      "type": "navigate",
      "url": "https://staging.app.com",
      "basicAuth": { "enabled": true, "username": "admin", "password": "secret" }
    }
  ]
}
```

### Migration Benefits
- ✅ **Clearer**: Auth requirement visible at step level
- ✅ **Simpler**: No complex URL matching
- ✅ **Flexible**: Different auth per step
- ✅ **Maintainable**: Easier to debug and modify

## 🧪 Testing & Validation

### Validation Script
```bash
# Test step-level basic auth configuration
node test-step-basic-auth.js
```

### Expected Output
```
✅ Configuration structure: Valid
✅ Steps with basic auth: 1
✅ Valid configurations: 1 
✅ Validation: Passed
🔐 1 step(s) require basic authentication
```

### Debug Logging
```
🔐 Handling step-level basic authentication...
🔐 Navigating to login page: https://staging-checklist.k24.co.id/login
🔐 Filled basic auth username: admin
🔐 Filled basic auth password
🔐 Basic auth form submitted successfully
✅ Basic authentication completed successfully
```

## 🎨 UI Components

### Step List dengan Auth Indicator
```
Step 1: Navigate to Login Page (navigate)
  URL: https://staging-checklist.k24.co.id
  🔐 Basic Auth
  (1 assertions)
```

### Step Modal Basic Auth Section
```
🔐 Require Basic Authentication ☑️

Username: [admin        ]
Password: [••••••••••••]
Login Page: [/login     ] (optional)

Username Field: [#username, input[name='username']]
Password Field: [#password, input[name='password']] 
Submit Button: [input[type='submit'], button[type='submit']]

💡 Tip: Use comma-separated selectors for fallbacks
```

## 📋 Best Practices

### 1. **Selector Strategy**
```json
{
  "usernameField": "#username, #email, input[name='user'], input[type='text']",
  "passwordField": "#password, #pass, input[name='password'], input[type='password']",
  "submitButton": "#submit, .login-btn, input[type='submit'], button[type='submit']"
}
```

### 2. **Security**
- Use environment variables for sensitive credentials
- Don't commit passwords to version control
- Use different credentials per environment

### 3. **Error Handling**
- Configure multiple selector fallbacks
- Set appropriate timeouts
- Use descriptive step names for debugging

### 4. **Performance**
- Only enable basic auth on steps that need it
- Use specific selectors for faster element finding
- Set reasonable timeouts

## 🚀 Getting Started

### Quick Setup
1. **Open Configuration Page**
2. **Go to E2E Scenarios tab**
3. **Edit a scenario**
4. **Click on a navigate step**
5. **Check "🔐 Require Basic Authentication"**
6. **Fill credentials and selectors**
7. **Save and test**

### Example Configuration
```json
{
  "type": "navigate",
  "name": "Access Protected Staging",
  "url": "https://staging-app.example.com",
  "basicAuth": {
    "enabled": true,
    "username": "admin",
    "password": "staging123",
    "loginPage": "/login",
    "usernameField": "#username",
    "passwordField": "#password", 
    "submitButton": "button[type='submit']"
  }
}
```

---

## 🎉 Summary

**Step-Level Basic Authentication** memberikan solusi yang:

- ✅ **Granular**: Kontrol per step
- ✅ **Simple**: Konfigurasi langsung di step
- ✅ **Flexible**: Mix auth dan non-auth steps
- ✅ **Maintainable**: Easy debugging dan modification
- ✅ **User-friendly**: UI controls yang intuitif

Pendekatan ini menggantikan kompleksitas global/target-based auth dengan solusi yang lebih straightforward dan powerful.

**Ready untuk production! 🚀** 