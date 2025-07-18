# 🔐 Basic Authentication Guide

## Overview
Framework E2E Testing sekarang mendukung **Basic Authentication** untuk website yang memerlukan login form sebelum bisa mengakses halaman utama. Fitur ini sangat berguna untuk testing website staging atau development yang dilindungi dengan basic auth.

## 🎯 Fitur Basic Auth

### 1. **HTTP Basic Authentication**
- Standard HTTP Basic Auth dengan header Authorization
- Otomatis handled oleh browser context
- Cocok untuk server-level authentication

### 2. **Form-Based Basic Authentication**
- Login form dengan username/password fields
- Otomatis detect dan isi form login
- Support multiple selector fallbacks
- Cocok untuk custom login pages

### 3. **Multi-Target Support**
- Konfigurasi berbeda untuk setiap target website
- Otomatis detect target berdasarkan URL
- Mix and match: beberapa target dengan basic auth, beberapa tanpa

## 🔧 Configuration

### Basic Structure
```json
{
  "auth": {
    "basicAuth": {
      "enabled": true,
      "username": "admin",
      "password": "admin123",
      "formBased": true,
      "loginPage": "/login",
      "usernameField": "#username, input[name='username'], input[type='text']",
      "passwordField": "#password, input[name='password'], input[type='password']",
      "submitButton": "input[type='submit'], button[type='submit'], .btn-login"
    },
    "targets": {
      "production": {
        "url": "https://app.example.com",
        "basicAuth": { "enabled": false }
      },
      "staging": {
        "url": "https://staging.example.com",
        "basicAuth": {
          "enabled": true,
          "username": "admin",
          "password": "staging123",
          "formBased": true
        }
      }
    }
  }
}
```

### Target-Specific Configuration
```json
{
  "auth": {
    "targets": {
      "kpi": {
        "url": "https://kpi.k24.co.id",
        "username": "ahmad.gozali@k24.co.id",
        "password": "multi123T",
        "loginUrl": "/scp",
        "usernameField": "#LoginForm_username",
        "passwordField": "#LoginForm_password",
        "submitButton": "input[type='submit']",
        "basicAuth": {
          "enabled": false
        }
      },
      "checklist": {
        "url": "https://staging-checklist.k24.co.id",
        "username": "ahmad.gozali@k24.co.id",
        "password": "multi123T",
        "loginUrl": "/login",
        "basicAuth": {
          "enabled": true,
          "username": "admin",
          "password": "admin123",
          "formBased": true,
          "loginPage": "/login",
          "usernameField": "#username, input[name='username'], input[type='text']",
          "passwordField": "#password, input[name='password'], input[type='password']",
          "submitButton": "input[type='submit'], button[type='submit'], .btn-login"
        }
      }
    }
  }
}
```

## 🚀 How It Works

### 1. **Automatic Target Detection**
```javascript
// Framework automatically detects target based on URL
if (url.includes('staging-checklist.k24.co.id')) {
    // Use checklist target configuration
    // Basic auth enabled with form-based login
}
```

### 2. **Form-Based Auth Flow**
```
1. Navigate to target URL
2. Detect if basic auth is required
3. Navigate to login page (/login)
4. Wait for username field to appear
5. Try multiple selectors: #username, input[name='username'], input[type='text']
6. Fill username with basic auth credentials
7. Fill password with basic auth credentials  
8. Click submit button
9. Wait for navigation away from login page
10. Verify authentication success
11. Continue with main scenario steps
```

### 3. **HTTP Basic Auth Flow**
```
1. Set HTTP credentials in browser context
2. Navigate to target URL
3. Browser automatically handles authentication
4. Continue with main scenario steps
```

## 📝 Configuration Properties

### Basic Auth Properties
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `enabled` | boolean | Yes | Enable/disable basic auth |
| `username` | string | Yes* | Basic auth username |
| `password` | string | Yes* | Basic auth password |
| `formBased` | boolean | No | Use form-based auth (default: false) |
| `loginPage` | string | No | Login page path (default: current page) |
| `usernameField` | string | Yes* | Username field selector(s) |
| `passwordField` | string | Yes* | Password field selector(s) |
| `submitButton` | string | Yes* | Submit button selector(s) |

*Required only if `enabled: true`

### Selector Syntax
```json
{
  "usernameField": "#username, input[name='username'], input[type='text']"
}
```
- Multiple selectors separated by commas
- Framework tries each selector until one works
- First working selector is used

## 🎮 Usage Examples

### Example 1: Simple Form-Based Auth
```json
{
  "basicAuth": {
    "enabled": true,
    "username": "admin",
    "password": "secret123",
    "formBased": true,
    "usernameField": "#username",
    "passwordField": "#password",
    "submitButton": "button[type='submit']"
  }
}
```

### Example 2: HTTP Basic Auth
```json
{
  "basicAuth": {
    "enabled": true,
    "username": "admin",
    "password": "secret123",
    "formBased": false
  }
}
```

### Example 3: Multiple Fallback Selectors
```json
{
  "basicAuth": {
    "enabled": true,
    "username": "admin",
    "password": "secret123",
    "formBased": true,
    "usernameField": "#login-username, #username, input[name='user'], input[type='text']",
    "passwordField": "#login-password, #password, input[name='pass'], input[type='password']",
    "submitButton": "#login-btn, .login-button, input[type='submit'], button[type='submit']"
  }
}
```

### Example 4: Different Login Page
```json
{
  "basicAuth": {
    "enabled": true,
    "username": "admin",
    "password": "secret123",
    "formBased": true,
    "loginPage": "/auth/login",
    "usernameField": "#email",
    "passwordField": "#password",
    "submitButton": ".btn-primary"
  }
}
```

## 🔍 Debugging & Troubleshooting

### Common Issues

#### 1. **Selector Not Found**
```
Error: None of the selectors found: #username, input[name='username']
```
**Solution:**
- Inspect the login page HTML
- Update selectors to match actual form elements
- Add more fallback selectors

#### 2. **Authentication Failed**
```
Error: Basic authentication failed - still on login page
```
**Solutions:**
- Check username/password credentials
- Verify login page URL is correct
- Check if submit button selector is working
- Add delay after form submission

#### 3. **Navigation Timeout**
```
Error: Navigation failed: Timeout 15000ms exceeded
```
**Solutions:**
- Increase timeout in step configuration
- Check if website is accessible
- Verify network connectivity

### Debug Logging
Look for these log messages:
```
🔐 Using checklist auth configuration for URL: https://staging-checklist.k24.co.id
🔐 Handling form-based basic authentication...
🔐 Navigating to login page: https://staging-checklist.k24.co.id/login
🔐 Filled basic auth username: admin
🔐 Filled basic auth password
🔐 Basic auth form submitted successfully
✅ Basic authentication completed successfully
```

### Testing Configuration
```bash
# Test basic auth configuration
node test-basic-auth.js

# Run E2E test with basic auth
npm run test:e2e
```

## 🛡️ Security Best Practices

### 1. **Credential Management**
```json
{
  "basicAuth": {
    "username": "${BASIC_AUTH_USERNAME}",
    "password": "${BASIC_AUTH_PASSWORD}"
  }
}
```
- Use environment variables for credentials
- Don't commit passwords to version control
- Use different credentials for different environments

### 2. **Environment-Specific Config**
```bash
# .env.staging
BASIC_AUTH_USERNAME=staging-admin
BASIC_AUTH_PASSWORD=staging-secret-123

# .env.production  
BASIC_AUTH_USERNAME=prod-admin
BASIC_AUTH_PASSWORD=prod-secret-456
```

### 3. **Sensitive Data Handling**
- Basic auth passwords are not logged
- Form fills for sensitive fields are hidden in logs
- Screenshots don't capture password fields

## 🔄 Integration with Scenarios

### Scenario Configuration
```json
{
  "scenarios": [
    {
      "id": "login-test-staging",
      "name": "Test Staging Environment",
      "steps": [
        {
          "type": "navigate",
          "url": "https://staging-checklist.k24.co.id",
          // Basic auth will be handled automatically
        },
        {
          "type": "verify",
          "assertions": [
            {
              "type": "url",
              "condition": "not_contains",
              "value": "/login"
            }
          ]
        }
      ]
    }
  ]
}
```

### API Usage
```javascript
// POST /api/test/run
{
  "testTypes": ["e2e"],
  "selectedScenarios": ["login-test-staging"],
  "runOnlySelected": true
}
```

## 📊 Monitoring & Analytics

### Success Metrics
- ✅ Basic auth completion rate
- ⏱️ Authentication time
- 🔄 Retry attempts
- 📊 Target-specific success rates

### Log Analysis
```bash
# Search for auth-related logs
grep "Basic auth" logs/test-*.log

# Check auth success rate
grep "authentication completed successfully" logs/test-*.log | wc -l
```

## 🚀 Advanced Features

### 1. **Conditional Authentication**
```javascript
// Custom logic for when to apply basic auth
const needsBasicAuth = url.includes('staging') || url.includes('dev');
```

### 2. **Multi-Step Authentication**
```json
{
  "basicAuth": {
    "enabled": true,
    "multiStep": true,
    "steps": [
      {
        "type": "fill",
        "selector": "#username",
        "value": "admin"
      },
      {
        "type": "click", 
        "selector": "#next-btn"
      },
      {
        "type": "fill",
        "selector": "#password",
        "value": "secret123"
      },
      {
        "type": "click",
        "selector": "#login-btn"
      }
    ]
  }
}
```

### 3. **Dynamic Credentials**
```javascript
// Load credentials from external source
const credentials = await loadCredentialsFromVault(environment);
config.auth.basicAuth.username = credentials.username;
config.auth.basicAuth.password = credentials.password;
```

## 📋 Checklist for Implementation

### Pre-Testing
- [ ] Configure basic auth credentials
- [ ] Test selectors on target website manually
- [ ] Verify login page accessibility
- [ ] Set up environment variables for sensitive data

### Configuration
- [ ] Enable basic auth in config
- [ ] Set correct username/password
- [ ] Configure form selectors
- [ ] Set appropriate timeouts
- [ ] Test with `test-basic-auth.js`

### Testing
- [ ] Run single scenario with basic auth
- [ ] Verify auth logs appear correctly
- [ ] Check scenario completes successfully
- [ ] Test with different browsers
- [ ] Validate in CI/CD pipeline

### Production Readiness
- [ ] Use environment-specific credentials
- [ ] Configure proper error handling
- [ ] Set up monitoring and alerts
- [ ] Document auth requirements for team

---

## 🆘 Support & Troubleshooting

### Quick Fixes
1. **Can't find login form**: Update selectors in config
2. **Wrong credentials**: Check username/password in config
3. **Timeout issues**: Increase timeout values
4. **Navigation problems**: Verify loginPage URL

### Getting Help
1. Run `node test-basic-auth.js` for configuration validation
2. Check browser developer tools for actual selectors
3. Enable verbose logging for detailed auth flow
4. Test manually in browser first

### Common Selector Patterns
```css
/* Username fields */
#username, #email, #login, input[name="username"], input[type="email"]

/* Password fields */  
#password, #pass, input[name="password"], input[type="password"]

/* Submit buttons */
input[type="submit"], button[type="submit"], .btn-login, .login-btn
```

**Happy Testing with Basic Auth! 🔐🚀** 