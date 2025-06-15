# 🔧 Production Fixes Documentation

Dokumentasi lengkap untuk perbaikan error production dan optimasi deployment.

## 🚨 Masalah yang Diperbaiki

### 1. Error "Cannot find module 'yargs'"
**Masalah:** TestRunner.js mencoba menggunakan yargs di production environment tetapi dependency tidak tersedia atau tidak kompatibel.

**Solusi yang Diterapkan:**
- ✅ Menambahkan deteksi production environment
- ✅ Conditional loading yargs hanya saat diperlukan
- ✅ Fallback ke parsing manual command line arguments
- ✅ Membuat alternative test script tanpa dependency yargs

### 2. Optimasi Dependency Management
**Perbaikan:**
- ✅ Update package.json dengan dependency yang lebih optimal
- ✅ Menambahkan `rimraf` dan `sharp` untuk production
- ✅ Update Node.js requirement ke >=18.0.0
- ✅ Menambahkan `postinstall` script untuk Playwright

### 3. Vercel Deployment Optimization
**Konfigurasi:**
- ✅ Update vercel.json untuk Next.js 14
- ✅ Optimasi runtime nodejs18.x
- ✅ Environment variables untuk production
- ✅ Regional deployment (Singapore)

## 🛠️ Perbaikan Teknis

### TestRunner.js Enhancement
```javascript
// Conditional yargs loading berdasarkan environment
const isProductionEnv = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

if (!isProductionEnv || process.argv.length > 2) {
    try {
        yargs = require('yargs');
    } catch (error) {
        console.warn('⚠️  yargs not available, using programmatic mode');
    }
}
```

### Alternative Test Script
**File:** `scripts/test-local.js`
- Menjalankan test tanpa dependency yargs
- Cocok untuk production environment
- Konfigurasi manual dan fallback yang robust

### API Endpoint Improvements
**File:** `pages/api/test/run.js`
- Dual execution mode (direct import vs spawn)
- Better error handling
- Streaming output dengan Server-Sent Events
- Temporary configuration management

## 🚀 Cara Penggunaan

### Development Mode
```bash
# Menjalankan GUI development server
npm run dev

# Test menggunakan CLI (dengan yargs)
npm run test:smoke
npm run test:all

# Test tanpa yargs dependency
npm run test:local
```

### Production Mode
```bash
# Build untuk production
npm run build

# Start production server
npm run start

# Test di production environment
npm run test:local
```

### Vercel Deployment
```bash
# Deploy ke Vercel
vercel --prod

# Atau menggunakan Vercel CLI
vercel deploy --prod
```

## 📊 Testing Commands

### CLI Testing (Development)
```bash
# Test individual types
npm run test:unit
npm run test:integration
npm run test:functional
npm run test:e2e
npm run test:smoke
npm run test:performance
npm run test:load
npm run test:security

# Test semua types
npm run test:all

# Test dengan HTML report
node src/core/TestRunner.js --type=smoke --html
```

### Production Testing
```bash
# Test lokal tanpa yargs
npm run test:local

# Test dengan script langsung
node scripts/test-local.js

# Test via Web GUI
# Akses http://localhost:3000 dan gunakan interface
```

## 🔧 Environment Variables

### Development
```bash
NODE_ENV=development
```

### Production/Vercel
```bash
NODE_ENV=production
VERCEL=1
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
```

## 📁 File Structure Update

```
playext/
├── scripts/
│   └── test-local.js          # Alternative test script
├── src/core/
│   └── TestRunner.js          # Enhanced dengan conditional yargs
├── pages/api/test/
│   └── run.js                 # Improved API endpoint
├── package.json               # Updated dependencies
├── vercel.json                # Optimized untuk production
└── PRODUCTION_FIXES.md        # Dokumentasi ini
```

## 🌐 Web GUI Features

### Dashboard
- Real-time test statistics
- Recent test history
- Quick action buttons
- System health monitoring

### Configuration Management
- Dynamic configuration forms
- Import/export configurations
- Validation and preview
- Backup and restore

### Test Execution
- Visual test type selection
- Real-time progress monitoring
- Streaming output logs
- Interactive result viewing

### Reporting
- HTML report generation
- JSON data export
- Test history tracking
- Performance metrics

## 🔍 Troubleshooting

### Issue: "Cannot find module 'yargs'"
**Solution:** Sistem sekarang menggunakan conditional loading dan fallback manual parsing.

### Issue: Playwright browser not found
**Solution:** 
```bash
# Install Playwright browsers
npx playwright install --with-deps chromium
```

### Issue: Memory issues in production
**Solution:** 
- Gunakan `headless: true` untuk production
- Batasi concurrent tests
- Monitor memory usage

### Issue: API timeout
**Solution:**
- Increase maxDuration di vercel.json (saat ini 300s)
- Gunakan test types yang lebih ringan untuk production

## 📈 Performance Optimizations

### Browser Settings
```json
{
  "browser": {
    "headless": true,
    "slowMo": 0,
    "timeout": 30000
  }
}
```

### Test Execution
- Parallel test execution
- Optimized test selection
- Caching and reuse
- Resource cleanup

## 🔐 Security Considerations

- Sensitive credentials via environment variables
- Temporary file cleanup
- Input validation
- CORS configuration

## 📞 Support

Jika masih mengalami masalah:
1. Periksa logs di browser console
2. Verifikasi environment variables
3. Test dengan `npm run test:local`
4. Periksa Vercel function logs

---

**Status:** ✅ Semua masalah production telah diperbaiki
**Last Updated:** 2025-06-15
**Version:** 2.0.0 