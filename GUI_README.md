# 🚀 Universal Test Automation Framework - Web GUI

Antarmuka web modern untuk menjalankan automated tests dengan mudah tanpa command line.

## ✨ Fitur GUI

### 🏠 Dashboard
- **Real-time Statistics**: Total tests, passed/failed, success rate
- **Recent Test History**: Lihat test terakhir yang dijalankan
- **Quick Actions**: Akses cepat ke konfigurasi dan reports
- **Welcome Guide**: Panduan untuk user baru

### ⚙️ Configuration Manager
- **Dynamic Config**: Edit semua parameter test secara visual
- **Import/Export**: Backup dan restore konfigurasi
- **Validation**: Real-time validation untuk input
- **Sectioned Interface**: Organized per kategori (Target, Auth, Browser, dll)

### ▶️ Test Runner
- **Visual Test Selection**: Pilih test types dengan checkbox
- **Real-time Monitoring**: Live log execution
- **Progress Tracking**: Status dan progress bar
- **Result Summary**: Instant result setelah test selesai

### 📊 Reports & Analytics
- **Interactive HTML Reports**: Clickable dan expandable sections
- **Test History**: Archive semua test results
- **Performance Metrics**: Charts dan graphs
- **Export Options**: Download dalam berbagai format

## 🚀 Cara Menjalankan GUI

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Buka Browser
```
http://localhost:3000
```

### 4. Production Build (untuk deployment)
```bash
npm run build
npm start
```

## 🎯 Penggunaan GUI

### Dashboard
1. Buka `http://localhost:3000`
2. Lihat statistik test di cards atas
3. Gunakan **Quick Actions** untuk:
   - Configure Tests
   - View Reports
   - Run Quick Tests

### Konfigurasi Tests
1. Klik **Configuration** di sidebar
2. Edit parameter per section:
   - **Target Application**: URL dan informasi aplikasi
   - **Authentication**: Username, password, selectors
   - **Browser Settings**: Headless, browser type, timeout
   - **Test Types**: Enable/disable test categories
   - **Performance**: Thresholds dan metrics
3. **Save Configuration** untuk menyimpan
4. **Export** untuk backup atau **Import** untuk restore

### Menjalankan Tests
1. Klik **Run Tests** di sidebar
2. Pilih test types yang ingin dijalankan:
   - ☑️ Smoke Tests
   - ☑️ Security Tests  
   - ☑️ Performance Tests
   - ☑️ E2E Tests
   - dll.
3. Set options:
   - Generate HTML Report
   - Verbose Logging
   - Headless Mode
4. Klik **Start Tests**
5. Monitor real-time log di panel kanan
6. Lihat hasil di **Test Results** panel

### Melihat Reports
1. Klik **Reports** di sidebar
2. Browse semua test results
3. Klik report untuk detail
4. Download HTML/JSON reports

## 🔧 Deployment ke Vercel

### 1. Push ke GitHub
```bash
git add .
git commit -m "Add web GUI"
git push origin main
```

### 2. Connect ke Vercel
1. Buka [vercel.com](https://vercel.com)
2. Import project dari GitHub
3. Deploy otomatis

### 3. Environment Variables (jika diperlukan)
```
NODE_ENV=production
```

### 4. Build Commands
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

## 📁 Struktur File GUI

```
├── pages/
│   ├── _app.js              # Next.js app wrapper
│   ├── index.js             # Dashboard page
│   ├── configuration.js     # Config management page
│   ├── test-runner.js       # Test execution page
│   ├── reports.js           # Reports viewer page
│   └── api/
│       ├── dashboard.js     # Dashboard API
│       ├── config.js        # Configuration API
│       └── test/
│           └── run.js       # Test execution API
├── components/
│   ├── Layout.js            # Main layout with sidebar
│   ├── DashboardStats.js    # Statistics cards
│   ├── QuickActions.js      # Quick action buttons
│   ├── RecentTests.js       # Recent test history
│   └── ConfigSection.js     # Config form sections
├── styles/
│   └── globals.css          # Global Tailwind styles
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS config
└── postcss.config.js        # PostCSS config
```

## 🎨 Features Detail

### Real-time Test Execution
- **Server-Sent Events**: Live streaming of test output
- **Progress Indicators**: Visual progress bars dan spinners
- **Log Categorization**: Info, warning, error dengan colors
- **Stop Functionality**: Cancel running tests

### Dynamic Configuration
- **Form Validation**: Real-time input validation
- **Conditional Fields**: Show/hide based on selections
- **Backup System**: Auto-backup sebelum save
- **Reset to Defaults**: Quick reset functionality

### Responsive Design
- **Mobile Friendly**: Works di tablet dan mobile
- **Adaptive Layout**: Sidebar collapse di mobile
- **Touch Optimized**: Button sizes untuk touch screens
- **Progressive Web App**: Installable di mobile

## 🚀 Production Tips

### Performance Optimization
- Next.js automatic code splitting
- Image optimization
- Static generation untuk halaman statis
- API caching

### Security
- Input sanitization
- CSRF protection
- Rate limiting untuk API
- Secure headers

### Monitoring
- Error tracking dengan Sentry (optional)
- Performance monitoring
- Usage analytics
- Health checks

## 🆘 Troubleshooting

### Port sudah digunakan
```bash
# Gunakan port berbeda
npm run dev -- -p 3001
```

### Build errors
```bash
# Clear cache
rm -rf .next
npm run build
```

### API tidak respond
- Check apakah TestRunner.js path benar
- Verify config directory exists
- Check file permissions

### Browser tidak kebuka di test runner
- Pastikan Playwright terinstall
- Check browser config di configuration page
- Verify test type selection

## 🔮 Future Enhancements

- **Test Scheduling**: Cron-based scheduled tests
- **Team Collaboration**: Multi-user support
- **CI/CD Integration**: GitHub Actions, Jenkins
- **Advanced Analytics**: Trends, predictions
- **Custom Plugins**: Extensible architecture
- **WebSocket**: Real-time collaboration
- **Database**: Persistent test history

---

🎉 **Selamat! Anda sekarang dapat menjalankan automated tests dengan GUI yang user-friendly!** 