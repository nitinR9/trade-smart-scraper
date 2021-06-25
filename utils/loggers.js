// import winston from 'winston' ;

// const { format, transports } = winston ;
// const { combine, label, colorize, timestamp, errors, printf } = format ;

const winston = require('winston') ;
const { format, transports } = winston ;
const { combine, label, colorize, timestamp, errors, printf } = format ;

const logFormat = printf( ({ level, message, timestamp, stack, label }) => {
    return `${timestamp} [${label}] ${level}: ${stack || message}`
}) ;

module.exports.getDevLogger = (type) => {
    const devLogger = winston.createLogger({
        format: combine(
            label({
                label: type
            }),
            colorize(),
            timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            errors({
                stack: true
            }),
            logFormat
        ),
        transports: [
            new transports.Console()
        ]
    }) ;
    
    return devLogger ;
}

module.exports.getProdLogger = (type, filename) => {
    const prodLogger = winston.createLogger({
        format: combine(
            label({
                label: type
            }),
            timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            errors({
                stack: true
            }),
            logFormat
        ),
        transports: [
            new transports.File({
                dirname: 'logs',
                filename: `${filename}.log`,
            })
        ]
    }) ;

    return prodLogger ;
}