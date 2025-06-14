const fs = require('fs-extra');
const path = require('path');

class SessionHandler {
    constructor(logger) {
        this.context = null;
        this.logger = logger;
    }

    setContext(context) {
        this.context = context;
    }

    async saveSession(filePath = 'auth.json') {
        try {
            if (!this.context) {
                throw new Error('Browser context tidak tersedia');
            }

            this.logger.info(`Menyimpan session ke file: ${filePath}`);
            
            // Ensure directory exists
            const dir = path.dirname(filePath);
            await fs.ensureDir(dir);

            // Save storage state (cookies, localStorage, sessionStorage)
            await this.context.storageState({ path: filePath });
            
            this.logger.info('Session berhasil disimpan');
            return true;
        } catch (error) {
            this.logger.error('Gagal menyimpan session:', error);
            return false;
        }
    }

    async loadSession(filePath = 'auth.json') {
        try {
            const fullPath = path.resolve(filePath);
            const sessionExists = await fs.pathExists(fullPath);
            
            if (!sessionExists) {
                this.logger.warn(`File session tidak ditemukan: ${fullPath}`);
                return false;
            }

            this.logger.info(`Memuat session dari file: ${filePath}`);
            
            // Read and validate session file
            const sessionData = await fs.readJson(fullPath);
            if (!sessionData || (!sessionData.cookies && !sessionData.origins)) {
                this.logger.warn('File session tidak valid atau kosong');
                return false;
            }

            // Apply storage state to context
            if (this.context) {
                await this.context.addCookies(sessionData.cookies || []);
                this.logger.info('Session berhasil dimuat');
                return true;
            } else {
                this.logger.error('Browser context tidak tersedia untuk memuat session');
                return false;
            }
        } catch (error) {
            this.logger.error('Gagal memuat session:', error);
            return false;
        }
    }

    async createNewContextWithSession(browser, filePath = 'auth.json') {
        try {
            const fullPath = path.resolve(filePath);
            const sessionExists = await fs.pathExists(fullPath);
            
            if (!sessionExists) {
                this.logger.warn(`File session tidak ditemukan: ${fullPath}`);
                return null;
            }

            this.logger.info(`Membuat context baru dengan session: ${filePath}`);
            
            // Create new context with storage state
            const context = await browser.newContext({
                storageState: fullPath,
                viewport: { width: 1280, height: 720 },
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            });

            this.setContext(context);
            this.logger.info('Context baru dengan session berhasil dibuat');
            return context;
        } catch (error) {
            this.logger.error('Gagal membuat context dengan session:', error);
            return null;
        }
    }

    async getSessionInfo(filePath = 'auth.json') {
        try {
            const fullPath = path.resolve(filePath);
            const sessionExists = await fs.pathExists(fullPath);
            
            if (!sessionExists) {
                return {
                    exists: false,
                    message: 'File session tidak ditemukan'
                };
            }

            const sessionData = await fs.readJson(fullPath);
            const stats = await fs.stat(fullPath);
            
            const info = {
                exists: true,
                filePath: fullPath,
                fileSize: stats.size,
                lastModified: stats.mtime,
                cookieCount: sessionData.cookies ? sessionData.cookies.length : 0,
                originCount: sessionData.origins ? sessionData.origins.length : 0,
                domains: []
            };

            // Extract domains from cookies
            if (sessionData.cookies) {
                const domains = [...new Set(sessionData.cookies.map(cookie => cookie.domain))];
                info.domains = domains;
            }

            return info;
        } catch (error) {
            this.logger.error('Gagal mendapatkan info session:', error);
            return {
                exists: false,
                error: error.message
            };
        }
    }

    async clearSession(filePath = 'auth.json') {
        try {
            const fullPath = path.resolve(filePath);
            const sessionExists = await fs.pathExists(fullPath);
            
            if (sessionExists) {
                await fs.remove(fullPath);
                this.logger.info(`File session dihapus: ${fullPath}`);
                return true;
            } else {
                this.logger.warn('File session tidak ditemukan untuk dihapus');
                return false;
            }
        } catch (error) {
            this.logger.error('Gagal menghapus session:', error);
            return false;
        }
    }

    async validateSession(filePath = 'auth.json') {
        try {
            const info = await this.getSessionInfo(filePath);
            
            if (!info.exists) {
                return {
                    valid: false,
                    message: 'File session tidak ditemukan'
                };
            }

            // Check if session is too old (older than 7 days)
            const now = new Date();
            const sessionAge = now - new Date(info.lastModified);
            const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

            if (sessionAge > maxAge) {
                return {
                    valid: false,
                    message: 'Session terlalu lama (lebih dari 7 hari)',
                    age: Math.floor(sessionAge / (24 * 60 * 60 * 1000)) + ' hari'
                };
            }

            // Check if session has cookies
            if (info.cookieCount === 0) {
                return {
                    valid: false,
                    message: 'Session tidak memiliki cookie'
                };
            }

            return {
                valid: true,
                message: 'Session valid',
                info: info
            };
        } catch (error) {
            this.logger.error('Gagal memvalidasi session:', error);
            return {
                valid: false,
                message: 'Error validasi session: ' + error.message
            };
        }
    }

    async backupSession(filePath = 'auth.json', backupDir = 'backups') {
        try {
            const fullPath = path.resolve(filePath);
            const sessionExists = await fs.pathExists(fullPath);
            
            if (!sessionExists) {
                this.logger.warn('File session tidak ditemukan untuk backup');
                return false;
            }

            // Create backup filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFileName = `auth-backup-${timestamp}.json`;
            const backupPath = path.join(backupDir, backupFileName);

            // Ensure backup directory exists
            await fs.ensureDir(backupDir);

            // Copy session file to backup
            await fs.copy(fullPath, backupPath);
            
            this.logger.info(`Session berhasil dibackup ke: ${backupPath}`);
            return backupPath;
        } catch (error) {
            this.logger.error('Gagal backup session:', error);
            return false;
        }
    }

    async restoreSession(backupPath, targetPath = 'auth.json') {
        try {
            const backupExists = await fs.pathExists(backupPath);
            
            if (!backupExists) {
                this.logger.error(`File backup tidak ditemukan: ${backupPath}`);
                return false;
            }

            // Restore session from backup
            await fs.copy(backupPath, targetPath);
            
            this.logger.info(`Session berhasil direstore dari: ${backupPath}`);
            return true;
        } catch (error) {
            this.logger.error('Gagal restore session:', error);
            return false;
        }
    }

    async listBackups(backupDir = 'backups') {
        try {
            const backupDirExists = await fs.pathExists(backupDir);
            
            if (!backupDirExists) {
                return [];
            }

            const files = await fs.readdir(backupDir);
            const backupFiles = files.filter(file => file.startsWith('auth-backup-') && file.endsWith('.json'));
            
            const backups = [];
            for (const file of backupFiles) {
                const filePath = path.join(backupDir, file);
                const stats = await fs.stat(filePath);
                backups.push({
                    filename: file,
                    path: filePath,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime
                });
            }

            // Sort by creation date (newest first)
            backups.sort((a, b) => b.created - a.created);
            
            return backups;
        } catch (error) {
            this.logger.error('Gagal mendapatkan daftar backup:', error);
            return [];
        }
    }
}

module.exports = SessionHandler; 