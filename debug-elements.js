const { chromium } = require('playwright');
const fs = require('fs-extra');

async function debugElements() {
    console.log('🔍 Debug Elements - Mencari semua elemen input di halaman...\n');
    
    const config = await fs.readJson('config.json');
    console.log(`📋 Target URL: ${config.url}`);
    console.log(`🔐 Basic Auth: ${config.basicAuth.enabled ? 'Enabled' : 'Disabled'}\n`);
    
    const browser = await chromium.launch({ headless: false });
    const contextOptions = {
        viewport: { width: 1366, height: 768 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ignoreHTTPSErrors: true
    };

    // Add Basic Auth if enabled
    if (config.basicAuth?.enabled) {
        console.log('✅ Menggunakan Basic Authentication...');
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
        
        // Take screenshot
        await page.screenshot({ path: 'debug-page.png', fullPage: true });
        console.log('📸 Screenshot disimpan: debug-page.png\n');
        
        // Get all input elements
        console.log('🔍 Menganalisis semua elemen input...\n');
        
        const inputElements = await page.evaluate(() => {
            const inputs = Array.from(document.querySelectorAll('input'));
            return inputs.map(input => ({
                tagName: input.tagName,
                type: input.type || 'text',
                name: input.name || '',
                id: input.id || '',
                className: input.className || '',
                placeholder: input.placeholder || '',
                value: input.value || '',
                required: input.required,
                visible: input.offsetParent !== null,
                outerHTML: input.outerHTML
            }));
        });
        
        console.log(`📊 Ditemukan ${inputElements.length} elemen input:\n`);
        
        inputElements.forEach((input, index) => {
            console.log(`${index + 1}. ${input.tagName} (type: ${input.type})`);
            console.log(`   Name: "${input.name}"`);
            console.log(`   ID: "${input.id}"`);
            console.log(`   Class: "${input.className}"`);
            console.log(`   Placeholder: "${input.placeholder}"`);
            console.log(`   Visible: ${input.visible}`);
            console.log(`   Required: ${input.required}`);
            console.log(`   HTML: ${input.outerHTML.substring(0, 100)}...`);
            console.log('');
        });
        
        // Look for forms
        console.log('📝 Menganalisis form elements...\n');
        
        const formElements = await page.evaluate(() => {
            const forms = Array.from(document.querySelectorAll('form'));
            return forms.map(form => ({
                action: form.action || '',
                method: form.method || '',
                id: form.id || '',
                className: form.className || '',
                innerHTML: form.innerHTML
            }));
        });
        
        console.log(`📊 Ditemukan ${formElements.length} form:\n`);
        
        formElements.forEach((form, index) => {
            console.log(`${index + 1}. FORM`);
            console.log(`   Action: "${form.action}"`);
            console.log(`   Method: "${form.method}"`);
            console.log(`   ID: "${form.id}"`);
            console.log(`   Class: "${form.className}"`);
            console.log('   Content preview:', form.innerHTML.substring(0, 200).replace(/\s+/g, ' '));
            console.log('');
        });
        
        // Look for buttons
        console.log('🔘 Menganalisis button elements...\n');
        
        const buttonElements = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"]'));
            return buttons.map(button => ({
                tagName: button.tagName,
                type: button.type || '',
                name: button.name || '',
                id: button.id || '',
                className: button.className || '',
                textContent: button.textContent?.trim() || '',
                value: button.value || '',
                visible: button.offsetParent !== null,
                outerHTML: button.outerHTML
            }));
        });
        
        console.log(`📊 Ditemukan ${buttonElements.length} button:\n`);
        
        buttonElements.forEach((button, index) => {
            console.log(`${index + 1}. ${button.tagName} (type: ${button.type})`);
            console.log(`   Name: "${button.name}"`);
            console.log(`   ID: "${button.id}"`);
            console.log(`   Class: "${button.className}"`);
            console.log(`   Text: "${button.textContent}"`);
            console.log(`   Value: "${button.value}"`);
            console.log(`   Visible: ${button.visible}`);
            console.log(`   HTML: ${button.outerHTML.substring(0, 100)}...`);
            console.log('');
        });
        
        // Generate suggested selectors
        console.log('💡 SUGGESTED SELECTORS:\n');
        
        const usernameInputs = inputElements.filter(input => 
            input.type === 'text' || input.type === 'email' ||
            input.name.toLowerCase().includes('user') ||
            input.name.toLowerCase().includes('email') ||
            input.name.toLowerCase().includes('login') ||
            input.id.toLowerCase().includes('user') ||
            input.id.toLowerCase().includes('email') ||
            input.id.toLowerCase().includes('login')
        );
        
        console.log('🔑 Username field candidates:');
        usernameInputs.forEach(input => {
            const selectors = [];
            if (input.name) selectors.push(`input[name="${input.name}"]`);
            if (input.id) selectors.push(`#${input.id}`);
            if (input.type !== 'text') selectors.push(`input[type="${input.type}"]`);
            
            console.log(`   - ${selectors.join(' OR ')}`);
            console.log(`     HTML: ${input.outerHTML.substring(0, 80)}...`);
        });
        
        const passwordInputs = inputElements.filter(input => input.type === 'password');
        
        console.log('\n🔒 Password field candidates:');
        passwordInputs.forEach(input => {
            const selectors = [];
            if (input.name) selectors.push(`input[name="${input.name}"]`);
            if (input.id) selectors.push(`#${input.id}`);
            selectors.push(`input[type="password"]`);
            
            console.log(`   - ${selectors.join(' OR ')}`);
            console.log(`     HTML: ${input.outerHTML.substring(0, 80)}...`);
        });
        
        const submitButtons = buttonElements.filter(button => 
            button.type === 'submit' ||
            button.textContent.toLowerCase().includes('login') ||
            button.textContent.toLowerCase().includes('masuk') ||
            button.textContent.toLowerCase().includes('sign in')
        );
        
        console.log('\n🚀 Submit button candidates:');
        submitButtons.forEach(button => {
            const selectors = [];
            if (button.name) selectors.push(`${button.tagName.toLowerCase()}[name="${button.name}"]`);
            if (button.id) selectors.push(`#${button.id}`);
            if (button.type) selectors.push(`${button.tagName.toLowerCase()}[type="${button.type}"]`);
            
            console.log(`   - ${selectors.join(' OR ')}`);
            console.log(`     Text: "${button.textContent}"`);
            console.log(`     HTML: ${button.outerHTML.substring(0, 80)}...`);
        });
        
        // Save analysis to file
        const analysis = {
            url: config.url,
            timestamp: new Date().toISOString(),
            inputElements,
            formElements,
            buttonElements,
            suggestions: {
                usernameFields: usernameInputs.map(input => {
                    const selectors = [];
                    if (input.name) selectors.push(`input[name="${input.name}"]`);
                    if (input.id) selectors.push(`#${input.id}`);
                    if (input.type !== 'text') selectors.push(`input[type="${input.type}"]`);
                    return selectors;
                }).flat(),
                passwordFields: passwordInputs.map(input => {
                    const selectors = [];
                    if (input.name) selectors.push(`input[name="${input.name}"]`);
                    if (input.id) selectors.push(`#${input.id}`);
                    selectors.push(`input[type="password"]`);
                    return selectors;
                }).flat(),
                submitButtons: submitButtons.map(button => {
                    const selectors = [];
                    if (button.name) selectors.push(`${button.tagName.toLowerCase()}[name="${button.name}"]`);
                    if (button.id) selectors.push(`#${button.id}`);
                    if (button.type) selectors.push(`${button.tagName.toLowerCase()}[type="${button.type}"]`);
                    return selectors;
                }).flat()
            }
        };
        
        await fs.writeJson('debug-analysis.json', analysis, { spaces: 2 });
        console.log('\n💾 Analisis lengkap disimpan ke: debug-analysis.json');
        
        console.log('\n⏸️  Browser tetap terbuka untuk inspeksi manual...');
        console.log('❓ Tekan Enter untuk menutup browser...');
        
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
    } finally {
        await browser.close();
        console.log('✅ Browser ditutup');
    }
}

// Run debug
debugElements().catch(console.error); 