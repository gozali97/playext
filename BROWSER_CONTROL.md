# 🌐 Browser Control Documentation

## Masalah yang Diperbaiki

**Problem**: Browser tidak terbuka/terlihat ketika menjalankan test karena konfigurasi `headless: true`

**Solution**: Menambahkan kontrol browser yang fleksibel melalui konfigurasi dan CLI options

## ✅ Perbaikan yang Telah Dilakukan

### 1. **Update Konfigurasi File**
```json
// config/basic-auth.json - SEBELUM
{
  "browser": {
    "headless": true  // ❌ Browser tidak terlihat
  }
}

// config/basic-auth.json - SESUDAH  
{
  "browser": {
    "headless": false,  // ✅ Browser terlihat
    "slowMo": 100       // ✅ Slow motion untuk debugging
  }
}
```

### 2. **Tambah CLI Options untuk Browser Control**
```bash
# Opsi baru yang tersedia:
--headless          # Paksa headless mode
--show-browser      # Paksa visible mode
```

### 3. **Auto Browser Mode Detection**
Framework sekarang otomatis menampilkan mode browser:
```
info: 🌐 Browser mode: visible
info: 🌐 Browser mode: headless
```

## 🚀 Cara Menggunakan

### **Method 1: Via Konfigurasi File**
```json
{
  "browser": {
    "headless": false,    // Browser terlihat
    "slowMo": 100,        // Delay 100ms antar action
    "timeout": 30000
  }
}
```

### **Method 2: Via CLI Flags**
```bash
# Paksa browser terlihat (override config)
node src/core/TestRunner.js --config=config/basic-auth.json --show-browser

# Paksa headless mode (override config)  
node src/core/TestRunner.js --config=config/basic-auth.json --headless

# Gunakan setting dari config file
node src/core/TestRunner.js --config=config/basic-auth.json
```

### **Method 3: Default Behavior**
```bash
# Tanpa flag, menggunakan setting dari config file
node src/core/TestRunner.js --config=config/basic-auth.json
```

## 📋 Template Konfigurasi Browser

### **Development Mode (Visible Browser)**
```json
{
  "browser": {
    "type": "chromium",
    "headless": false,
    "slowMo": 100,
    "timeout": 45000,
    "viewport": {
      "width": 1920,
      "height": 1080
    }
  }
}
```

### **Production Mode (Headless)**
```json
{
  "browser": {
    "type": "chromium", 
    "headless": true,
    "timeout": 30000,
    "viewport": {
      "width": 1920,
      "height": 1080
    }
  }
}
```

### **Debug Mode (Slow Motion)**
```json
{
  "browser": {
    "type": "chromium",
    "headless": false,
    "slowMo": 500,        // 500ms delay untuk debugging
    "timeout": 60000
  }
}
```

## 🎯 Contoh Penggunaan

### **Testing dengan Browser Terlihat**
```bash
# Basic auth dengan browser terlihat
node src/core/TestRunner.js --config=config/basic-auth.json --show-browser

# Semua test types dengan browser terlihat
node src/core/TestRunner.js --config=config/basic-auth.json --type=all --show-browser

# Dengan HTML report dan browser terlihat
node src/core/TestRunner.js --config=config/basic-auth.json --html --show-browser
```

### **Testing Headless untuk CI/CD**
```bash
# Headless mode untuk automation
node src/core/TestRunner.js --config=config/basic-auth.json --headless

# Production testing headless
node src/core/TestRunner.js --config=config/production.json --headless
```

## 🔧 Troubleshooting

### **Browser Tidak Terbuka**
1. ✅ Pastikan `"headless": false` di config file
2. ✅ Atau gunakan flag `--show-browser`
3. ✅ Check log untuk "Browser mode: visible"

### **Browser Terlalu Cepat**
1. ✅ Tambahkan `"slowMo": 500` di config
2. ✅ Increase timeout values
3. ✅ Gunakan debug mode

### **Browser Crash/Error**
1. ✅ Coba browser type lain: `"type": "firefox"`
2. ✅ Tambah browser args: `"args": ["--no-sandbox"]`
3. ✅ Increase memory: `"args": ["--max_old_space_size=4096"]`

## 📊 Hasil Testing

### ✅ **Yang Sudah Berhasil:**
- ✅ Browser terbuka dan terlihat dengan `--show-browser`
- ✅ Browser mode detection dan logging
- ✅ CLI override untuk headless/visible mode
- ✅ Konfigurasi file basic-auth.json sudah diperbaiki
- ✅ Authentication berjalan dengan baik
- ✅ All test types dapat dijalankan

### 🎯 **Command yang Berfungsi:**
```bash
# ✅ Browser terlihat dengan semua test types
node src/core/TestRunner.js --config=config/basic-auth.json

# ✅ Browser terlihat dengan smoke test only  
node src/core/TestRunner.js --config=config/basic-auth.json --type=smoke

# ✅ Paksa browser terlihat
node src/core/TestRunner.js --config=config/basic-auth.json --show-browser

# ✅ Paksa headless mode
node src/core/TestRunner.js --config=config/basic-auth.json --headless
```

## 🚀 Next Steps

1. **Customize Browser Settings** - Sesuaikan viewport, slowMo, timeout sesuai kebutuhan
2. **Create Environment-Specific Configs** - Buat config terpisah untuk dev/staging/prod
3. **Add Browser Extensions** - Tambahkan extensions untuk testing khusus
4. **Mobile Testing** - Setup mobile viewport untuk responsive testing

---

**Framework sekarang sudah memiliki kontrol browser yang fleksibel dan dapat disesuaikan dengan berbagai kebutuhan testing!** 🎉 