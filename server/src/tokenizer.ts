import * as helpers from './helper';
import { Token } from './helper';
import log from './log';

const tokenize = (input: string) => {

    let tokens: Token[] = [];
    let currentLine = 1;         // Track the current line number
    let currentCharacter = 0;    // Track the current character position within the line
    let ignoreSpaces = true;     // flag to indicate if spaces should be ignored

    helpers.resetCursor();

    while (helpers.getCursor() < input.length) {
        const startCursor = helpers.getCursor();  // Save the cursor position for later

        // Handle newlines (advance to the next line and reset character position)
        if (helpers.isNewLine(helpers.peekCharacters(input, 2))) {
            const startChar = helpers.getCursor();
            helpers.getCharacter(input);  // Consume the CR
            helpers.getCharacter(input);  // Consume the newline LF
            tokens.push({
                type: 'NewLine',
                value: '<CR><LF>',
                line: currentLine,
                startCharacter: startChar,
                endCharacter: helpers.getCursor()
            });
            currentLine += 1;
            currentCharacter = 0;  // Reset character position at the start of the new line
            continue;
        }

        if (helpers.isNumericBase(input) || helpers.isNumber(helpers.peekCharacter(input))) {

            const startChar = currentCharacter;

            let base = '';
            let number = '';
            let suffix = '';
            let baseLength = helpers.isNumericBase(input);

            if (baseLength) {
                base = helpers.getCharacters(input, baseLength);
                currentCharacter += base.length;
                log.write('DEBUG', `isSpecialCharacter retuned true with symbol = ${base}.`)
            }

            number = helpers.getCharacter(input);
            currentCharacter += 1;
            log.write('DEBUG', `isNumber retuned true with number = ${number}.`)

            while (helpers.getCursor() < input.length &&
                helpers.isNumber(helpers.peekCharacter(input), base) ||
                (helpers.isDot(helpers.peekCharacter(input)) &&
                    helpers.isNumber(helpers.peekCharacterAt(input, 1)))) {
                number += helpers.getCharacter(input);
                currentCharacter += 1;
            }

            let suffixLength = helpers.isNumericSuffix(input);

            if (suffixLength) {
                suffix = helpers.getCharacters(input, suffixLength);
                currentCharacter += base.length;
                log.write('DEBUG', `isSpecialCharacter retuned true with symbol = ${base}.`)
            }

            // TODO: need to parse subfix D, F, %D and %F

            tokens.push({
                type: 'Number',
                value: base + number + suffix,
                line: currentLine,
                startCharacter: startChar,
                endCharacter: currentCharacter
            });
            log.write('DEBUG', `Number Found = ${JSON.stringify(tokens[tokens.length - 1])}.`)
            continue;
        }

        if (helpers.isLetter(helpers.peekCharacter(input), ignoreSpaces)) {
            const startChar = currentCharacter;
            let symbol = helpers.getCharacter(input);
            currentCharacter += 1;
            log.write('DEBUG', `isLetter retuned true with symbol = ${symbol}.`)

            while (helpers.getCursor() < input.length &&
                  (helpers.isLetter(helpers.peekCharacter(input), ignoreSpaces) ||
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
                else
                    if (helpers.isOperator(symbol)) {
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
            } else {
                tokens.push({
                    type: 'Name',
                    value: symbol,
                    line: currentLine,
                    startCharacter: startChar,
                    endCharacter: currentCharacter
                });
            }
            log.write('DEBUG', `Letter Found = ${JSON.stringify(tokens[tokens.length - 1])}.`)
            continue;
        }

        let specialCharLength = 0;
        if (specialCharLength = helpers.isSpecialCharacter(input)) {
            const startChar = currentCharacter;
            let symbol = helpers.getCharacters(input, specialCharLength);
            currentCharacter += symbol.length;
            log.write('DEBUG', `isSpecialCharacter retuned true with symbol = ${symbol}.`)

            if (symbol) {
                if (symbol === ".") {
                    if (helpers.isDataType(helpers.getPreviousTokenValue(tokens))) {
                        log.write('DEBUG', `isDataType retuned true with number = ${symbol}.`)

                        tokens.push({
                            type: 'Indirection',
                            value: symbol,
                            line: currentLine,
                            startCharacter: startChar,
                            endCharacter: currentCharacter
                        });
                        log.write('DEBUG', `Indirection Found = ${JSON.stringify(tokens[tokens.length - 1])}.`)
                        continue;
                    } else {
                        log.write('DEBUG', `isDataType retuned FALSE with number = ${symbol}.`)

                        tokens.push({
                            type: 'Delimiter',
                            value: symbol,
                            line: currentLine,
                            startCharacter: startChar,
                            endCharacter: currentCharacter
                        });
                        log.write('DEBUG', `Delimiter Found = ${JSON.stringify(tokens[tokens.length - 1])}.`)
                        continue;
                    }
                }
                if (helpers.isOpeneningComment(symbol)) {
                    log.write('DEBUG', `isOpeneningComment retuned true with number = ${symbol}.`)
                    ignoreSpaces = !ignoreSpaces;
                    tokens.push({
                        type: 'Comment',
                        value: symbol,
                        line: currentLine,
                        startCharacter: startChar,
                        endCharacter: currentCharacter
                    });
                    log.write('DEBUG', `isOpeneningComment Found = ${JSON.stringify(tokens[tokens.length - 1])}.`)
                    continue;
                }
                if (helpers.isSingleLineComment(symbol)) {
                    log.write('DEBUG', `isSingleLineComment retuned true with number = ${symbol}.`)

                    tokens.push({
                        type: 'CommentLine',
                        value: symbol,
                        line: currentLine,
                        startCharacter: startChar,
                        endCharacter: currentCharacter
                    });
                    log.write('DEBUG', `isSingleLineComment Found = ${JSON.stringify(tokens[tokens.length - 1])}.`)
                    continue;
                }
                if (helpers.isCompilerDirectiveLine(symbol) && startChar === 0) {
                    log.write('DEBUG', `CompilerDirective retuned true with number = ${symbol}.`)

                    tokens.push({
                        type: 'DirectiveLine',
                        value: symbol,
                        line: currentLine,
                        startCharacter: startChar,
                        endCharacter: currentCharacter
                    });
                    log.write('DEBUG', `Directive Found = ${JSON.stringify(tokens[tokens.length - 1])}.`)
                    continue;
                }
                if (helpers.isBaseAddressSymbol(symbol)) {
                    const type = helpers.isReadOnlyArray(symbol)
                        ? "ReadOnlyArray"
                        : "BaseAddressEquivalence";
                    tokens.push({
                        type: type,
                        value: symbol,
                        line: currentLine,
                        startCharacter: startChar,
                        endCharacter: currentCharacter
                    });
                    log.write('DEBUG', `Delimiter Found = ${JSON.stringify(tokens[tokens.length - 1])}.`)
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
                    log.write('DEBUG', `Delimiter Found = ${JSON.stringify(tokens[tokens.length - 1])}.`)
                    continue;
                }
                if (helpers.isDelimiter(symbol)) {
                    if (helpers.isQuote(symbol)) ignoreSpaces = !ignoreSpaces;
                    tokens.push({
                        type: 'Delimiter',
                        value: symbol,
                        line: currentLine,
                        startCharacter: startChar,
                        endCharacter: currentCharacter
                    });
                    log.write('DEBUG', `Delimiter Found = ${JSON.stringify(tokens[tokens.length - 1])}.`)
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
                    log.write('DEBUG', `Operator Found = ${JSON.stringify(tokens[tokens.length - 1])}.`)
                    continue;
                }
            }
        }

        if (helpers.isWhitespace(helpers.peekCharacter(input))) {
            helpers.getCharacter(input)
            currentCharacter += 1;  // Move to the next character
            continue;
        }

        log.write('DEBUG', `skiping unknown character = ${helpers.getCharacter(input)}.`);
        helpers.getCharacter(input);  // Advance the cursor to avoid an infinite loop
        currentCharacter += 1;
        //throw new Error(`${helpers.peekCharacter(input)} is not valid.`);
    }
    return tokens;
};

export default tokenize;