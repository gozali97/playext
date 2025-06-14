class FormTester {
    constructor(logger) {
        this.page = null;
        this.logger = logger;
        this.testResults = [];
        this.securityPayloads = {
            xss: [
                '<script>alert("XSS")</script>',
                '"><script>alert("XSS")</script>',
                'javascript:alert("XSS")',
                '"><img src=x onerror=alert("XSS")>',
                '\'><script>alert(String.fromCharCode(88,83,83))</script>'
            ],
            sqlInjection: [
                "' OR '1'='1",
                "' UNION SELECT * FROM users--",
                "'; DROP TABLE users;--",
                "admin'--",
                "' OR 1=1#"
            ],
            pathTraversal: [
                '../../../etc/passwd',
                '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
                '....//....//....//etc/passwd',
                '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd'
            ]
        };
    }

    setPage(page) {
        this.page = page;
    }

    async runAllTests() {
        try {
            this.logger.info('Memulai testing semua formulir di halaman...');
            this.testResults = [];

            // Scan untuk semua form di halaman
            const forms = await this.scanForms();
            this.logger.info(`Ditemukan ${forms.length} formulir untuk ditest`);

            for (let i = 0; i < forms.length; i++) {
                const form = forms[i];
                this.logger.info(`Testing formulir ${i + 1}/${forms.length}: ${form.action || 'No action'}`);
                
                const testResult = await this.testForm(form, i);
                this.testResults.push(testResult);
                
                // Delay between forms to avoid overwhelming the server
                await this.randomDelay(2000, 4000);
            }

            this.logger.info(`Testing selesai. Total: ${this.testResults.length} formulir ditest`);
            return this.testResults;
        } catch (error) {
            this.logger.error('Error selama testing formulir:', error);
            return this.testResults;
        }
    }

    async scanForms() {
        try {
            const forms = await this.page.evaluate(() => {
                const formElements = document.querySelectorAll('form');
                return Array.from(formElements).map((form, index) => {
                    const fields = Array.from(form.querySelectorAll('input, textarea, select')).map(field => ({
                        type: field.type || field.tagName.toLowerCase(),
                        name: field.name || field.id || `field_${Math.random().toString(36).substr(2, 9)}`,
                        id: field.id,
                        placeholder: field.placeholder,
                        required: field.required,
                        maxLength: field.maxLength,
                        pattern: field.pattern,
                        value: field.value
                    }));

                    return {
                        index: index,
                        action: form.action,
                        method: form.method || 'GET',
                        id: form.id,
                        className: form.className,
                        fields: fields,
                        hasSubmitButton: !!form.querySelector('button[type="submit"], input[type="submit"]')
                    };
                });
            });

            return forms;
        } catch (error) {
            this.logger.error('Error scanning forms:', error);
            return [];
        }
    }

    async testForm(formData, formIndex) {
        const testResult = {
            formIndex: formIndex,
            formId: formData.id,
            formAction: formData.action,
            formMethod: formData.method,
            fieldsCount: formData.fields.length,
            tests: [],
            summary: {
                totalTests: 0,
                passed: 0,
                failed: 0,
                errors: []
            },
            timestamp: new Date().toISOString()
        };

        try {
            // Test 1: Basic Form Filling dengan data valid
            const validDataTest = await this.testValidDataFilling(formIndex, formData);
            testResult.tests.push(validDataTest);

            // Test 2: Empty Form Submission (validation test)
            const emptyFormTest = await this.testEmptyFormSubmission(formIndex, formData);
            testResult.tests.push(emptyFormTest);

            // Test 3: Invalid Data Test
            const invalidDataTest = await this.testInvalidDataFilling(formIndex, formData);
            testResult.tests.push(invalidDataTest);

            // Test 4: Security Tests (XSS, SQL Injection, etc.)
            const securityTests = await this.runSecurityTests(formIndex, formData);
            testResult.tests.push(...securityTests);

            // Test 5: Boundary Tests (max length, etc.)
            const boundaryTest = await this.testBoundaryValues(formIndex, formData);
            testResult.tests.push(boundaryTest);

            // Calculate summary
            testResult.summary.totalTests = testResult.tests.length;
            testResult.summary.passed = testResult.tests.filter(t => t.success).length;
            testResult.summary.failed = testResult.tests.filter(t => !t.success).length;
            testResult.summary.errors = testResult.tests.filter(t => !t.success).map(t => t.error || t.message);

        } catch (error) {
            this.logger.error(`Error testing form ${formIndex}:`, error);
            testResult.summary.errors.push(error.message);
        }

        return testResult;
    }

    async testValidDataFilling(formIndex, formData) {
        const testName = 'Valid Data Filling';
        this.logger.info(`Running test: ${testName}`);
        
        try {
            const formSelector = this.getFormSelector(formData, formIndex);
            const form = await this.page.$(formSelector);
            
            if (!form) {
                return {
                    testName: testName,
                    success: false,
                    message: 'Form tidak ditemukan',
                    error: 'Form element not found'
                };
            }

            // Fill form dengan data valid
            const fillResults = [];
            for (const field of formData.fields) {
                const fillResult = await this.fillFieldWithValidData(field, formIndex);
                fillResults.push(fillResult);
            }

            // Submit form
            const submitResult = await this.submitForm(formIndex, formData);
            
            return {
                testName: testName,
                success: submitResult.success,
                message: submitResult.message,
                fieldsFilledCount: fillResults.filter(r => r.success).length,
                totalFields: formData.fields.length,
                submitResult: submitResult
            };
        } catch (error) {
            return {
                testName: testName,
                success: false,
                message: 'Error selama test valid data',
                error: error.message
            };
        }
    }

    async testEmptyFormSubmission(formIndex, formData) {
        const testName = 'Empty Form Submission (Validation Test)';
        this.logger.info(`Running test: ${testName}`);
        
        try {
            // Clear all form fields
            const formSelector = this.getFormSelector(formData, formIndex);
            await this.clearAllFields(formSelector);
            
            // Try to submit empty form
            const submitResult = await this.submitForm(formIndex, formData);
            
            // Check for validation messages
            const validationMessages = await this.getValidationMessages();
            
            return {
                testName: testName,
                success: !submitResult.success || validationMessages.length > 0,
                message: submitResult.success ? 
                    'Form diterima tanpa validasi (mungkin ada masalah keamanan)' : 
                    'Form ditolak dengan benar untuk data kosong',
                validationMessages: validationMessages,
                submitResult: submitResult
            };
        } catch (error) {
            return {
                testName: testName,
                success: false,
                message: 'Error selama test empty form',
                error: error.message
            };
        }
    }

    async testInvalidDataFilling(formIndex, formData) {
        const testName = 'Invalid Data Test';
        this.logger.info(`Running test: ${testName}`);
        
        try {
            const formSelector = this.getFormSelector(formData, formIndex);
            
            // Fill form dengan data tidak valid
            for (const field of formData.fields) {
                await this.fillFieldWithInvalidData(field, formIndex);
            }

            const submitResult = await this.submitForm(formIndex, formData);
            const validationMessages = await this.getValidationMessages();
            
            return {
                testName: testName,
                success: !submitResult.success || validationMessages.length > 0,
                message: submitResult.success ? 
                    'Form menerima data tidak valid (potensi masalah)' : 
                    'Form menolak data tidak valid dengan benar',
                validationMessages: validationMessages,
                submitResult: submitResult
            };
        } catch (error) {
            return {
                testName: testName,
                success: false,
                message: 'Error selama test invalid data',
                error: error.message
            };
        }
    }

    async runSecurityTests(formIndex, formData) {
        const securityTests = [];
        
        // XSS Test
        const xssTest = await this.testXSS(formIndex, formData);
        securityTests.push(xssTest);
        
        // SQL Injection Test
        const sqlTest = await this.testSQLInjection(formIndex, formData);
        securityTests.push(sqlTest);
        
        // Path Traversal Test
        const pathTest = await this.testPathTraversal(formIndex, formData);
        securityTests.push(pathTest);
        
        return securityTests;
    }

    async testXSS(formIndex, formData) {
        const testName = 'XSS Security Test';
        this.logger.info(`Running test: ${testName}`);
        
        try {
            const xssPayload = this.securityPayloads.xss[0]; // Use first XSS payload
            
            // Fill form with XSS payload
            for (const field of formData.fields) {
                if (field.type === 'text' || field.type === 'textarea') {
                    await this.fillField(field, formIndex, xssPayload);
                }
            }

            const submitResult = await this.submitForm(formIndex, formData);
            
            // Check if XSS payload is reflected or executed
            const pageContent = await this.page.content();
            const isXSSReflected = pageContent.includes(xssPayload) || pageContent.includes('alert("XSS")');
            
            return {
                testName: testName,
                success: !isXSSReflected,
                message: isXSSReflected ? 
                    'XSS payload terdeteksi di response (VULNERABILITY FOUND!)' : 
                    'XSS payload tidak terlihat di response (Good)',
                payload: xssPayload,
                isReflected: isXSSReflected
            };
        } catch (error) {
            return {
                testName: testName,
                success: false,
                message: 'Error selama XSS test',
                error: error.message
            };
        }
    }

    async testSQLInjection(formIndex, formData) {
        const testName = 'SQL Injection Security Test';
        this.logger.info(`Running test: ${testName}`);
        
        try {
            const sqlPayload = this.securityPayloads.sqlInjection[0];
            
            // Fill form with SQL injection payload
            for (const field of formData.fields) {
                if (field.type === 'text' || field.type === 'email' || field.type === 'password') {
                    await this.fillField(field, formIndex, sqlPayload);
                }
            }

            const submitResult = await this.submitForm(formIndex, formData);
            
            // Check for SQL error messages in response
            const pageContent = await this.page.content().toLowerCase();
            const sqlErrorPatterns = [
                'sql syntax',
                'mysql_fetch',
                'ora-01756',
                'microsoft ole db',
                'unclosed quotation',
                'quoted string not properly terminated'
            ];
            
            const hasSQLErrors = sqlErrorPatterns.some(pattern => pageContent.includes(pattern));
            
            return {
                testName: testName,
                success: !hasSQLErrors,
                message: hasSQLErrors ? 
                    'SQL error messages ditemukan (POTENTIAL SQL INJECTION VULNERABILITY!)' : 
                    'Tidak ada SQL error messages (Good)',
                payload: sqlPayload,
                hasSQLErrors: hasSQLErrors
            };
        } catch (error) {
            return {
                testName: testName,
                success: false,
                message: 'Error selama SQL injection test',
                error: error.message
            };
        }
    }

    async testPathTraversal(formIndex, formData) {
        const testName = 'Path Traversal Security Test';
        this.logger.info(`Running test: ${testName}`);
        
        try {
            const pathPayload = this.securityPayloads.pathTraversal[0];
            
            // Fill file upload fields or text fields with path traversal payload
            for (const field of formData.fields) {
                if (field.type === 'file' || field.type === 'text') {
                    await this.fillField(field, formIndex, pathPayload);
                }
            }

            const submitResult = await this.submitForm(formIndex, formData);
            
            // Check for system file contents in response
            const pageContent = await this.page.content().toLowerCase();
            const systemFilePatterns = [
                'root:x:0:0',
                '[extensions]',
                'windows registry editor'
            ];
            
            const hasSystemFiles = systemFilePatterns.some(pattern => pageContent.includes(pattern));
            
            return {
                testName: testName,
                success: !hasSystemFiles,
                message: hasSystemFiles ? 
                    'System file contents ditemukan (PATH TRAVERSAL VULNERABILITY!)' : 
                    'Tidak ada system file contents (Good)',
                payload: pathPayload,
                hasSystemFiles: hasSystemFiles
            };
        } catch (error) {
            return {
                testName: testName,
                success: false,
                message: 'Error selama path traversal test',
                error: error.message
            };
        }
    }

    async testBoundaryValues(formIndex, formData) {
        const testName = 'Boundary Values Test';
        this.logger.info(`Running test: ${testName}`);
        
        try {
            const boundaryResults = [];
            
            for (const field of formData.fields) {
                if (field.maxLength) {
                    // Test dengan data lebih panjang dari maxLength
                    const longData = 'A'.repeat(field.maxLength + 10);
                    await this.fillField(field, formIndex, longData);
                    
                    const fieldElement = await this.getFieldElement(field, formIndex);
                    const actualValue = await fieldElement.inputValue();
                    
                    boundaryResults.push({
                        fieldName: field.name,
                        maxLength: field.maxLength,
                        inputLength: longData.length,
                        actualLength: actualValue.length,
                        properlyTruncated: actualValue.length <= field.maxLength
                    });
                }
            }
            
            const allProperlyHandled = boundaryResults.every(r => r.properlyTruncated);
            
            return {
                testName: testName,
                success: allProperlyHandled,
                message: allProperlyHandled ? 
                    'Semua boundary values ditangani dengan benar' : 
                    'Beberapa field tidak menangani boundary values dengan benar',
                boundaryResults: boundaryResults
            };
        } catch (error) {
            return {
                testName: testName,
                success: false,
                message: 'Error selama boundary test',
                error: error.message
            };
        }
    }

    async fillFieldWithValidData(field, formIndex) {
        try {
            let validData = '';
            
            switch (field.type) {
                case 'email':
                    validData = 'test' + Math.random().toString(36).substr(2, 5) + '@example.com';
                    break;
                case 'password':
                    validData = 'ValidPassword123!';
                    break;
                case 'tel':
                case 'phone':
                    validData = '+1234567890';
                    break;
                case 'url':
                    validData = 'https://www.example.com';
                    break;
                case 'number':
                    validData = '42';
                    break;
                case 'date':
                    validData = '2024-01-01';
                    break;
                case 'text':
                case 'textarea':
                default:
                    validData = 'Valid test data ' + Math.random().toString(36).substr(2, 8);
                    break;
            }
            
            await this.fillField(field, formIndex, validData);
            return { success: true, field: field.name, data: validData };
        } catch (error) {
            return { success: false, field: field.name, error: error.message };
        }
    }

    async fillFieldWithInvalidData(field, formIndex) {
        try {
            let invalidData = '';
            
            switch (field.type) {
                case 'email':
                    invalidData = 'invalid-email-format';
                    break;
                case 'tel':
                case 'phone':
                    invalidData = 'not-a-phone-number';
                    break;
                case 'url':
                    invalidData = 'not-a-valid-url';
                    break;
                case 'number':
                    invalidData = 'not-a-number';
                    break;
                case 'date':
                    invalidData = '2024-13-45'; // Invalid date
                    break;
                default:
                    invalidData = ''; // Empty data for required fields
                    break;
            }
            
            await this.fillField(field, formIndex, invalidData);
            return { success: true, field: field.name, data: invalidData };
        } catch (error) {
            return { success: false, field: field.name, error: error.message };
        }
    }

    async fillField(field, formIndex, data) {
        try {
            const fieldElement = await this.getFieldElement(field, formIndex);
            
            if (!fieldElement) {
                throw new Error(`Field not found: ${field.name}`);
            }

            if (field.type === 'select') {
                // For select elements, choose first option or set value if possible
                await fieldElement.selectOption({ index: 0 });
            } else if (field.type === 'checkbox' || field.type === 'radio') {
                await fieldElement.check();
            } else if (field.type === 'file') {
                // Skip file uploads for now or use a test file
                this.logger.warn(`Skipping file upload field: ${field.name}`);
                return;
            } else {
                await fieldElement.fill(data);
            }
            
            await this.randomDelay(100, 300);
        } catch (error) {
            this.logger.warn(`Error filling field ${field.name}:`, error);
            throw error;
        }
    }

    async getFieldElement(field, formIndex) {
        try {
            const selectors = [
                `form:nth-of-type(${formIndex + 1}) [name="${field.name}"]`,
                `form:nth-of-type(${formIndex + 1}) #${field.id}`,
                `[name="${field.name}"]`,
                `#${field.id}`
            ].filter(Boolean);
            
            for (const selector of selectors) {
                const element = await this.page.$(selector);
                if (element) {
                    return element;
                }
            }
            
            return null;
        } catch (error) {
            this.logger.error(`Error getting field element for ${field.name}:`, error);
            return null;
        }
    }

    async submitForm(formIndex, formData) {
        try {
            const formSelector = this.getFormSelector(formData, formIndex);
            
            // Try to find submit button
            const submitSelectors = [
                `${formSelector} button[type="submit"]`,
                `${formSelector} input[type="submit"]`,
                `${formSelector} button:not([type])`,
                `${formSelector} .submit`,
                `${formSelector} .btn-submit`
            ];
            
            let submitted = false;
            for (const selector of submitSelectors) {
                const submitButton = await this.page.$(selector);
                if (submitButton) {
                    await submitButton.click();
                    submitted = true;
                    break;
                }
            }
            
            if (!submitted) {
                // Try to submit form directly
                const form = await this.page.$(formSelector);
                if (form) {
                    await form.evaluate(form => form.submit());
                    submitted = true;
                }
            }
            
            if (submitted) {
                await this.randomDelay(2000, 4000); // Wait for response
                return { success: true, message: 'Form berhasil disubmit' };
            } else {
                return { success: false, message: 'Submit button tidak ditemukan' };
            }
        } catch (error) {
            return { success: false, message: 'Error submitting form', error: error.message };
        }
    }

    async clearAllFields(formSelector) {
        try {
            const fields = await this.page.$$(`${formSelector} input, ${formSelector} textarea, ${formSelector} select`);
            
            for (const field of fields) {
                const tagName = await field.evaluate(el => el.tagName.toLowerCase());
                const type = await field.evaluate(el => el.type);
                
                if (tagName === 'input' && (type === 'text' || type === 'email' || type === 'password' || type === 'tel' || type === 'url')) {
                    await field.fill('');
                } else if (tagName === 'textarea') {
                    await field.fill('');
                } else if (type === 'checkbox' || type === 'radio') {
                    await field.uncheck();
                }
            }
        } catch (error) {
            this.logger.warn('Error clearing fields:', error);
        }
    }

    async getValidationMessages() {
        try {
            const validationSelectors = [
                '.error',
                '.validation-error',
                '.invalid-feedback',
                '.field-error',
                '[class*="error"]',
                '.alert-danger'
            ];
            
            const messages = [];
            for (const selector of validationSelectors) {
                const elements = await this.page.$$(selector);
                for (const element of elements) {
                    const text = await element.textContent();
                    if (text && text.trim()) {
                        messages.push(text.trim());
                    }
                }
            }
            
            return messages;
        } catch (error) {
            this.logger.warn('Error getting validation messages:', error);
            return [];
        }
    }

    getFormSelector(formData, formIndex) {
        if (formData.id) {
            return `#${formData.id}`;
        } else {
            return `form:nth-of-type(${formIndex + 1})`;
        }
    }

    async randomDelay(min = 1000, max = 3000) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        await this.page.waitForTimeout(delay);
    }
}

module.exports = FormTester;