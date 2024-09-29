"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers = require("./helper");
const log_1 = require("./log");
const tokenize = (input) => {
    let tokens = [];
    let symbol = null;
    helpers.resetCursor();
    while (helpers.getCursor() < input.length) {
        if (helpers.isWhitespace(helpers.peekCharacter(input))) {
            helpers.getCharacter(input);
            continue;
        }
        if (helpers.isSingleLineComment(helpers.peekCharacters(input, 2))) {
            let comment = helpers.getCharacters(input, 2);
            log_1.default.write('DEBUG', `SingleLineComment retuned true with value = ${comment}.`);
            while (helpers.getCursor() < input.length && !helpers.isCRLF(helpers.peekCharacters(input, 2))) {
                comment += helpers.getCharacter(input);
            }
            if (helpers.getCursor() < input.length) {
                comment += helpers.getCharacters(input, 2);
                log_1.default.write('DEBUG', `CRLF Found`);
            }
            log_1.default.write('DEBUG', `SingleLineComment ingnoring: ${comment}.`);
            continue;
        }
        else if (helpers.isComment(helpers.peekCharacter(input))) {
            let comment = helpers.getCharacters(input, 2);
            log_1.default.write('DEBUG', `Comment retuned true with value = ${comment}.`);
            while (helpers.getCursor() < input.length &&
                !helpers.isComment(helpers.peekCharacter(input)) &&
                !helpers.isCRLF(helpers.peekCharacters(input, 2))) {
                comment += helpers.getCharacter(input);
            }
            if (helpers.getCursor() < input.length) {
                if (helpers.isComment(helpers.peekCharacter(input))) {
                    comment += helpers.getCharacter(input);
                }
                else if (helpers.isCRLF(helpers.peekCharacters(input, 2))) {
                    comment += helpers.getCharacters(input, 2);
                }
                log_1.default.write('DEBUG', `CRLF Found`);
            }
            log_1.default.write('DEBUG', `Comment ingnoring: ${comment}.`);
            continue;
        }
        /* SKIP line if we find ? */
        if (helpers.isCompilerDirective(helpers.peekCharacter(input))) {
            let directive = helpers.getCharacter(input);
            log_1.default.write('DEBUG', `CompilerDirective retuned true with number = ${directive}.`);
            tokens.push({
                type: 'Directive',
                value: directive,
            });
            log_1.default.write('DEBUG', `Directive Found = ${JSON.stringify(tokens[tokens.length - 1])}.`);
            continue;
        }
        else if (helpers.isNumber(helpers.peekCharacter(input))) {
            let number = helpers.getCharacter(input);
            log_1.default.write('DEBUG', `isNumber retuned true with number = ${number}.`);
            /**
             * We want to account for multi-digit numbers, so we
             * look ahead in our string to see if the next character
             * is a number. We assume white space is the end of a number.
             */
            while (helpers.isNumber(helpers.peekCharacter(input))) {
                number += helpers.getCharacter(input);
            }
            tokens.push({
                type: 'Number',
                value: parseInt(number, 10),
            });
            log_1.default.write('DEBUG', `Number Found = ${JSON.stringify(tokens[tokens.length - 1])}.`);
            continue;
        }
        else if (helpers.isLetter(helpers.peekCharacter(input))) {
            let symbol = helpers.getCharacter(input);
            log_1.default.write('DEBUG', `isLetter retuned true with symbol = ${symbol}.`);
            /**
             * We want to account for words, so we look ahead in our
             * string to see if the next character is a letter.
             *
             * We assume white space is the end of a word.5679--++
             * --
             */
            while (helpers.getCursor() < input.length && helpers.isLetter(helpers.peekCharacter(input))) {
                symbol += helpers.getCharacter(input);
            }
            if (helpers.isKeyword(symbol)) {
                if (helpers.isDataType(symbol)) {
                    tokens.push({
                        type: 'DataType',
                        value: symbol,
                    });
                }
                else if (helpers.isOperator(symbol)) {
                    tokens.push({
                        type: 'Operator',
                        value: symbol,
                    });
                }
                else {
                    tokens.push({
                        type: 'Keyword',
                        value: symbol,
                    });
                }
            }
            else {
                tokens.push({
                    type: 'Name',
                    value: symbol,
                });
            }
            log_1.default.write('DEBUG', `Letter Found = ${JSON.stringify(tokens[tokens.length - 1])}.`);
            continue;
        }
        else if (helpers.isQuote(helpers.peekCharacter(input))) {
            let string = '';
            let startquote = helpers.getCharacter(input);
            log_1.default.write('DEBUG', `isQuote retuned true with symbol = ${startquote}.`);
            while (helpers.getCursor() < input.length && !helpers.isQuote(helpers.peekCharacter(input))) {
                string += helpers.getCharacter(input);
            }
            let emdquote = helpers.getCharacter(input);
            log_1.default.write('DEBUG', `Quote retuned true with symbol = ${emdquote}.`);
            tokens.push({
                type: 'String',
                value: string,
            });
            log_1.default.write('DEBUG', `Quote Found = ${JSON.stringify(tokens[tokens.length - 1])}.`);
            continue;
        }
        else {
            symbol = helpers.isSpecialCharacter(input);
            log_1.default.write('DEBUG', `isSpecialCharacter retuned true with symbol = ${symbol}.`);
            if (symbol) {
                // Move cursor by the length of the matched symbol
                helpers.moveCursor(symbol.length);
                if (symbol === ".") {
                    if (helpers.isDataType(helpers.getLastValue(tokens))) {
                        tokens.push({
                            type: 'Indirection',
                            value: symbol,
                        });
                        log_1.default.write('DEBUG', `Indirection Found = ${JSON.stringify(tokens[tokens.length - 1])}.`);
                        continue;
                    }
                }
                if (helpers.isIndirection(symbol)) {
                    tokens.push({
                        type: 'Indirection',
                        value: symbol,
                    });
                    log_1.default.write('DEBUG', `Delimiter Found = ${JSON.stringify(tokens[tokens.length - 1])}.`);
                    continue;
                }
                if (helpers.isDelimiter(symbol)) {
                    tokens.push({
                        type: 'Delimiter',
                        value: symbol,
                    });
                    log_1.default.write('DEBUG', `Delimiter Found = ${JSON.stringify(tokens[tokens.length - 1])}.`);
                    continue;
                }
                if (helpers.isOperator(symbol)) {
                    tokens.push({
                        type: 'Operator',
                        value: symbol,
                    });
                    log_1.default.write('DEBUG', `Operator Found = ${JSON.stringify(tokens[tokens.length - 1])}.`);
                    continue;
                }
                if (helpers.isCRLF(symbol)) {
                    tokens.push({
                        type: 'CRLF',
                        value: symbol,
                    });
                    log_1.default.write('DEBUG', `Operator Found = ${JSON.stringify(tokens[tokens.length - 1])}.`);
                    continue;
                }
            }
        }
        log_1.default.write('DEBUG', `skiping unknown character = ${helpers.getCharacter(input)}.`);
        //throw new Error(`${helpers.peekCharacter(input)} is not valid.`);
    }
    return tokens;
};
exports.default = tokenize;
//# sourceMappingURL=tokenizer.js.map