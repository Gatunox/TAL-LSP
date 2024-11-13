"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers = require("./helper");
const log_1 = require("./log");
// Helper function to add tokens to the list and log them
const addToken = (tokens, type, value, line, startChar, endChar) => {
    const token = { type, value, line, startCharacter: startChar, endCharacter: endChar };
    tokens.push(token);
    log_1.default.write('DEBUG', `${type} Found = ${JSON.stringify(token)}.`);
};
// Handle newlines
const handleNewline = (input, tokens, currentLine, currentCharacter) => {
    helpers.getCharacter(input); // Consume CR
    helpers.getCharacter(input); // Consume LF
    return { newLine: currentLine + 1, newCharPos: 0 };
};
// Handle numbers with base and suffix
const handleNumber = (input, tokens, currentLine, currentCharacter) => {
    const startChar = currentCharacter;
    let base = '';
    let number = '';
    let suffix = '';
    const baseLength = helpers.isNumericBase(input);
    if (baseLength) {
        base = helpers.getCharacters(input, baseLength);
        currentCharacter += base.length;
    }
    number = helpers.getCharacter(input);
    currentCharacter++;
    while (helpers.isNumber(helpers.peekCharacter(input), base) ||
        (helpers.isDot(helpers.peekCharacter(input)) && helpers.isNumber(helpers.peekCharacterAt(input, 1)))) {
        number += helpers.getCharacter(input);
        currentCharacter++;
    }
    const suffixLength = helpers.isNumericSuffix(input);
    if (suffixLength) {
        suffix = helpers.getCharacters(input, suffixLength);
        currentCharacter += suffix.length;
    }
    addToken(tokens, 'Number', base + number + suffix, currentLine, startChar, currentCharacter);
    return currentCharacter;
};
// Handle identifiers and keywords
const handleIdentifierOrKeyword = (input, tokens, currentLine, currentCharacter) => {
    const startChar = currentCharacter;
    let symbol = helpers.getCharacter(input);
    currentCharacter++;
    while (helpers.isLetter(helpers.peekCharacter(input), true) || helpers.isNumber(helpers.peekCharacter(input))) {
        symbol += helpers.getCharacter(input);
        currentCharacter++;
    }
    if (helpers.isKeyword(symbol)) {
        const type = helpers.isDataType(symbol) ? 'DataType' : (helpers.isOperator(symbol) ? 'Operator' : 'Keyword');
        addToken(tokens, type, symbol, currentLine, startChar, currentCharacter);
    }
    else {
        addToken(tokens, 'Identifier', symbol, currentLine, startChar, currentCharacter);
    }
    return currentCharacter;
};
// Handle special characters and operators
const handleSpecialCharacter = (input, tokens, currentLine, currentCharacter) => {
    const startChar = currentCharacter;
    const specialCharLength = helpers.isSpecialCharacter(input);
    const symbol = helpers.getCharacters(input, specialCharLength);
    currentCharacter += symbol.length;
    if (helpers.isOpeneningComment(symbol)) {
        while (!helpers.isClosingComment(helpers.peekCharacter(input)) &&
            !helpers.isNewLine(helpers.peekCharacters(input, 2))) {
            helpers.getCharacter(input);
            currentCharacter++;
        }
        if (helpers.isClosingComment(helpers.peekCharacter(input))) {
            helpers.getCharacter(input);
            currentCharacter++;
        }
        return currentCharacter;
    }
    if (helpers.isSingleLineComment(symbol)) {
        while (!helpers.isEmpty(helpers.peekCharacter(input)) &&
            !helpers.isNewLine(helpers.peekCharacters(input, 2))) {
            helpers.getCharacter(input);
            currentCharacter++;
        }
        return currentCharacter;
    }
    if (helpers.isCompilerDirectiveLine(symbol) && startChar === 0) {
        addToken(tokens, 'DirectiveLine', symbol, currentLine, startChar, currentCharacter);
        return currentCharacter;
    }
    if (helpers.isBaseAddressSymbol(symbol)) {
        const type = helpers.isReadOnlyArray(symbol) ? "ReadOnlyArray" : "BaseAddressEquivalence";
        addToken(tokens, type, symbol, currentLine, startChar, currentCharacter);
        return currentCharacter;
    }
    if (helpers.isIndirection(symbol)) {
        addToken(tokens, 'Indirection', symbol.trim(), currentLine, startChar, currentCharacter);
        return currentCharacter;
    }
    if (helpers.isDelimiter(symbol)) {
        if (helpers.isQuote(symbol)) {
            let string = '';
            while (helpers.isNotQuote(helpers.peekCharacter(input))) {
                string += helpers.getCharacter(input);
            }
            helpers.getCharacter(input); // Consume the closing quote
            currentCharacter++;
            addToken(tokens, 'String', string, currentLine, startChar, currentCharacter);
        }
        else {
            addToken(tokens, 'Delimiter', symbol, currentLine, startChar, currentCharacter);
        }
        return currentCharacter;
    }
    if (helpers.isOperator(symbol)) {
        addToken(tokens, 'Operator', symbol, currentLine, startChar, currentCharacter);
        return currentCharacter;
    }
    return currentCharacter;
};
// Main tokenize function
const tokenize = (input) => {
    let tokens = [];
    let currentLine = 1;
    let currentCharacter = 0;
    helpers.resetCursor();
    while (helpers.getCursor() < input.length) {
        const startCursor = helpers.getCursor();
        const startChar = currentCharacter;
        if (helpers.isNewLine(helpers.peekCharacters(input, 2))) {
            const { newLine, newCharPos } = handleNewline(input, tokens, currentLine, currentCharacter);
            currentLine = newLine;
            currentCharacter = newCharPos;
            continue;
        }
        if (helpers.isNumericBase(input) || helpers.isNumber(helpers.peekCharacter(input))) {
            currentCharacter = handleNumber(input, tokens, currentLine, currentCharacter);
            continue;
        }
        if (helpers.isLetter(helpers.peekCharacter(input), true)) {
            currentCharacter = handleIdentifierOrKeyword(input, tokens, currentLine, currentCharacter);
            continue;
        }
        if (helpers.isSpecialCharacter(input)) {
            currentCharacter = handleSpecialCharacter(input, tokens, currentLine, currentCharacter);
            continue;
        }
        if (helpers.isWhitespace(helpers.peekCharacter(input))) {
            helpers.getCharacter(input);
            currentCharacter++;
            continue;
        }
        // Skip unknown character and avoid infinite loop
        log_1.default.write('DEBUG', `Skipping unknown character = ${helpers.getCharacter(input)}.`);
        currentCharacter++;
    }
    return tokens;
};
exports.default = tokenize;
//# sourceMappingURL=tokenizer.js.map