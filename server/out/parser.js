"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers = require("./helper");
const log_1 = require("./log");
let context = 'Global';
let index = 0;
let symbolsCache = new Map();
function getTokensBetween(tokens, open, close, kind, type) {
    const result = [];
    let openCount = 0;
    // Check if we are starting with the expected opening token
    if (tokens[index].value === open) {
        openCount++;
        index += 1;
    }
    while (index < tokens.length && openCount > 0) {
        if (tokens[index].value === open) {
            openCount++; // Found another opening token
        }
        else if (tokens[index].value === close) {
            openCount--; // Found a closing token
        }
        if (openCount > 0 && tokens[index].value !== ',') {
            result.push(tokens[index]);
        }
        index += 1;
    }
    return result;
}
function getTokensUntilDelimiter(tokens, index, delimiter) {
    const result = [];
    while (index < tokens.length && tokens[index].value !== delimiter) {
        result.push(tokens[index]);
        index += 1;
    }
    // Move past the delimiter if found
    if (index < tokens.length && tokens[index].value === delimiter) {
        index += 1;
    }
    return { tokens: result, index };
}
// Main Parsing Function
function parseTokens(tokens) {
    log_1.default.write('DEBUG', 'parseTokens called:');
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
        else {
            //log.write('DEBUG', 'Else Before:');
            //log.write('DEBUG', tokens[index]);
            index += 1;
            //log.write('DEBUG', 'Esle after:');
            //log.write('DEBUG', tokens[index]);
        }
    }
    // To get a flat array of all SymbolEntry items
    const allSymbolEntries = Array.from(symbolsCache.values()).flat();
    return allSymbolEntries;
}
function parseLiteral(tokens) {
    log_1.default.write('DEBUG', 'parseLiteral called:');
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
        symbolsCache.set(key, [{
                kind: 'Literal',
                type: '',
                name: indent.value,
                value: value,
                context: context,
                line: indent.line,
                startChar: indent.startCharacter,
                endChar: tokens[index].endCharacter,
            }]);
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
    return index;
}
function parseDefine(tokens) {
    log_1.default.write('DEBUG', 'parseDefine called:');
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
        symbolsCache.set(key, [{
                kind: 'Define',
                type: 'Indentifier',
                name: indent.value,
                value: indent.value,
                context: context,
                line: indent.line,
                startChar: indent.startCharacter,
                endChar: indent.endCharacter,
            }]);
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
                symbolsCache.set(paramkey, [{
                        kind: 'Define',
                        type: 'Parameter',
                        name: parameter.value,
                        value: parameter.value,
                        context: context,
                        line: parameter.line,
                        startChar: parameter.startCharacter,
                        endChar: parameter.endCharacter,
                    }]);
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
        symbolsCache.set(key + '.Body', [{
                kind: 'Define',
                type: 'Body',
                name: indent.value,
                value: definebody,
                context: context,
                line: indent.line,
                startChar: indent.startCharacter,
                endChar: tokens[index].endCharacter,
            }]);
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
function parseComment(tokens) {
    log_1.default.write('DEBUG', 'parseComment called:');
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
    log_1.default.write('DEBUG', 'parseCommentLine called:');
    index += 1; // Move past the ! comment
    while (tokens[index] && tokens[index].type != 'NewLine') {
        log_1.default.write('DEBUG', tokens[index]);
        index += 1; // move to next token;
    }
    return index;
}
function parseKeyword(tokens) {
    log_1.default.write('DEBUG', tokens[index]);
    if (tokens[index] && tokens[index].value.toUpperCase() === 'LITERAL') {
        parseLiteral(tokens);
    }
    else if (tokens[index] && tokens[index].value.toUpperCase() === 'DEFINE') {
        parseDefine(tokens);
    }
    else {
        index += 1; // move to next token;
    }
    return index;
}
function parseDirectives(tokens) {
    log_1.default.write('DEBUG', 'parseDirectives called:');
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
            symbolsCache.set(key, [{
                    kind: 'Directive',
                    type: 'none',
                    name: directive.value,
                    value: '',
                    context: context,
                    line: directive.line,
                    startChar: directive.startCharacter,
                    endChar: directive.endCharacter,
                }]);
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
    symbolsCache.set(key, [{
            kind: 'Directive',
            type: 'none',
            name: directive.value,
            value: '',
            context: context,
            line: directive.line,
            startChar: directive.startCharacter,
            endChar: directive.endCharacter,
        }]);
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
    symbolsCache.set(key, [{
            kind: 'Directive',
            type: 'none',
            name: target.value,
            value: value.value,
            context: context,
            line: target.line,
            startChar: target.startCharacter,
            endChar: target.endCharacter,
        }]);
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
            symbolsCache.set(key, [{
                    kind: 'Function',
                    type: 'none',
                    name: func.value,
                    value: '',
                    context: source,
                    line: func.line,
                    startChar: func.startCharacter,
                    endChar: func.endCharacter,
                }]);
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
// Function to parse function declarations (e.g., "PROC myFunction")
function parseFunction(tokens, i, symbolTable) {
    const functionName = tokens[i + 1]; // The function name follows 'PROC'
    // Add the function to the symbol table
    //symbolsCache.set({
    //    kind: 'Function',
    //    type: 'none',
    //    name: functionName.value,
    //    value: '',
    //    context: context,
    //    line: functionName.line,
    //    startChar: functionName.startCharacter,
    //    endChar: functionName.endCharacter,   // End character position
    //});
    // Skip over the 'PROC' and the function name, and return the new index position
    return i + 2;
}
// Function to parse variable declarations (e.g., "INT myVar1, myVar2")
function parseVariable(tokens, i, symbolTable) {
    const dataType = tokens[i].value; // The type of the variable (e.g., 'INT')
    i++; // Move to the variable name(s)
    // Collect variable names
    while (tokens[i] && tokens[i].type === 'Name') {
        const varName = tokens[i];
        // Add the function to the symbol table
        //symbolsCache.set({
        //    kind: 'Variable',
        //    type: dataType,
        //    name: varName.value,
        //    value: '',
        //    context: context,
        //    line: varName.line,
        //    startChar: varName.startCharacter,
        //    endChar: varName.endCharacter,   // End character position
        //});
        i++; // Move to the next token (either another variable or end of the declaration)
        // Check if there is a comma between variables (e.g., "INT myVar1, myVar2;")
        if (tokens[i] && tokens[i].value === ',') {
            i++; // Skip over the comma and move to the next variable
        }
    }
    return i; // Return the updated index
}
exports.default = parseTokens;
//# sourceMappingURL=parser.js.map