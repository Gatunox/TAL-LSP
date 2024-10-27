"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers = require("./helper");
const log_1 = require("./log");
let context = 'Global';
let index = 0;
let symbolsCache = new Map();
// Main Parsing Function
function parseTokens(tokens) {
    log_1.default.write('DEBUG', 'called:');
    index = 0;
    symbolsCache.clear();
    while (index < tokens.length) {
        if (!tokens[index])
            break;
        log_1.default.write('DEBUG', tokens[index]);
        if (tokens[index] && tokens[index].type === 'Comment') {
            parseComment(tokens);
        }
        else if (tokens[index] && tokens[index].type === 'CommentLine') {
            parseCommentLine(tokens);
        }
        else if (tokens[index] && tokens[index].type === 'DirectiveLine') {
            parseDirectives(tokens);
        }
        else if (tokens[index] && tokens[index].type === 'Keyword') {
            parseKeyword(tokens);
        }
        else if (tokens[index] && helpers.isDataType(tokens[index].value)) {
            parseDeclarations(tokens);
        }
        else {
            //log.write('DEBUG', 'Else Before:');
            //log.write('DEBUG', tokens[index]);
            index += 1;
            //log.write('DEBUG', 'Esle after:');
            //log.write('DEBUG', tokens[index]);
        }
    }
    return symbolsCache;
}
function parseComment(tokens) {
    log_1.default.write('DEBUG', 'called:');
    index += 1; // Move past the ! comment
    while (tokens[index] && tokens[index].type != 'Comment' && tokens[index].type != 'NewLine') {
        log_1.default.write('DEBUG', tokens[index]);
        index += 1; // move to next token; 
    }
    if (tokens[index] && tokens[index].type === 'Comment' && tokens[index].value === '!') {
        log_1.default.write('DEBUG', tokens[index]);
        index += 1; // Move past the !
    }
    return index;
}
function parseCommentLine(tokens) {
    log_1.default.write('DEBUG', 'called:');
    index += 1; // Move past the ! comment
    while (tokens[index] && tokens[index].type != 'NewLine') {
        log_1.default.write('DEBUG', tokens[index]);
        index += 1; // move to next token;
    }
    return index;
}
function parseDirectives(tokens) {
    log_1.default.write('DEBUG', 'called:');
    let key = '';
    index += 1; // Move past the ! comment
    while (tokens[index] && tokens[index].type != 'NewLine') {
        log_1.default.write('DEBUG', tokens[index]);
        if (tokens[index] && tokens[index].type === 'Comment') {
            parseComment(tokens);
        }
        else if (helpers.isSimpleCompilerDirective(tokens[index].value.toUpperCase())) {
            parseSimpleDirective(tokens);
        }
        else if (tokens[index].value.toUpperCase() === 'ASSERTION') {
            parseAssertionDirective(tokens);
        }
        else if (tokens[index].value.toUpperCase() === 'COLUMNS') {
            parseColumnsDirective(tokens);
        }
        else if (tokens[index].value.toUpperCase() === 'CROSSREF' ||
            tokens[index].value.toUpperCase() === 'NOCROSSREF') {
            parseCrossRefDirective(tokens);
        }
        else if (tokens[index].value.toUpperCase() === 'TARGET') {
            parseTargetDirective(tokens);
        }
        else if (tokens[index].value.toUpperCase() === 'SOURCE') {
            parseSourceDirective(tokens);
        }
        else {
            let directive = tokens[index];
            key = context + '.' + tokens[index].value;
            symbolsCache.set(key, {
                id: 'Directive',
                type: 'none',
                name: directive.value,
                size: 1,
                value: '',
                context: context,
                line: directive.line,
                startChar: directive.startCharacter,
                endChar: directive.endCharacter,
            });
            log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
            index += 1; // Move past the directive
            if (tokens[index].type === 'Delimiter' && tokens[index].value === ',') {
                log_1.default.write('DEBUG', tokens[index]);
                index += 1; // Move past the comma;
            }
        }
    }
    if (tokens[index] && tokens[index].type === 'NewLine' && tokens[index].value === '<CR><LF>') {
        log_1.default.write('DEBUG', tokens[index]);
        index += 1; // Move past the newline
    }
    return index;
}
function parseKeyword(tokens) {
    log_1.default.write('DEBUG', 'called:');
    if (tokens[index] && helpers.isLiteral(tokens[index].value)) {
        parseLiteral(tokens);
    }
    else if (tokens[index] && helpers.isDefine(tokens[index].value)) {
        parseDefine(tokens);
    }
    else {
        index += 1; // move to next token;
    }
    return index;
}
function parseLiteral(tokens) {
    log_1.default.write('DEBUG', 'called:');
    let key = '';
    index += 1; // Move past the LITERAL Keyword   
    while (index < tokens.length) {
        if (!tokens[index])
            break;
        if (tokens[index].value === ';')
            break;
        while (index < tokens.length && tokens[index].type != 'Identifier') {
            log_1.default.write('DEBUG', tokens[index]);
            index += 1; // move to next token; 
        }
        let indent = tokens[index];
        index += 1; // Move passa the Identifier
        if (tokens[index].type === 'Delimiter' && tokens[index].value === '=') {
            log_1.default.write('DEBUG', tokens[index]);
            index += 1; // Move past the =;
        }
        log_1.default.write('DEBUG', tokens[index]);
        let value = tokens[index].value;
        index += 1; // Move passa constant value
        while (index < tokens.length && tokens[index].value !== ',' && tokens[index].value !== ';') {
            log_1.default.write('DEBUG', tokens[index]);
            value += tokens[index].value;
            index += 1;
        }
        key = context + '.' + indent.value;
        symbolsCache.set(key, {
            id: 'Literal',
            type: '',
            name: indent.value,
            size: 1,
            value: value,
            context: context,
            line: indent.line,
            startChar: indent.startCharacter,
            endChar: indent.endCharacter,
        });
        log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
        if (tokens[index] && tokens[index].type === 'Delimiter' && tokens[index].value === ',') {
            log_1.default.write('DEBUG', tokens[index]);
            index += 1; // Move past comma, since we do not have to skip the ;
        }
    }
    if (index < tokens.length && tokens[index].type === 'Delimiter' && tokens[index].value === ';') {
        log_1.default.write('DEBUG', tokens[index]);
        index += 1; // Move past comma, since we do not have to skip the ;
    }
    log_1.default.write('DEBUG', 'finished:');
}
function parseDefine(tokens) {
    log_1.default.write('DEBUG', 'called:');
    let parentesis = false;
    let key = '';
    index += 1; // Move past the DEFINE Keyword   
    while (index < tokens.length) {
        if (!tokens[index])
            break;
        if (tokens[index].value === ';')
            break;
        while (index < tokens.length && tokens[index].type != 'Identifier') {
            log_1.default.write('DEBUG', tokens[index]);
            index += 1; // move to next token; 
        }
        let indent = tokens[index];
        key = context + '.' + indent.value;
        symbolsCache.set(key, {
            id: 'Define',
            type: 'Indentifier',
            name: indent.value,
            size: 1,
            value: indent.value,
            context: context,
            line: indent.line,
            startChar: indent.startCharacter,
            endChar: indent.endCharacter,
        });
        log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
        index += 1; // Move passa the Identifier
        while (index < tokens.length && tokens[index].value != '(' && tokens[index].value != '=') {
            log_1.default.write('DEBUG', tokens[index]);
            index += 1; // move to next token; 
        }
        // Check if we are starting with the expected opening token
        if (tokens[index].value === '(') {
            parentesis = true;
            index += 1;
        }
        while (index < tokens.length && parentesis === true) {
            if (tokens[index].value === ')') {
                parentesis = false; // Found a closing token
            }
            if (parentesis && tokens[index].value !== ',') {
                let parameter = tokens[index];
                let paramkey = key + '.' + parameter.value;
                symbolsCache.set(paramkey, {
                    id: 'Define',
                    type: 'Parameter',
                    name: parameter.value,
                    size: 1,
                    value: parameter.value,
                    context: context,
                    line: parameter.line,
                    startChar: parameter.startCharacter,
                    endChar: parameter.endCharacter,
                });
                log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
            }
            index += 1;
        }
        while (index < tokens.length && tokens[index].value != '=') {
            log_1.default.write('DEBUG', 'looking for =');
            log_1.default.write('DEBUG', tokens[index]);
            index += 1; // move to next token; 
        }
        if (tokens[index].type === 'Delimiter' && tokens[index].value === '=') {
            log_1.default.write('DEBUG', '= found');
            log_1.default.write('DEBUG', tokens[index]);
            index += 1; // Move past the =
        }
        log_1.default.write('DEBUG', tokens[index]);
        let definebody = [];
        definebody.push(tokens[index]);
        index += 1; // Move passa constant value
        while (index < tokens.length && tokens[index].value !== '#') {
            log_1.default.write('DEBUG', tokens[index]);
            definebody.push(tokens[index]);
            index += 1;
        }
        log_1.default.write('DEBUG', tokens[index]);
        symbolsCache.set(key + '.Body', {
            id: 'Define',
            type: 'Body',
            name: indent.value,
            size: 1,
            value: definebody,
            context: context,
            line: indent.line,
            startChar: indent.startCharacter,
            endChar: tokens[index].endCharacter,
        });
        log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
        index += 1; // Move past the #
        while (index < tokens.length && tokens[index].value != ',' && tokens[index].value != ';') {
            log_1.default.write('DEBUG', 'looking for =');
            log_1.default.write('DEBUG', tokens[index]);
            index += 1; // move to next token; 
        }
        if (tokens[index].value === ',') {
            log_1.default.write('DEBUG', tokens[index]);
            index += 1;
        }
        if (tokens[index].value === ';') {
            log_1.default.write('DEBUG', tokens[index]);
            index += 1;
            break;
        }
    }
}
function parseDeclarations(tokens) {
    log_1.default.write('DEBUG', 'called:');
    const type = parseDataType(tokens);
    log_1.default.write('DEBUG', `type: ${type}`);
    const isIndirection = checkForTypeAt(tokens, index, 'Indirection');
    log_1.default.write('DEBUG', `isIndirection: ${isIndirection}`);
    // Adjust base position based on indirection. 
    // if indirection we only skip the ident otherwise both
    const basePosition = index + (isIndirection ? 2 : 1);
    const hasBounds = checkBounds(tokens, basePosition);
    const BOFFSET = hasBounds ? 5 : 0;
    const isReadOnly = checkReadOnly(tokens, basePosition + BOFFSET);
    log_1.default.write('DEBUG', `isArray: ${hasBounds}`);
    log_1.default.write('DEBUG', `isReadOnly: ${isReadOnly}`);
    if (helpers.isStruct(type)) {
        log_1.default.write('DEBUG', 'isStruct: true');
        // parseStruct(tokens);
    }
    else if (hasBounds || isReadOnly) {
        log_1.default.write('DEBUG', 'isArray: true');
        parseArray(tokens, type);
    }
    else if (isIndirection) {
        log_1.default.write('DEBUG', 'isIndirection: true');
        // parseIndirection(tokens, type);
    }
    else {
        parseVariable(tokens, type);
    }
}
function parseVariable(tokens, type) {
    log_1.default.write('DEBUG', 'called:');
    const startline = tokens[index].line;
    const startChar = tokens[index].startCharacter;
    let endline = tokens[index].line;
    let endChar = tokens[index].endCharacter;
    let lowerBoud = 0;
    let upperBound = 0;
    let initialization = null;
    do {
        index = skipComma(tokens, index); // Skip comma for multiple variables
        const ident = parseIdent(tokens);
        if (!checkForValue(tokens, ";") && !checkForValue(tokens, ':=')) {
            log_1.default.write('ERROR', 'failed.');
            throw new Error(`Expected ';' or ':=' at line ${tokens[index].line} but found '${tokens[index].value}'`);
        }
        if (tokens[index].value === ':=') {
            log_1.default.write('DEBUG', tokens[index]);
            index += 1; // Skip :=
            const expressionResult = parseArithmeticExpression(tokens, index);
            log_1.default.write('DEBUG', JSON.stringify(expressionResult));
            initialization = expressionResult.AST;
            index = expressionResult.index;
        }
        endline = tokens[index - 1].line;
        endChar = tokens[index - 1].endCharacter;
        const key = context + '.' + ident;
        const line = '[' + startline.toString() + ':' + endline.toString() + ']';
        const size = upperBound - lowerBoud + 1;
        symbolsCache.set(key, {
            id: 'Variable',
            type: type,
            name: ident,
            size: size,
            value: initialization || "",
            context: context,
            line: line,
            startChar: startChar,
            endChar: endChar + 1 // +1 account for , o ;
        });
        log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
    } while (index < tokens.length && checkForValue(tokens, ',')); // fond a comma, let's continue
    if (!checkForValue(tokens, ";")) {
        log_1.default.write('ERROR', tokens[index]); //NO NO NO TODO: see that to do.
    }
}
function parseArray(tokens, type) {
    log_1.default.write('DEBUG', 'called:');
    const startline = tokens[index].line;
    const startChar = tokens[index].startCharacter;
    let endline = tokens[index].line;
    let endChar = tokens[index].endCharacter;
    let initialization = null;
    do {
        index = skipComma(tokens, index); // Skip comma for multiple variables
        const ident = parseIdent(tokens);
        log_1.default.write('DEBUG', `ident: ${ident}`);
        const isIndirection = checkForTypeAt(tokens, index, 'Indirection');
        const IOFFSET = isIndirection ? 1 : 0;
        const hasBounds = checkBounds(tokens, index + IOFFSET);
        const BOFFSET = hasBounds ? 5 : 0;
        const isReadOnly = checkReadOnly(tokens, index + BOFFSET);
        const ROFFSET = isReadOnly ? 2 : 0;
        const lowerBound = hasBounds ? Number(tokens[index + 1].value) : null;
        const upperBound = hasBounds ? Number(tokens[index + 3].value) : null;
        index += BOFFSET + ROFFSET; // Skip [X:XX] or = 'P' if exists
        if (!checkForValue(tokens, ";") && !checkForValue(tokens, ':=')) {
            log_1.default.write('ERROR', 'failed.');
            throw new Error(`Expected ';' or ':=' at line ${tokens[index].line} but found '${tokens[index].value}'`);
        }
        if (tokens[index].value === ':=') {
            log_1.default.write('DEBUG', tokens[index]);
            index++;
            const expressionResult = parseConstantListExpression(tokens, index);
            initialization = expressionResult.AST;
            index = expressionResult.index;
        }
        const readOnlySize = getConstantArrayLength(initialization);
        endline = tokens[index - 1].line;
        endChar = tokens[index - 1].endCharacter;
        const key = `${context}.${ident}`;
        const line = `[${startline}:${endline}]`;
        const size = hasBounds ? (upperBound - lowerBound + 1) : readOnlySize;
        symbolsCache.set(key, {
            id: isReadOnly ? "ReadOnlyArray" : "Array",
            type,
            name: ident,
            size,
            value: initialization || "",
            context,
            line,
            startChar,
            endChar: endChar + 1 // +1 to account for ',' or ';'
        });
        log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
    } while (index < tokens.length && checkForValue(tokens, ','));
    if (!checkForValue(tokens, ";")) {
        log_1.default.write('ERROR', tokens[index]); // Expected ';' at end
    }
}
function parseConstantListExpression(tokens, index) {
    const elementsStack = [[]];
    let currentElements = elementsStack[0];
    while (index < tokens.length && tokens[index].value !== ';') {
        const token = tokens[index];
        if (token.value === '[') {
            // Start a new nested array without adding a `ConstantArray`
            const newElements = [];
            elementsStack.push(newElements);
            currentElements = newElements;
            index++;
        }
        else if (token.value === ']') {
            // Complete the current nested list and push directly to the parent without a `ConstantArray`
            const completedElements = elementsStack.pop();
            currentElements = elementsStack[elementsStack.length - 1];
            currentElements.push(...completedElements); // Spread elements directly into parent list
            index++;
        }
        else if (isRepetitionPattern(tokens, index)) {
            // Handle repetition constants, e.g., "10 * [ ... ]"
            const { repetitionNode, newIndex } = parseRepetition(tokens, index);
            currentElements.push(repetitionNode);
            index = newIndex;
        }
        else {
            // Parse individual constants
            const { constantNode, newIndex } = parseConstant(tokens, index);
            currentElements.push(constantNode);
            index = newIndex;
            index = skipCommaAndNewlines(tokens, index);
        }
    }
    // Wrap only the mainElements at the top level in `ConstantArray`
    return {
        AST: { type: 'ConstantArray', elements: elementsStack[0] },
        index
    };
}
// Helper: Check if the pattern matches a repetition constant, e.g., "10 * [ ... ]"
function isRepetitionPattern(tokens, index) {
    return tokens[index].type === 'Number' && tokens[index + 1]?.value === '*';
}
// Helper: Parse a repetition constant, e.g., "10 * [ ... ]"
function parseRepetition(tokens, index) {
    const repetitionFactor = parseInt(tokens[index].value, 10);
    index += 2; // Skip the repetition factor and '*'
    if (tokens[index]?.value === '[') {
        const nestedList = parseConstantListExpression(tokens, index + 1);
        return {
            repetitionNode: {
                type: 'RepetitionConstantArray',
                repetitionFactor,
                sequence: nestedList.AST
            },
            newIndex: nestedList.index + 1 // Move past ']'
        };
    }
    else {
        throw new Error(`Expected '[' after repetition factor at index ${index}`);
    }
}
// Helper: Parse an individual constant (Number, Literal, or String)
function parseConstant(tokens, index) {
    const token = tokens[index];
    if (token.type === 'Number' || token.type === 'Literal' || token.type === 'String') {
        return {
            constantNode: { type: 'Constant', value: token.value },
            newIndex: index + 1
        };
    }
    throw new Error(`Expected constant at index ${index}, found '${token.value}'`);
}
// Helper: Skip commas and newlines between elements
function skipCommaAndNewlines(tokens, index) {
    if (tokens[index]?.value === ',') {
        index++;
    }
    return skipNewlines(tokens, index);
}
function skipComma(tokens, index) {
    log_1.default.write('DEBUG', 'called:');
    if (checkForValue(tokens, ","))
        index++; // Skip comma if present
    return index;
}
function checkBounds(tokens, index) {
    log_1.default.write('DEBUG', 'called:');
    return (checkForValueAt(tokens, index, '[') &&
        checkForValueAt(tokens, index + 2, ':') &&
        checkForValueAt(tokens, index + 4, ']'));
}
function checkReadOnly(tokens, index) {
    log_1.default.write('DEBUG', 'called:');
    return (checkForValueAt(tokens, index, "=") &&
        checkForValueAt(tokens, index + 1, "'P'"));
}
function parseDataType(tokens) {
    log_1.default.write('DEBUG', 'called:');
    let openParenthesis = 1;
    let closeParenthesis = 3;
    if (helpers.isString(tokens[index].value)) {
        let value = tokens[index].value;
        index += 1;
        return value;
    }
    else if (helpers.isInt(tokens[index].value) ||
        helpers.isReal(tokens[index].value) ||
        helpers.isUnsigned(tokens[index].value) ||
        helpers.isFixed(tokens[index].value)) {
        let value = tokens[index].value;
        let width = tokens[index + 2].value;
        if (checkForValueAt(tokens, index + openParenthesis, '(') &&
            checkForValueAt(tokens, index + closeParenthesis, ')')) {
            index += 4;
            return value + '(' + width + ')';
        }
        else {
            if (helpers.isUnsigned(tokens[index].value))
                log_1.default.write('ERROR', tokens[index]); //NO NO NO TODO: see that to do.
            index += 1;
            return value;
        }
    }
    log_1.default.write('ERROR', tokens[index]); //NO NO NO TODO: see that to do.
    return '';
}
function parseArithmeticExpression(tokens, index, precedence = 0) {
    // Parse the left side of the expression, starting with unary or primary
    let result = precedence === 0 ? parseUnary(tokens, index) : parsePrimary(tokens, index);
    index = result.index;
    // Process operators based on the current precedence level
    while (tokens[index] && getPrecedence(tokens[index]) >= precedence) {
        const operator = tokens[index].value;
        const operatorPrecedence = getPrecedence(tokens[index]);
        index++;
        // Recursively parse the right operand at the next higher precedence level
        const right = parseArithmeticExpression(tokens, index, operatorPrecedence + 1);
        index = right.index;
        // Construct the BinaryExpression node with left and right operands
        result = {
            AST: {
                type: 'BinaryExpression',
                operator,
                left: result.AST,
                right: right.AST,
            },
            index,
        };
    }
    return result;
}
// New function to handle unary operators like '+a' or '-a'
function parseUnary(tokens, index) {
    const token = tokens[index];
    // Check for unary '+' or '-'
    if (token.value === '+' || token.value === '-') {
        const operator = token.value;
        index++;
        const rightResult = parseUnary(tokens, index); // Recursive call to handle further unary expressions
        index = rightResult.index;
        return {
            AST: {
                type: 'UnaryExpression',
                operator,
                argument: rightResult.AST,
            },
            index,
        };
    }
    // Otherwise, parse as a primary expression
    return parsePrimary(tokens, index);
}
function parsePrimary(tokens, index) {
    const token = tokens[index];
    // Treat `;` as the end of an expression and return the current AST
    //if (token.value === ';') {
    //    return { AST: { type: 'EndOfExpression' }, index };
    //}
    if (token.type === 'Number' || token.type === 'Literal') {
        index++;
        return { AST: { type: 'Constant', value: token.value }, index };
    }
    if (token.type === 'Identifier') {
        index++;
        return { AST: { type: 'Identifier', name: token.value }, index };
    }
    if (token.type === 'Function') {
        return parseFunctionCall(tokens, index);
    }
    if (token.value === '(') {
        index++;
        const expressionResult = parseArithmeticExpression(tokens, index, 9);
        index = expressionResult.index;
        if (tokens[index].value !== ')') {
            throw new Error(`Expected ')' at index ${index}`);
        }
        index++;
        return { AST: expressionResult.AST, index };
    }
    throw new Error(`Unexpected token '${token.value}' at index ${index}`);
}
function parseFunctionCall(tokens, index) {
    const functionName = tokens[index].value; // Assume function name token
    index++; // Move past function name
    if (tokens[index].value !== '(') {
        throw new Error(`Expected '(' after function name at line ${tokens[index].line}`);
    }
    index++; // Skip '('
    const argumentsList = [];
    // Parse each argument
    while (tokens[index].value !== ')') {
        const argumentResult = parseArithmeticExpression(tokens, index, 9); // Parse each argument as an expression
        argumentsList.push(argumentResult.AST);
        index = argumentResult.index;
        // If there's a comma, skip it to continue to the next argument
        if (tokens[index].value === ',') {
            index++; // Skip ','
        }
    }
    if (tokens[index].value !== ')') {
        throw new Error(`Expected ')' after function arguments at line ${tokens[index].line}`);
    }
    index++; // Skip ')'
    return {
        AST: {
            type: 'FunctionCall',
            name: functionName,
            arguments: argumentsList
        },
        index,
    };
}
const precedenceMap = {
    '[': 0, '.': 0, '@': 0,
    '<<': 2, '>>': 2,
    '*': 3, '/': 3, '\\': 3,
    '+': 4, '-': 4, 'LOR': 4, 'LAND': 4, 'XOR': 4,
    '<': 5, '=': 5, '>': 5, '<=': 5, '>=': 5, '<>': 5,
    'NOT': 6, 'AND': 7, 'OR': 8,
    ':=': 9
};
function getPrecedence(token) {
    return precedenceMap[token.value] ?? -1;
}
function getTokenValue(tokens) {
    log_1.default.write('DEBUG', 'called:');
    let retVal = '';
    if (tokens[index] && tokens[index].value) {
        retVal = tokens[index].value;
        index += 1;
    }
    if (!retVal) {
        log_1.default.write('ERROR', tokens[index]); //NO NO NO TODO: see that to do.
    }
    return retVal;
}
function checkForValue(tokens, value) {
    log_1.default.write('DEBUG', 'called:');
    if (tokens[index] && tokens[index].value === value) {
        return true;
    }
    return false;
}
function checkForValueAt(tokens, position, value) {
    log_1.default.write('DEBUG', 'called:');
    if (tokens[index] && tokens[position].value === value) {
        return true;
    }
    return false;
}
function checkForType(tokens, type) {
    log_1.default.write('DEBUG', 'called:');
    if (tokens[index] && tokens[index].type === type) {
        return true;
    }
    return false;
}
function checkForTypeAt(tokens, position, type) {
    log_1.default.write('DEBUG', 'called:');
    if (tokens[index] && tokens[position].type === type) {
        return true;
    }
    return false;
}
function parseIdent(tokens) {
    log_1.default.write('DEBUG', 'called:');
    let retVal = '';
    // If we find name gets it's value
    if (tokens[index].type === 'Identifier') {
        retVal = tokens[index].value;
        log_1.default.write('DEBUG', `Found variable name: ${retVal}`);
        index += 1;
        return retVal;
    }
    log_1.default.write('ERROR', tokens[index]); //NO NO NO TODO: see that to do.
    return retVal;
}
function parseCrossRefDirective(tokens) {
    log_1.default.write('DEBUG', tokens[index]);
    log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
    return index;
}
function parseColumnsDirective(tokens) {
    log_1.default.write('DEBUG', tokens[index]);
    log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
    return index;
}
function parseAssertionDirective(tokens) {
    log_1.default.write('DEBUG', tokens[index]);
    log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
    return index;
}
function parseSimpleDirective(tokens) {
    log_1.default.write('DEBUG', tokens[index]);
    let directive = tokens[index];
    let key = context + '.' + directive.value;
    symbolsCache.set(key, {
        id: 'Directive',
        type: 'none',
        name: directive.value,
        size: 1,
        value: '',
        context: context,
        line: directive.line,
        startChar: directive.startCharacter,
        endChar: directive.endCharacter,
    });
    index += 1; // Move to ABORT or NOABORT VALUE
    if (tokens[index].type === 'Delimiter' && tokens[index].value === ',') {
        log_1.default.write('DEBUG', tokens[index]);
        index += 1; // Move past the comma;
    }
    log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
    return index;
}
function parseTargetDirective(tokens) {
    log_1.default.write('DEBUG', tokens[index]);
    let target = tokens[index];
    index += 1; // Move to TARGET KEYWORD
    let value = tokens[index];
    let key = context + '.' + target.value;
    symbolsCache.set(key, {
        id: 'Directive',
        type: 'none',
        name: target.value,
        size: 1,
        value: value.value,
        context: context,
        line: target.line,
        startChar: target.startCharacter,
        endChar: target.endCharacter,
    });
    index += 1; // Move to TARGET VALUE
    log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
    return index;
}
function parseSourceDirective(tokens) {
    let source = '';
    let key = '';
    index += 1; // Move past the SOURCE KEYWORD
    while (tokens[index] && !(tokens[index].type === 'Delimiter' && tokens[index].value === '(')) {
        log_1.default.write('DEBUG', tokens[index]);
        source += tokens[index].value;
        index += 1; // Move to next token
    }
    index += 1; // Move past the open parentesis
    while (tokens[index] && !(tokens[index].type === 'Delimiter' && tokens[index].value === ')')) {
        log_1.default.write('DEBUG', tokens[index]);
        if (tokens[index].value === "," ||
            tokens[index].value === "?" ||
            tokens[index].value === "<CR><LF>")
            index += 1; // Move past the comma;
        else {
            let func = tokens[index];
            key = context + '.' + func.value;
            symbolsCache.set(key, {
                id: 'Function',
                type: 'none',
                name: func.value,
                size: 1,
                value: '',
                context: source,
                line: func.line,
                startChar: func.startCharacter,
                endChar: func.endCharacter,
            });
            log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
            index += 1; // Move past the directive
        }
    }
    if (tokens[index] && tokens[index].type === 'Delimiter' && tokens[index].value === ')') {
        log_1.default.write('DEBUG', tokens[index]);
        index += 1; // Move past the )
    }
    return index;
}
function skipNewlines(tokens, index) {
    log_1.default.write('DEBUG', 'called:');
    while (index < tokens.length && tokens[index].type === 'NewLine') {
        index += 1; // Move past the comma;
    }
    return index;
}
function getConstantArrayLength(ast) {
    let totalLength = 0;
    // Check if ast is null or not of type ConstantArray
    if (!ast || ast.type !== 'ConstantArray') {
        return totalLength;
    }
    // Iterate through elements of ConstantArray
    for (const element of ast.elements) {
        // Check if the element is a Constant and value is not "0"
        if (element.type === 'Constant' && element.value !== "0") {
            totalLength += element.value.length;
        }
    }
    return totalLength;
}
exports.default = parseTokens;
//# sourceMappingURL=parser.js.map