import * as helpers from './helper';
import { Token } from './helper';
import log from './log';

// Helper function to add tokens to the list and log them
const addToken = (tokens: Token[], type: string, value: string, line: number, startChar: number, endChar: number) => {
    const token = { type, value, line, startCharacter: startChar, endCharacter: endChar };
    tokens.push(token);
    log.write('DEBUG', `${type} Found = ${JSON.stringify(token)}.`);
};

// Handle newlines
const handleNewline = (input: string, tokens: Token[], currentLine: number, currentCharacter: number) => {
    helpers.getCharacter(input); // Consume CR
    helpers.getCharacter(input); // Consume LF
    return { newLine: currentLine + 1, newCharPos: 0 };
};

// Handle numbers with base and suffix
const handleNumber = (input: string, tokens: Token[], currentLine: number, currentCharacter: number) => {
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

// Handle identifiers or DataTypes or NonreserverdKeywords or keywords
const handleIdentifier = (input: string, tokens: Token[], currentLine: number, currentCharacter: number) => {
    const startChar = currentCharacter;
    let symbol = helpers.getCharacter(input);
    currentCharacter++;

    while (helpers.isLetter(helpers.peekCharacter(input), true) || 
           helpers.isNumber(helpers.peekCharacter(input))) {
        symbol += helpers.getCharacter(input);
        currentCharacter++;
    }

    if (helpers.isKeyword(symbol)) {
        let type: string;
        if (helpers.isDataType(symbol)) {
            type = 'DataType';
        } else if (helpers.isOperator(symbol)) {
            type = 'Operator';
        } else {
            type = 'Keyword';
        }
        addToken(tokens, type, symbol, currentLine, startChar, currentCharacter);
    } else if (helpers.isNonreservedKeyword(symbol)) { 
        addToken(tokens, 'NonReservedKeyword', symbol, currentLine, startChar, currentCharacter);
    } else {
        addToken(tokens, 'Identifier', symbol, currentLine, startChar, currentCharacter);
    }

    return currentCharacter;
};

// Handle special characters and operators
const handleSpecialCharacter = (input: string, tokens: Token[], currentLine: number, currentCharacter: number) => {
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
        } else {
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
const tokenize = (input: string) => {
    let tokens: Token[] = [];
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
            currentCharacter = handleIdentifier(input, tokens, currentLine, currentCharacter);
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
        log.write('DEBUG', `Skipping unknown character = ${helpers.getCharacter(input)}.`);
        currentCharacter++;
    }
    return tokens;
};

export default tokenize;