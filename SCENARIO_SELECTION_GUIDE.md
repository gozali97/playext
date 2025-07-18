# 🎯 E2E Scenario Selection Guide

## Overview
Fitur **Scenario Selection** memungkinkan Anda untuk mengendalikan scenario E2E mana yang akan dijalankan, termasuk kemampuan untuk menandai scenario sebagai "Main Scenario" dan menjalankan hanya scenario tertentu saja.

## 🌟 Main Scenario Feature

### Apa itu Main Scenario?
**Main Scenario** adalah scenario utama yang akan dijalankan secara default ketika Anda menjalankan E2E testing. Hanya satu scenario yang bisa menjadi main scenario pada satu waktu.

### Keuntungan Main Scenario:
- ⚡ **Eksekusi Cepat**: Hanya menjalankan scenario yang paling penting
- 🎯 **Fokus Testing**: Ideal untuk development dan quick testing
- 🚀 **CI/CD Friendly**: Cocok untuk pipeline yang membutuhkan testing cepat
- 🛡️ **Smoke Testing**: Scenario utama biasanya adalah smoke test

### Cara Menggunakan:

#### 1. Via UI (Configuration Page)
1. Buka halaman **Configuration**
2. Pilih tab **E2E Scenarios**
3. Klik tombol **🌟 Main** pada scenario yang ingin dijadikan main
4. Scenario akan ditandai dengan icon 🌟 dan background kuning
5. Save configuration

#### 2. Via JSON Configuration
```json
{
  "testTypes": {
    "e2e": {
      "scenarios": [
        {
          "id": "login-logout-flow",
          "name": "Complete Login to Logout Flow KPI",
          "isMainScenario": true,  // ← Set sebagai main scenario
          "enabled": true,
          "critical": true
        }
      ]
    }
  }
}
```

## 🎯 Scenario Selection Modes

### Mode 1: Main Scenario Mode (Default)
```json
{
  "runOnlySelected": false
}
```
**Behavior:**
- Jika ada main scenario → jalankan main scenario saja
- Jika tidak ada main scenario → jalankan semua enabled scenarios

### Mode 2: Selected Scenarios Mode
```json
{
  "runOnlySelected": true,
  "selectedScenarios": ["scenario-1", "scenario-2"]
}
```
**Behavior:**
- Hanya menjalankan scenario yang ada di array `selectedScenarios`
- Mengabaikan setting main scenario

## 🎮 UI Controls

### Execution Control Panel
Di bagian atas halaman E2E Scenarios, Anda akan melihat panel kontrol:

```
🎯 Execution Control
┌─────────────────────────────────────────────────────────────┐
│ Run Mode:                    │ Current Selection:           │
│ ○ 🌟 Run Main Scenario       │ Mode: Main Scenario         │
│ ○ 🎯 Run Only Selected       │ Will run: Login Flow        │
└─────────────────────────────────────────────────────────────┘
```

### Scenario List dengan Controls
Setiap scenario memiliki kontrol:
- **Checkbox** (muncul saat Selected Mode): Untuk memilih scenario
- **🌟 Main Button**: Untuk menjadikan scenario sebagai main
- **Status Icons**: 
  - 🌟 = Main Scenario
  - 🔴 = Critical Scenario  
  - ✅ = Enabled Scenario
  - ❌ = Disabled Scenario

## 📡 API Usage

### 1. Run Main Scenario
```javascript
// POST /api/test/run
{
  "testTypes": ["e2e"]
}
```

### 2. Run Selected Scenarios
```javascript
// POST /api/test/run
{
  "testTypes": ["e2e"],
  "selectedScenarios": ["login-logout-flow", "form-submission-flow"],
  "runOnlySelected": true
}
```

### 3. API Response
```javascript
{
  "success": true,
  "results": { /* test results */ },
  "timestamp": "2025-01-17T10:30:00.000Z",
  "scenarioSelection": {
    "selectedScenarios": ["login-logout-flow"],
    "runOnlySelected": false
  }
}
```

## 🔧 Configuration Examples

### Example 1: Single Main Scenario
```json
{
  "testTypes": {
    "e2e": {
      "selectedScenarios": ["login-logout-flow"],
      "runOnlySelected": false,
      "scenarios": [
        {
          "id": "login-logout-flow",
          "name": "Login to Logout Flow",
          "isMainScenario": true,
          "enabled": true,
          "critical": true
        },
        {
          "id": "form-submission",
          "name": "Form Submission Test",
          "isMainScenario": false,
          "enabled": true,
          "critical": false
        }
      ]
    }
  }
}
```

### Example 2: Multiple Selected Scenarios
```json
{
  "testTypes": {
    "e2e": {
      "selectedScenarios": ["login-logout-flow", "form-submission"],
      "runOnlySelected": true,
      "scenarios": [
        // ... scenarios array
      ]
    }
  }
}
```

## 🚀 Use Cases

### 1. Development Phase
```
Mode: Main Scenario
Scenario: Basic login-logout flow
Purpose: Quick feedback during development
```

### 2. Pre-deployment Testing
```
Mode: Selected Scenarios
Scenarios: [Critical flows, Security tests, Performance tests]
Purpose: Comprehensive testing before release
```

### 3. CI/CD Pipeline
```
Stage 1: Main Scenario (fast feedback)
Stage 2: All Critical Scenarios (comprehensive check)
Stage 3: Full Test Suite (complete validation)
```

### 4. Debugging Specific Issues
```
Mode: Selected Scenarios
Scenarios: [Failing scenario only]
Purpose: Focused debugging and fixing
```

## 🎨 Visual Indicators

### Scenario Status dalam UI:
- **🌟 Main Scenario**: Background kuning, border kuning
- **🔴 Critical**: Red badge "Critical"
- **✅ Enabled**: Green dot indicator
- **❌ Disabled**: Gray dot indicator
- **☑️ Selected**: Checkbox checked (dalam Selected Mode)

### Execution Control Panel:
- **Mode Display**: Menampilkan mode aktif saat ini
- **Will Run**: Menampilkan scenario yang akan dieksekusi
- **Real-time Update**: Update otomatis saat konfigurasi berubah

## ⚡ Performance Benefits

### Main Scenario Mode:
- **Eksekusi 70-90% lebih cepat** dibanding full test suite
- **Resource usage minimal**: Hanya satu scenario
- **Feedback cepat**: Ideal untuk development loop

### Selected Scenarios Mode:
- **Fleksibilitas tinggi**: Pilih sesuai kebutuhan
- **Targeted testing**: Focus pada area spesifik
- **Parallel execution**: Bisa dijalankan parallel (jika dikonfigurasi)

## 🛠️ Troubleshooting

### Issue: Tidak ada scenario yang jalan
**Cause**: Tidak ada main scenario dan selectedScenarios kosong
**Solution**: 
1. Set salah satu scenario sebagai main, atau
2. Pilih scenario di Selected Mode

### Issue: Multiple main scenarios
**Cause**: Lebih dari satu scenario memiliki `isMainScenario: true`
**Solution**: Sistem akan otomatis unset yang lain saat Anda set main baru

### Issue: Selected scenarios tidak jalan
**Cause**: `runOnlySelected` masih `false`
**Solution**: Aktifkan "Run Only Selected Scenarios" mode

## 📊 Monitoring & Logging

### Log Messages:
```
🎯 Running selected scenarios: login-logout-flow, form-test
🌟 Running main scenarios: Complete Login Flow
🚀 Running all enabled scenarios
```

### Test Results:
```javascript
{
  "scenarioSelection": {
    "mode": "main", // or "selected" or "all"
    "executedScenarios": ["login-logout-flow"],
    "skippedScenarios": ["form-submission", "custom-flow"],
    "totalScenarios": 3
  }
}
```

## 🎯 Best Practices

### 1. Main Scenario Selection
- Pilih scenario yang **paling critical** dan **paling sering digunakan**
- Scenario main sebaiknya **comprehensive** tapi **tidak terlalu panjang**
- **Update main scenario** sesuai dengan perubahan aplikasi

### 2. Scenario Organization
- **Group related scenarios**: Login flows, Form flows, etc.
- **Use descriptive names**: Jelas dan mudah dipahami
- **Maintain dependencies**: Jika scenario A butuh scenario B

### 3. Testing Strategy
```
Daily Development: Main Scenario Only
Feature Testing: Selected Scenarios (related to feature)
Pre-release: All Critical Scenarios
Full Regression: All Enabled Scenarios
```

### 4. CI/CD Integration
```yaml
# Example GitHub Actions
- name: Quick E2E Test (Main Scenario)
  run: |
    curl -X POST http://localhost:3000/api/test/run \
    -H "Content-Type: application/json" \
    -d '{"testTypes": ["e2e"]}'

- name: Comprehensive E2E Test (Selected)
  run: |
    curl -X POST http://localhost:3000/api/test/run \
    -H "Content-Type: application/json" \
    -d '{
      "testTypes": ["e2e"],
      "selectedScenarios": ["login-flow", "critical-features"],
      "runOnlySelected": true
    }'
```

## 🔮 Advanced Features

### 1. Dynamic Scenario Selection
```javascript
// Programmatically select scenarios based on conditions
const scenarios = config.testTypes.e2e.scenarios;
const selectedScenarios = scenarios
  .filter(s => s.tags?.includes('smoke'))
  .map(s => s.id);

// Run API call with dynamic selection
```

### 2. Conditional Main Scenario
```javascript
// Set different main scenarios based on environment
const mainScenarioId = process.env.NODE_ENV === 'production' 
  ? 'comprehensive-flow' 
  : 'quick-smoke-test';
```

### 3. Scenario Tagging (Future Enhancement)
```json
{
  "id": "login-flow",
  "tags": ["smoke", "critical", "auth"],
  "isMainScenario": true
}
```

---

## 📞 Support

Jika Anda mengalami masalah atau membutuhkan bantuan:
1. Periksa log console untuk error messages
2. Verifikasi konfigurasi JSON valid
3. Test dengan script `test-scenario-selection.js`
4. Periksa dokumentasi E2E_SCENARIOS_GUIDE.md untuk detail scenario

**Happy Testing! 🚀** 