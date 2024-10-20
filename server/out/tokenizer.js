"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers = require("./helper");
const log_1 = require("./log");
const tokenize = (input) => {
    let tokens = [];
    let currentLine = 1; // Track the current line number
    let currentCharacter = 0; // Track the current character position within the line
    helpers.resetCursor();
    while (helpers.getCursor() < input.length) {
        const startCursor = helpers.getCursor(); // Save the cursor position for later
        // Handle newlines (advance to the next line and reset character position)
        if (helpers.isNewLine(helpers.peekCharacters(input, 2))) {
            const startChar = helpers.getCursor();
            helpers.getCharacter(input); // Consume the CR
            helpers.getCharacter(input); // Consume the newline LF
            tokens.push({
                type: 'NewLine',
                value: '<CR><LF>',
                line: currentLine,
                startCharacter: startChar,
                endCharacter: helpers.getCursor()
            });
            currentLine += 1;
            currentCharacter = 0; // Reset character position at the start of the new line
            continue;
        }
        if (helpers.isNumber(helpers.peekCharacter(input))) {
            const startChar = currentCharacter;
            let number = helpers.getCharacter(input);
            currentCharacter += 1;
            log_1.default.write('DEBUG', `isNumber retuned true with number = ${number}.`);
            while (helpers.isNumber(helpers.peekCharacter(input))) {
                number += helpers.getCharacter(input);
                currentCharacter += 1;
            }
            tokens.push({
                type: 'Number',
                value: number,
                line: currentLine,
                startCharacter: startChar,
                endCharacter: currentCharacter
            });
            log_1.default.write('DEBUG', `Number Found = ${JSON.stringify(tokens[tokens.length - 1])}.`);
            continue;
        }
        if (helpers.isLetter(helpers.peekCharacter(input))) {
            const startChar = currentCharacter;
            let symbol = helpers.getCharacter(input);
            currentCharacter += 1;
            log_1.default.write('DEBUG', `isLetter retuned true with symbol = ${symbol}.`);
            /**
             * We want to account for words, so we look ahead in our
             * string to see if the next character is a letter.
             *
             * We assume white space is the end of a word.5679--++
             * --
             */
            while (helpers.getCursor() < input.length &&
                (helpers.isLetter(helpers.peekCharacter(input)) ||
                    helpers.isNumber(helpers.peekCharacter(input)))) {
                symbol += helpers.getCharacter(input);
                currentCharacter += 1;
            }
            if (helpers.isKeyword(symbol)) {
                if (helpers.isDataType(symbol)) {
                    tokens.push({
                        type: 'DataType',
                        value: symbol,
                        line: currentLine,
                        startCharacter: startChar,
                        endCharacter: currentCharacter
                    });
                }
                else if (helpers.isOperator(symbol)) {
                    tokens.push({
                        type: 'Operator',
                        value: symbol,
                        line: currentLine,
                        startCharacter: startChar,
                        endCharacter: currentCharacter
                    });
                }
                else {
                    tokens.push({
                        type: 'Keyword',
                        value: symbol,
                        line: currentLine,
                        startCharacter: startChar,
                        endCharacter: currentCharacter
                    });
                }
            }
            else {
                tokens.push({
                    type: 'Name',
                    value: symbol,
                    line: currentLine,
                    startCharacter: startChar,
                    endCharacter: currentCharacter
                });
            }
            log_1.default.write('DEBUG', `Letter Found = ${JSON.stringify(tokens[tokens.length - 1])}.`);
            continue;
        }
        let specialCharLength = 0;
        if (specialCharLength = helpers.isSpecialCharacter(input)) {
            const startChar = currentCharacter;
            let symbol = helpers.getCharacters(input, specialCharLength);
            currentCharacter += symbol.length;
            log_1.default.write('DEBUG', `isSpecialCharacter retuned true with symbol = ${symbol}.`);
            if (symbol) {
                if (symbol === ".") {
                    if (helpers.isDataType(helpers.getLastValue(tokens))) {
                        log_1.default.write('DEBUG', `isDataType retuned true with number = ${symbol}.`);
                        tokens.push({
                            type: 'Indirection',
                            value: symbol,
                            line: currentLine,
                            startCharacter: startChar,
                            endCharacter: currentCharacter
                        });
                        log_1.default.write('DEBUG', `Indirection Found = ${JSON.stringify(tokens[tokens.length - 1])}.`);
                        continue;
                    }
                    else {
                        log_1.default.write('DEBUG', `isDataType retuned FALSE with number = ${symbol}.`);
                        tokens.push({
                            type: 'Delimiter',
                            value: symbol,
                            line: currentLine,
                            startCharacter: startChar,
                            endCharacter: currentCharacter
                        });
                        log_1.default.write('DEBUG', `Delimiter Found = ${JSON.stringify(tokens[tokens.length - 1])}.`);
                        continue;
                    }
                }
                if (helpers.isOpeneningComment(symbol)) {
                    log_1.default.write('DEBUG', `isOpeneningComment retuned true with number = ${symbol}.`);
                    tokens.push({
                        type: 'Comment',
                        value: symbol,
                        line: currentLine,
                        startCharacter: startChar,
                        endCharacter: currentCharacter
                    });
                    log_1.default.write('DEBUG', `isOpeneningComment Found = ${JSON.stringify(tokens[tokens.length - 1])}.`);
                    continue;
                }
                if (helpers.isSingleLineComment(symbol)) {
                    log_1.default.write('DEBUG', `isSingleLineComment retuned true with number = ${symbol}.`);
                    tokens.push({
                        type: 'CommentLine',
                        value: symbol,
                        line: currentLine,
                        startCharacter: startChar,
                        endCharacter: currentCharacter
                    });
                    log_1.default.write('DEBUG', `isSingleLineComment Found = ${JSON.stringify(tokens[tokens.length - 1])}.`);
                    continue;
                }
                if (helpers.isCompilerDirectiveLine(symbol) && startChar === 0) {
                    log_1.default.write('DEBUG', `CompilerDirective retuned true with number = ${symbol}.`);
                    tokens.push({
                        type: 'DirectiveLine',
                        value: symbol,
                        line: currentLine,
                        startCharacter: startChar,
                        endCharacter: currentCharacter
                    });
                    log_1.default.write('DEBUG', `Directive Found = ${JSON.stringify(tokens[tokens.length - 1])}.`);
                    continue;
                }
                if (helpers.isIndirection(symbol)) {
                    tokens.push({
                        type: 'Indirection',
                        value: symbol,
                        line: currentLine,
                        startCharacter: startChar,
                        endCharacter: currentCharacter
                    });
                    log_1.default.write('DEBUG', `Delimiter Found = ${JSON.stringify(tokens[tokens.length - 1])}.`);
                    continue;
                }
                if (helpers.isDelimiter(symbol)) {
                    tokens.push({
                        type: 'Delimiter',
                        value: symbol,
                        line: currentLine,
                        startCharacter: startChar,
                        endCharacter: currentCharacter
                    });
                    log_1.default.write('DEBUG', `Delimiter Found = ${JSON.stringify(tokens[tokens.length - 1])}.`);
                    continue;
                }
                if (helpers.isOperator(symbol)) {
                    tokens.push({
                        type: 'Operator',
                        value: symbol,
                        line: currentLine,
                        startCharacter: startChar,
                        endCharacter: currentCharacter
                    });
                    log_1.default.write('DEBUG', `Operator Found = ${JSON.stringify(tokens[tokens.length - 1])}.`);
                    continue;
                }
            }
        }
        if (helpers.isWhitespace(helpers.peekCharacter(input))) {
            helpers.getCharacter(input);
            currentCharacter += 1; // Move to the next character
            continue;
        }
        log_1.default.write('DEBUG', `skiping unknown character = ${helpers.getCharacter(input)}.`);
        helpers.getCharacter(input); // Advance the cursor to avoid an infinite loop
        currentCharacter += 1;
        //throw new Error(`${helpers.peekCharacter(input)} is not valid.`);
    }
    return tokens;
};
exports.default = tokenize;
//# sourceMappingURL=tokenizer.js.map