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
                kind: 'Directive',
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
        while (index < tokens.length && tokens[index].type != 'Name') {
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
            kind: 'Literal',
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
        while (index < tokens.length && tokens[index].type != 'Name') {
            log_1.default.write('DEBUG', tokens[index]);
            index += 1; // move to next token; 
        }
        let indent = tokens[index];
        key = context + '.' + indent.value;
        symbolsCache.set(key, {
            kind: 'Define',
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
                    kind: 'Define',
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
            kind: 'Define',
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
    let type = parseDataType(tokens);
    log_1.default.write('DEBUG', 'type: ' + type);
    let indirection = checkForTypeAt(tokens, index, 'Indirection');
    if (indirection)
        log_1.default.write('DEBUG', '=== indirection: ===');
    //parseSimplePointer(tokens);
    else {
        parseVariable(tokens, type);
    }
}
function parseVariable(tokens, type) {
    log_1.default.write('DEBUG', 'called:');
    const openbracketoffset = 0;
    const lowerBoundOffet = 1;
    const colonoffset = 2;
    const upperBoundOffet = 3;
    const closebracketoffset = 4;
    const startline = tokens[index].line;
    const startChar = tokens[index].startCharacter;
    let endline = tokens[index].line;
    let endChar = tokens[index].endCharacter;
    let lowerBoud = 0;
    let upperBound = 0;
    let initialization = null;
    do {
        if (checkForValue(tokens, ",")) {
            index += 1; // Skip , in case of multiples varibles
        }
        const ident = parseIdent(tokens);
        if (checkForValueAt(tokens, index + openbracketoffset, '[') &&
            checkForValueAt(tokens, index + colonoffset, ':') &&
            checkForValueAt(tokens, index + closebracketoffset, ']')) {
            log_1.default.write('DEBUG', '=== isArray: ===');
            lowerBoud = Number(tokens[index + lowerBoundOffet].value);
            upperBound = Number(tokens[index + upperBoundOffet].value);
            index += (closebracketoffset + 1);
        }
        // look for Read-Only arrays
        if (checkForValue(tokens, "=") &&
            checkForValueAt(tokens, index + 1, "'P'")) {
            index += 2; // Skip = and 'P'
        }
        if (!checkForValue(tokens, ";") && !checkForValue(tokens, ':=')) {
            log_1.default.write('ERROR', 'parseVariable failed.');
            throw new Error(`Expected ';' or ':=' at line ${tokens[index].line} but found '${tokens[index].value}'`);
        }
        if (tokens[index].value === ':=') {
            log_1.default.write('DEBUG', tokens[index]);
            index += 1; // Skip :=
            const expressionResult = parseExpression(tokens, index);
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
            kind: 'Variable',
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
function parseExpression(tokens, index) {
    log_1.default.write('DEBUG', 'called:');
    // Detect if the expression is an array literal
    if (tokens[index].value === '[') {
        return parseArrayLiteral(tokens, index);
    }
    let result = parseTerm(tokens, index);
    index = result.index;
    // Handle '+' and '-' as binary operators
    while (tokens[index] && (tokens[index].value === '+' || tokens[index].value === '-')) {
        const operatorToken = tokens[index];
        index++;
        const rightResult = parseTerm(tokens, index);
        index = rightResult.index;
        result = {
            AST: {
                type: 'BinaryExpression',
                operator: operatorToken.value,
                left: result.AST,
                right: rightResult.AST,
            },
            index,
        };
    }
    return result;
}
function parseArrayLiteral(tokens, index) {
    log_1.default.write('DEBUG', 'called:');
    const elements = [];
    index++; // Skip the '['
    while (tokens[index] && tokens[index].value !== ']') {
        const elementResult = parseExpression(tokens, index);
        log_1.default.write('DEBUG', JSON.stringify(elementResult));
        elements.push(elementResult.AST);
        index = elementResult.index;
        // Skip the ',' if there are multiple elements
        if (tokens[index] && tokens[index].value === ',') {
            index++;
            index = skipNewlines(tokens, index); // Skip any newlines after the ','
        }
    }
    if (tokens[index] && tokens[index].value === ']') {
        index++; // Skip the ']'
    }
    else {
        throw new Error(`Expected ']' at line ${tokens[index].line} but found '${tokens[index].value}'`);
    }
    return {
        AST: {
            type: 'ConstantArray',
            elements: elements
        },
        index,
    };
}
// Parse a term which includes '*' and '/' with higher precedence.
function parseTerm(tokens, index) {
    log_1.default.write('DEBUG', 'called:');
    // Start with parsing shifts, which have higher precedence than * and /
    let result = parseShift(tokens, index);
    index = result.index;
    // Handle '*' and '/' as binary operators
    while (tokens[index] &&
        (tokens[index].value === '*' ||
            tokens[index].value === '/' ||
            tokens[index].value === "'*'" ||
            tokens[index].value === "'/'")) {
        const operatorToken = tokens[index];
        index++;
        const rightResult = parseUnary(tokens, index);
        index = rightResult.index;
        result = {
            AST: {
                type: 'BinaryExpression',
                operator: operatorToken.value,
                left: result.AST,
                right: rightResult.AST,
            },
            index,
        };
    }
    return result;
}
function parseShift(tokens, index) {
    log_1.default.write('DEBUG', 'called:');
    // Parse a unary first (which handles unary minus and other factors)
    let result = parseUnary(tokens, index);
    index = result.index;
    // Loop to handle multiple '<<' operators
    while (tokens[index] &&
        (tokens[index].value === '<<' ||
            tokens[index].value === '>>')) {
        const operatorToken = tokens[index];
        index++; // Move past '<<'
        // Parse the right-hand side of the shift
        const right = parseUnary(tokens, index);
        index = right.index;
        // Create a BinaryExpression node for the shift
        result = {
            AST: {
                type: 'BinaryExpression',
                operator: operatorToken.value,
                left: result.AST,
                right: right.AST,
            },
            index
        };
    }
    return result;
}
// New function to handle unary operators like '+a' or '-a'.
function parseUnary(tokens, index) {
    log_1.default.write('DEBUG', 'called:');
    // Check for unary '+' or '-'
    if (tokens[index] && (tokens[index].value === '+' || tokens[index].value === '-')) {
        const operatorToken = tokens[index];
        index++;
        const rightResult = parseUnary(tokens, index);
        index = rightResult.index;
        return {
            AST: {
                type: 'UnaryExpression',
                operator: operatorToken.value,
                argument: rightResult.AST,
            },
            index,
        };
    }
    // Otherwise, parse as a factor (number, identifier, or parentheses)
    return parseFactor(tokens, index);
}
// Parse function calls like foo(var1 + var2)
function parseFunctionCall(tokens, index) {
    const functionName = tokens[index].value;
    index++; // Move past function name
    if (tokens[index].value !== '(') {
        throw new Error(`Expected '(' after function name at line ${tokens[index].line}`);
    }
    index++; // Skip the '('
    const argumentNodes = [];
    while (tokens[index].value !== ')') {
        const argumentResult = parseExpression(tokens, index);
        argumentNodes.push(argumentResult.AST);
        index = argumentResult.index;
        if (tokens[index].value === ',') {
            index++; // Skip ',' if multiple arguments
            index = skipNewlines(tokens, index); // Skip any newlines after the ','
        }
    }
    index++; // Skip the ')'
    return {
        AST: {
            type: 'FunctionCall',
            name: functionName,
            arguments: argumentNodes
        },
        index
    };
}
// Parse a factor, which could be a number, an identifier, or a nested expression in parentheses.
function parseFactor(tokens, index) {
    log_1.default.write('DEBUG', 'called:');
    const token = tokens[index];
    log_1.default.write('DEBUG', token);
    if (token.type === 'Number') {
        index++;
        return { AST: { type: 'Constant', value: token.value }, index };
    }
    // Handle identifiers or function calls
    if (token.type === 'Name') {
        if (tokens[index + 1] && tokens[index + 1].value === '(') {
            return parseFunctionCall(tokens, index);
        }
        else {
            index++;
            return { AST: { type: 'Identifier', value: token.value }, index };
        }
    }
    if (token.value === '"') {
        let stringValue = '';
        index++; // Skip the opening quote
        // Loop until we find the closing quote or run out of tokens
        while (index < tokens.length && tokens[index].value !== '"') {
            stringValue += tokens[index].value;
            index++;
        }
        // Check if we have a closing quote
        if (index < tokens.length && tokens[index].value === '"') {
            index++; // Skip the closing quote
            return {
                AST: { type: 'Constant', value: stringValue },
                index
            };
        }
        else {
            throw new Error(`Unterminated string literal at line ${token.line}`);
        }
    }
    // Handle parentheses by parsing a sub-expression.
    if (token.value === '(') {
        index++; // Skip '('
        const expressionResult = parseExpression(tokens, index);
        index = expressionResult.index;
        if (tokens[index].value !== ')') {
            throw new Error(`Expected ')' at line ${tokens[index].line} but found '${tokens[index].value}'`);
        }
        index++; // Skip ')'
        return { AST: expressionResult.AST, index };
    }
    throw new Error(`Unexpected token '${token.value}' at line ${token.line}`);
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
    if (tokens[index].type === 'Name') {
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
        kind: 'Directive',
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
        kind: 'Directive',
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
                kind: 'Function',
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
exports.default = parseTokens;
//# sourceMappingURL=parser.js.map