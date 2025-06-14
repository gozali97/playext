const winston = require('winston');
const path = require('path');

class Logger {
    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                winston.format.errors({ stack: true }),
                winston.format.printf(({ level, message, timestamp, stack }) => {
                    if (stack) {
                        return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`;
                    }
                    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
                })
            ),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    )
                }),
                new winston.transports.File({
                    filename: path.join('logs', 'error.log'),
                    level: 'error',
                    maxsize: 5242880, // 5MB
                    maxFiles: 5
                }),
                new winston.transports.File({
                    filename: path.join('logs', 'combined.log'),
                    maxsize: 5242880, // 5MB
                    maxFiles: 5
                })
            ]
        });

        // Create logs directory if it doesn't exist
        const fs = require('fs-extra');
        fs.ensureDirSync('logs');
    }

    info(message, meta = {}) {
        this.logger.info(message, meta);
    }

    warn(message, meta = {}) {
        this.logger.warn(message, meta);
    }

    error(message, error = null) {
        if (error instanceof Error) {
            this.logger.error(message, error);
        } else if (error) {
            this.logger.error(`${message}: ${error}`);
        } else {
            this.logger.error(message);
        }
    }

    debug(message, meta = {}) {
        this.logger.debug(message, meta);
    }

    setLevel(level) {
        this.logger.level = level;
    }
}

module.exports = Logger; 