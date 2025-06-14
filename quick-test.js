const { chromium } = require('playwright');
const fs = require('fs-extra');

async function quickTest() {
    console.log('🚀 Quick Login Test untuk K24...\n');
    
    const config = await fs.readJson('config.json');
    console.log(`📋 URL: ${config.url}`);
    console.log(`👤 Username: ${config.username}`);
    console.log(`🔐 Basic Auth: ${config.basicAuth.enabled ? 'Enabled' : 'Disabled'}`);
    console.log(`⚙️  React Mode: ${config.reactMode.enabled ? 'Enabled' : 'Disabled'}\n`);
    
    const browser = await chromium.launch({ headless: false });
    const contextOptions = {
        viewport: { width: 1366, height: 768 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ignoreHTTPSErrors: true
    };

    if (config.basicAuth?.enabled) {
        console.log('✅ Mengkonfigurasi Basic Auth...');
        contextOptions.httpCredentials = {
            username: config.basicAuth.username,
            password: config.basicAuth.password
        };
    }

    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();
    
    try {
        console.log('🌐 Navigasi ke halaman...');
        await page.goto(config.url, { waitUntil: 'networkidle', timeout: 30000 });
        
        console.log('🔍 Mencari elemen login...');
        
        // Find username field
        let usernameField = null;
        for (const selector of config.selectors.login.usernameFields) {
            const element = await page.$(selector);
            if (element) {
                const isVisible = await element.isVisible();
                if (isVisible) {
                    usernameField = element;
                    console.log(`✅ Username field ditemukan: ${selector}`);
                    break;
                }
            }
        }
        
        // Find password field
        let passwordField = null;
        for (const selector of config.selectors.login.passwordFields) {
            const element = await page.$(selector);
            if (element) {
                const isVisible = await element.isVisible();
                if (isVisible) {
                    passwordField = element;
                    console.log(`✅ Password field ditemukan: ${selector}`);
                    break;
                }
            }
        }
        
        // Find submit button
        let submitButton = null;
        for (const selector of config.selectors.login.submitButtons) {
            const element = await page.$(selector);
            if (element) {
                const isVisible = await element.isVisible();
                if (isVisible) {
                    submitButton = element;
                    console.log(`✅ Submit button ditemukan: ${selector}`);
                    break;
                }
            }
        }
        
        if (!usernameField) {
            console.log('❌ Username field tidak ditemukan');
            return;
        }
        
        if (!passwordField) {
            console.log('❌ Password field tidak ditemukan');
            return;
        }
        
        if (!submitButton) {
            console.log('❌ Submit button tidak ditemukan');
            return;
        }
        
        console.log('\n📝 Mengisi form login...');
        
        // Fill username
        await usernameField.click();
        await usernameField.fill('');
        await page.waitForTimeout(500);
        await usernameField.type(config.username, { delay: 100 });
        console.log('✅ Username berhasil diisi');
        
        // Fill password
        await passwordField.click();
        await passwordField.fill('');
        await page.waitForTimeout(500);
        await passwordField.type(config.password, { delay: 100 });
        console.log('✅ Password berhasil diisi');
        
        // Take screenshot before submit
        await page.screenshot({ path: 'before-submit.png' });
        console.log('📸 Screenshot sebelum submit: before-submit.png');
        
        await page.waitForTimeout(2000);
        
        console.log('\n🚀 Mengirim form...');
        
        // Submit form
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }),
            submitButton.click()
        ]);
        
        // Take screenshot after submit
        await page.screenshot({ path: 'after-submit.png' });
        console.log('📸 Screenshot setelah submit: after-submit.png');
        
        // Check if login successful
        const currentUrl = page.url();
        console.log(`\n📍 URL setelah submit: ${currentUrl}`);
        
        // Check for login indicators
        const loginSuccess = !currentUrl.includes('login') && !await page.$('input[type="password"]');
        
        if (loginSuccess) {
            console.log('✅ LOGIN BERHASIL!');
        } else {
            console.log('❌ Login gagal atau masih di halaman login');
            
            // Check for error messages
            const errorSelectors = ['.error', '.alert', '.message'];
            for (const selector of errorSelectors) {
                const errorElement = await page.$(selector);
                if (errorElement) {
                    const errorText = await errorElement.textContent();
                    console.log(`❌ Error message: ${errorText}`);
                }
            }
        }
        
        console.log('\n⏸️  Browser tetap terbuka untuk inspeksi...');
        console.log('❓ Tekan Enter untuk menutup...');
        
        // Wait for user input
        await new Promise(resolve => {
            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.on('data', () => {
                resolve();
            });
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        await page.screenshot({ path: 'error-screenshot.png' });
        console.log('📸 Error screenshot: error-screenshot.png');
    } finally {
        await browser.close();
        console.log('✅ Browser ditutup');
    }
}

quickTest().catch(console.error); 