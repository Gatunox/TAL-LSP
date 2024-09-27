import * as fs from "fs";

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

let logger:Logger | undefined = undefined;

interface LoggerOptions {
    level: LogLevel;
    directoryPath:string
    allowedProcs?: string[]; // List of allowed procedure (function) names
}

class Logger {
    private logg:fs.WriteStream;
    private logIsOpen: boolean = false;
    private level: LogLevel;
    private directoryPath:string;
    private allowedProcs?: string[];

    constructor(options: LoggerOptions) {
        
        const startTime = Date.now();

        this.level = options.level;
        this.directoryPath = options.directoryPath;
        this.allowedProcs = options.allowedProcs;

        this.logg = fs.createWriteStream(this.directoryPath + '/lsp.log');
        this.logIsOpen = true;
        this.logg.on('open', (fd) => {
            console.log(getCallerFunctionName() + ", " + `File descriptor: ${fd}`);
            console.log(`Time taken to open file: ${Date.now() - startTime} ms`);
        });
        this.logg.on('finish', () => {
            console.log(getCallerFunctionName() + ", " +`File write completed at: ${this.directoryPath + '/lsp.log'}`);
        });
        this.logg.on('error', (err) => {
            this.logIsOpen = false;
            console.error(getCallerFunctionName() + ", " + `Error writing to file:`, err);
        });
    }

    private getCallerFunctionName(logLevel: LogLevel,): string | undefined {
        const error = new Error();
        const stack = error.stack?.split("\n") || [];

        // this.logg.write(`[${logLevel}] stack: ${stack}\n`);
        if (stack && stack.length > 3) {
            const caller = stack[4].match(/at\s+(.*?)\s+\(/);
            if (caller && caller[1]) {
                const functionName = caller[1].split('.').pop();
                return functionName?.trim() || 'anonymous function';
            }
        }
        return "anonymous function";
    }

    private shouldLog(logLevel: LogLevel): boolean {
        const levels: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
        const currentLevelIndex = levels.indexOf(this.level);
        const logLevelIndex = levels.indexOf(logLevel);
        return logLevelIndex >= currentLevelIndex;
    }

    log(logLevel: LogLevel, message: object |string): void {
        if (!this.shouldLog(logLevel)) return;
        
        let isValidCallerName = true;
        const callerName = this.getCallerFunctionName(logLevel);

        // this.logg.write(`[${logLevel}] getCallerFunctionName returned: ${callerName}\n`);
        if (this.allowedProcs && this.allowedProcs.length > 0 && callerName) {
            if (!this.allowedProcs.includes(callerName)) return;
        }

        if (typeof message === "object"){

            if (!callerName || callerName === "anonymous function") {
                isValidCallerName = false; // Flag to consider the variable invalid
            }

            if (this.logIsOpen){
               this.logg.write(`[${logLevel}] ${isValidCallerName ? callerName + ' ' : ''}${JSON.stringify(message)}\n`);
            } else{
                console.log(`[${logLevel}] ${isValidCallerName ? callerName + ' ' : ''}${JSON.stringify(message)}`);
            }
        } else {
            const clearCR = message.replace(/\r/g, "<CR>");
            const clearLF = clearCR.replace(/\n/g, "<LF>");
            const clearMessage = clearLF;
            if (this.logIsOpen){
                this.logg.write(`[${logLevel}] ${callerName ? callerName + ' ' : ''}${clearMessage}\n`);
            } else{
                console.log(`[${logLevel}] ${callerName ? callerName + ' ' : ''}${clearMessage}`);
            }
        }
    }
}


function getCallerFunctionName(): string | undefined {
    // Create an Error object to capture the stack trace
    const error = new Error();
    const stack = error.stack?.split('\n');
    
    if (stack && stack.length >= 3) {
        // Stack trace format: 'at functionName (file:line:column)'
        // The 2nd item is the current function, the 3rd item is the caller
        const caller = stack[3].trim();
        // Split the string by spaces and filter out any empty strings
        const pieces = caller.trim().split(/\s+/);
        const source = pieces[pieces.length - 1].replace(/[()]/g, "");
        return source;
    }
    
    return undefined; // Return undefined if unable to determine caller
}

export default {Logger,
    init: (directoryPath:string): Boolean => {
        if (logger === undefined){
            logger = new Logger({ level: 'DEBUG', directoryPath, allowedProcs: [] });
            return true;
        }
        /*log = fs.createWriteStream(directoryPath + '/lsp.log');
        logger.on('open', (fd) => {
            logIsOpen = true;
            console.log(getCallerFunctionName() + ", " + "WriteStream created successfully. File descriptor:", fd);
        });
        logger.on('error', (err) => {
            logIsOpen = false;
            console.error(getCallerFunctionName() + ", " + "Error creating WriteStream:", err);
        });
        */
       return false;
    },
    write: (logLevel: LogLevel, message: object | string) => {
        if (!logger) {
            console.log(`logger is undefined, please call init first`);
        } else {
            logger.log(logLevel, message);
        }
        /*
        if (typeof message === "object"){
            if (logIsOpen){
                log.write(getCallerFunctionName() + ", " + JSON.stringify(message) + "\n");
            } else{
                console.log(getCallerFunctionName() + ", " + JSON.stringify(message))
            }
        } else {
            const clearCR = message.replace(/\r/g, "<CR>");
            const clearLF = clearCR.replace(/\n/g, "<LF>");
            const clearMessage = clearLF;
            if (logIsOpen){
                log.write(getCallerFunctionName() + ", " + clearMessage + "\n")
            } else{
                console.log(getCallerFunctionName() + ", " + clearMessage)
            }
        }
        */
    }
}

