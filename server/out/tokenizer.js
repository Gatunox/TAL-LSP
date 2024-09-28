"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("./helper");
const log_1 = require("./log");
const tokenize = (input) => {
    let tokens = [];
    helper_1.default.resetCursor();
    while (helper_1.default.getCursor() < input.length) {
        /* SKIP all spaces */
        if (helper_1.default.isWhitespace(helper_1.default.peekCharacter(input))) {
            helper_1.default.getCharacter(input);
            continue;
        }
        /* SKIP line if we find -- */
        if (helper_1.default.isSingleLineComment(helper_1.default.peekCharacters(input, 2))) {
            let comment = helper_1.default.getCharacters(input, 2);
            log_1.default.write('DEBUG', `isSingleLineComment retuned true with value = ${comment}.`);
            while (helper_1.default.getCursor() < input.length && !helper_1.default.isCRLF(helper_1.default.peekCharacters(input, 2))) {
                comment += helper_1.default.getCharacter(input);
            }
            if (helper_1.default.getCursor() < input.length) {
                comment += helper_1.default.getCharacters(input, 2);
                log_1.default.write('DEBUG', `CRLF Found`);
            }
            log_1.default.write('DEBUG', `isSingleLineComment ingnoring: ${comment}.`);
            continue;
        }
        else if (helper_1.default.isComment(helper_1.default.peekCharacter(input))) {
            let comment = helper_1.default.getCharacters(input, 2);
            log_1.default.write('DEBUG', `isComment retuned true with value = ${comment}.`);
            while (helper_1.default.getCursor() < input.length &&
                !helper_1.default.isComment(helper_1.default.peekCharacter(input)) &&
                !helper_1.default.isCRLF(helper_1.default.peekCharacters(input, 2))) {
                comment += helper_1.default.getCharacter(input);
            }
            if (helper_1.default.getCursor() < input.length) {
                if (helper_1.default.isComment(helper_1.default.peekCharacter(input))) {
                    comment += helper_1.default.getCharacter(input);
                }
                else if (helper_1.default.isCRLF(helper_1.default.peekCharacters(input, 2))) {
                    comment += helper_1.default.getCharacters(input, 2);
                }
                log_1.default.write('DEBUG', `CRLF Found`);
            }
            log_1.default.write('DEBUG', `isComment ingnoring: ${comment}.`);
            continue;
        }
        /* SKIP line if we find ? */
        if (helper_1.default.isCompilerDirective(helper_1.default.peekCharacter(input))) {
            let directive = helper_1.default.getCharacter(input);
            log_1.default.write('DEBUG', `isCompilerDirective retuned true with number = ${directive}.`);
            tokens.push({
                type: 'Directive',
                value: directive,
            });
            log_1.default.write('DEBUG', `Directive Found = ${JSON.stringify(tokens[tokens.length - 1])}.`);
            continue;
        }
        else if (helper_1.default.isNumber(helper_1.default.peekCharacter(input))) {
            let number = helper_1.default.getCharacter(input);
            log_1.default.write('DEBUG', `isNumber retuned true with number = ${number}.`);
            /**
             * We want to account for multi-digit numbers, so we
             * look ahead in our string to see if the next character
             * is a number. We assume white space is the end of a number.
             */
            while (helper_1.default.isNumber(helper_1.default.peekCharacter(input))) {
                number += helper_1.default.getCharacter(input);
            }
            tokens.push({
                type: 'Number',
                value: parseInt(number, 10),
            });
            log_1.default.write('DEBUG', `Number Found = ${JSON.stringify(tokens[tokens.length - 1])}.`);
            continue;
        }
        else if (helper_1.default.isLetter(helper_1.default.peekCharacter(input))) {
            let symbol = helper_1.default.getCharacter(input);
            log_1.default.write('DEBUG', `isLetter retuned true with symbol = ${symbol}.`);
            /**
             * We want to account for words, so we look ahead in our
             * string to see if the next character is a letter.
             *
             * We assume white space is the end of a word.5679--++
             * --
             */
            while (helper_1.default.getCursor() < input.length && helper_1.default.isLetter(helper_1.default.peekCharacter(input))) {
                symbol += helper_1.default.getCharacter(input);
            }
            if (helper_1.default.isKeyword(symbol)) {
                if (helper_1.default.isDataType(symbol)) {
                    tokens.push({
                        type: 'DataType',
                        value: symbol,
                    });
                }
                else if (helper_1.default.isOperator(symbol)) {
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
        else if (helper_1.default.isQuote(helper_1.default.peekCharacter(input))) {
            let string = '';
            let startquote = helper_1.default.getCharacter(input);
            log_1.default.write('DEBUG', `isQuote retuned true with symbol = ${startquote}.`);
            while (helper_1.default.getCursor() < input.length && !helper_1.default.isQuote(helper_1.default.peekCharacter(input))) {
                string += helper_1.default.getCharacter(input);
            }
            let emdquote = helper_1.default.getCharacter(input);
            log_1.default.write('DEBUG', `isQuote retuned true with symbol = ${emdquote}.`);
            tokens.push({
                type: 'String',
                value: string,
            });
            log_1.default.write('DEBUG', `Quote Found = ${JSON.stringify(tokens[tokens.length - 1])}.`);
            continue;
        }
        else if (helper_1.default.isOperator(helper_1.default.peekCharacter(input))) {
            let symbol = helper_1.default.getCharacter(input);
            log_1.default.write('DEBUG', `isOperator retuned true with symbol = ${symbol}.`);
            /**
             * We want to account for operator, so we look ahead in our
             * string to see if the next character is also part of an multichar operator
             *
             */
            while (helper_1.default.getCursor() < input.length && helper_1.default.isOperator(helper_1.default.peekCharacter(input))) {
                symbol += helper_1.default.getCharacter(input);
            }
            if (helper_1.default.isParenthesis(helper_1.default.peekCharacter(symbol))) {
                tokens.push({
                    type: 'Parenthesis',
                    value: helper_1.default.getCharacter(input),
                });
                log_1.default.write('DEBUG', `isParenthesis Found = ${JSON.stringify(tokens[tokens.length - 1])}.`);
                continue;
            }
            else if (helper_1.default.isSquareBrackets(helper_1.default.peekCharacter(symbol))) {
                tokens.push({
                    type: 'SquereBrackets',
                    value: helper_1.default.getCharacter(input),
                });
                log_1.default.write('DEBUG', `isSquareBrackets Found = ${JSON.stringify(tokens[tokens.length - 1])}.`);
                continue;
            }
            else if (helper_1.default.isAngleBrackets(helper_1.default.peekCharacter(symbol))) {
                tokens.push({
                    type: 'AngleBrackets',
                    value: helper_1.default.getCharacter(input),
                });
                log_1.default.write('DEBUG', `isAngleBrackets Found = ${JSON.stringify(tokens[tokens.length - 1])}.`);
                continue;
            }
            else
                tokens.push({
                    type: 'Operator',
                    value: helper_1.default.getCharacter(input),
                });
        }
        if (helper_1.default.isDelimiter(helper_1.default.peekCharacter(input))) {
            let delimiter = helper_1.default.getCharacter(input);
            log_1.default.write('DEBUG', `isCompilerDirective retuned true with number = ${delimiter}.`);
            while (helper_1.default.getCursor() < input.length && helper_1.default.isDelimiter(helper_1.default.peekCharacter(input))) {
                delimiter += helper_1.default.getCharacter(input);
            }
            tokens.push({
                type: 'Delimiter',
                value: delimiter,
            });
            log_1.default.write('DEBUG', `Delimiter Found = ${JSON.stringify(tokens[tokens.length - 1])}.`);
            continue;
        }
        log_1.default.write('DEBUG', `skiping unknown character = ${helper_1.default.getCharacter(input)}.`);
        //throw new Error(`${helpers.peekCharacter(input)} is not valid.`);
    }
    return tokens;
};
exports.default = tokenize;
//# sourceMappingURL=tokenizer.js.map