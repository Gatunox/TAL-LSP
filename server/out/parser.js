"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printAllDefines = exports.printAllLiterals = void 0;
const helpers = require("./helper");
const log_1 = require("./log");
let globalContext = 'Global';
let globalIndex = 0;
let symbolsCache = new Map();
let literals = new Set();
let defines = new Set();
function printAllLiterals() {
    log_1.default.write('DEBUG', 'called:');
    literals.forEach((literal) => {
        log_1.default.write('DEBUG', literal);
    });
}
exports.printAllLiterals = printAllLiterals;
function printAllDefines() {
    log_1.default.write('DEBUG', 'called:');
    defines.forEach((defines) => {
        log_1.default.write('DEBUG', defines);
    });
}
exports.printAllDefines = printAllDefines;
function searchLiteral(context, identifier) {
    log_1.default.write('DEBUG', 'called:');
    const specificContextLiteral = `${context}.${identifier}`;
    const globalContextLiteral = `Global.${identifier}`;
    // Check if the literal exists in the specific context
    if (literals.has(specificContextLiteral)) {
        return true;
    }
    // If not found, check in the Global context
    if (literals.has(globalContextLiteral)) {
        return true;
    }
    // Literal not found
    return false;
}
function searchDefine(context, identifier) {
    log_1.default.write('DEBUG', 'called:');
    const specificContextDefine = `${context}.${identifier}`;
    const globalContextDefine = `Global.${identifier}`;
    // Check if the define exists in the specific context
    if (defines.has(specificContextDefine)) {
        return true;
    }
    // If not found, check in the Global context
    if (defines.has(globalContextDefine)) {
        return true;
    }
    // Literal not found
    return false;
}
function addToSymbolCache(context, name, entry) {
    const key = `${context}.${name}`;
    symbolsCache.set(key, entry);
    log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
}
function clearCache() {
    symbolsCache.clear();
    ;
}
function throwUnexpectedError(tokens, index) {
    throw new Error(`Unexpected token '${tokens[index].value}' at index ${index} on line '${tokens[index].line}'`);
}
function throwValueError(tokens, index, expectedKeyword) {
    throw new Error(`Expected '${expectedKeyword}' at index ${index}, but found '${tokens[index].value}' on line '${tokens[index].line}'`);
}
function throwTypeError(tokens, index, expectedKeyword) {
    throw new Error(`Expected '${expectedKeyword}' at index ${index}, but found '${tokens[index].type}' on line '${tokens[index].line}'`);
}
function throwDifferentValueError(tokens, index, forbiddenValue) {
    throw new Error(`Invalid value '${forbiddenValue}' at index ${index}', on line '${tokens[index].line}'`);
}
function throwDifferentTypeError(tokens, index, forbiddenValue) {
    throw new Error(`Invalid value '${forbiddenValue}' at index ${index}', on line '${tokens[index].line}'`);
}
function requireValue(tokens, index, expectedValue) {
    if (tokens[index].value !== expectedValue) {
        throwValueError(tokens, index, expectedValue);
    }
}
function requireDiffentValue(tokens, index, forbiddenValue) {
    if (tokens[index].value === forbiddenValue) {
        throwDifferentValueError(tokens, index, forbiddenValue);
    }
}
function requireType(tokens, index, expectedType) {
    if (tokens[index].type !== expectedType) {
        throwTypeError(tokens, index, expectedType);
    }
}
function requireDiffentType(tokens, index, forbiddenValue) {
    if (tokens[index].type === forbiddenValue) {
        throwDifferentTypeError(tokens, index, forbiddenValue);
    }
}
// Main Parsing Function
function parseTokens(tokens) {
    log_1.default.write('DEBUG', 'called:');
    globalIndex = 0;
    clearCache();
    while (globalIndex < tokens.length) {
        if (!tokens[globalIndex])
            break;
        log_1.default.write('DEBUG', tokens[globalIndex]);
        if (tokens[globalIndex] && tokens[globalIndex].type === 'Comment') {
            parseComment(tokens);
        }
        else if (tokens[globalIndex] && tokens[globalIndex].type === 'CommentLine') {
            parseCommentLine(tokens);
        }
        else if (tokens[globalIndex] && tokens[globalIndex].type === 'DirectiveLine') {
            parseDirectives(tokens);
        }
        else if (tokens[globalIndex] && tokens[globalIndex].type === 'Keyword') {
            parseKeyword(tokens);
        }
        else if (tokens[globalIndex] && helpers.isDataType(tokens[globalIndex].value)) {
            parseDeclarations(tokens);
        }
        else {
            //log.write('DEBUG', 'Else Before:');
            //log.write('DEBUG', tokens[index]);
            globalIndex += 1;
            //log.write('DEBUG', 'Esle after:');
            //log.write('DEBUG', tokens[index]);
        }
    }
    return symbolsCache;
}
function parseComment(tokens) {
    log_1.default.write('DEBUG', 'called:');
    globalIndex += 1; // Move past the ! comment
    while (tokens[globalIndex] && tokens[globalIndex].type != 'Comment' && tokens[globalIndex].type != 'NewLine') {
        log_1.default.write('DEBUG', tokens[globalIndex]);
        globalIndex += 1; // move to next token; 
    }
    if (tokens[globalIndex] && tokens[globalIndex].type === 'Comment' && tokens[globalIndex].value === '!') {
        log_1.default.write('DEBUG', tokens[globalIndex]);
        globalIndex += 1; // Move past the !
    }
    return globalIndex;
}
function parseCommentLine(tokens) {
    log_1.default.write('DEBUG', 'called:');
    globalIndex += 1; // Move past the ! comment
    while (tokens[globalIndex] && tokens[globalIndex].type != 'NewLine') {
        log_1.default.write('DEBUG', tokens[globalIndex]);
        globalIndex += 1; // move to next token;
    }
    return globalIndex;
}
function parseDirectives(tokens) {
    log_1.default.write('DEBUG', 'called:');
    let key = '';
    globalIndex += 1; // Move past the ! comment
    while (tokens[globalIndex] && tokens[globalIndex].type != 'NewLine') {
        log_1.default.write('DEBUG', tokens[globalIndex]);
        if (tokens[globalIndex] && tokens[globalIndex].type === 'Comment') {
            parseComment(tokens);
        }
        else if (helpers.isSimpleCompilerDirective(tokens[globalIndex].value.toUpperCase())) {
            parseSimpleDirective(tokens);
        }
        else if (tokens[globalIndex].value.toUpperCase() === 'ASSERTION') {
            parseAssertionDirective(tokens);
        }
        else if (tokens[globalIndex].value.toUpperCase() === 'COLUMNS') {
            parseColumnsDirective(tokens);
        }
        else if (tokens[globalIndex].value.toUpperCase() === 'CROSSREF' ||
            tokens[globalIndex].value.toUpperCase() === 'NOCROSSREF') {
            parseCrossRefDirective(tokens);
        }
        else if (tokens[globalIndex].value.toUpperCase() === 'TARGET') {
            parseTargetDirective(tokens);
        }
        else if (tokens[globalIndex].value.toUpperCase() === 'SOURCE') {
            parseSourceDirective(tokens);
        }
        else {
            let directive = tokens[globalIndex];
            key = globalContext + '.' + tokens[globalIndex].value;
            symbolsCache.set(key, {
                id: 'Directive',
                type: 'none',
                name: directive.value,
                size: 1,
                value: '',
                context: globalContext,
                line: directive.line,
                startChar: directive.startCharacter,
                endChar: directive.endCharacter,
            });
            globalIndex += 1; // Move past the directive
            log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
            if (tokens[globalIndex].type === 'Delimiter' && tokens[globalIndex].value === ',') {
                log_1.default.write('DEBUG', tokens[globalIndex]);
                globalIndex += 1; // Move past the comma;
            }
        }
    }
    if (tokens[globalIndex] && tokens[globalIndex].type === 'NewLine' && tokens[globalIndex].value === '<CR><LF>') {
        log_1.default.write('DEBUG', tokens[globalIndex]);
        globalIndex += 1; // Move past the newline
    }
    return globalIndex;
}
function parseKeyword(tokens) {
    log_1.default.write('DEBUG', 'called:');
    if (tokens[globalIndex] && helpers.isLiteral(tokens[globalIndex].value)) {
        parseLiteral(tokens);
    }
    else if (tokens[globalIndex] && helpers.isDefine(tokens[globalIndex].value)) {
        parseDefine(tokens);
    }
    else if (tokens[globalIndex] && helpers.isStruct(tokens[globalIndex].value)) {
        parseStructure(tokens);
    }
    else {
        globalIndex += 1; // move to next token;
    }
    return globalIndex;
}
function parseLiteral(tokens) {
    log_1.default.write('DEBUG', 'called:');
    let key = '';
    globalIndex += 1; // Move past the LITERAL Keyword   
    while (globalIndex < tokens.length) {
        if (!tokens[globalIndex])
            break;
        if (tokens[globalIndex].value === ';')
            break;
        while (globalIndex < tokens.length && tokens[globalIndex].type != 'Identifier') {
            log_1.default.write('DEBUG', tokens[globalIndex]);
            globalIndex += 1; // move to next token; 
        }
        let indent = tokens[globalIndex];
        globalIndex += 1; // Move passa the Identifier
        if (tokens[globalIndex].type === 'Delimiter' && tokens[globalIndex].value === '=') {
            log_1.default.write('DEBUG', tokens[globalIndex]);
            globalIndex += 1; // Move past the =;
        }
        log_1.default.write('DEBUG', tokens[globalIndex]);
        let value = tokens[globalIndex].value;
        globalIndex += 1; // Move passa constant value
        while (globalIndex < tokens.length && tokens[globalIndex].value !== ',' && tokens[globalIndex].value !== ';') {
            log_1.default.write('DEBUG', tokens[globalIndex]);
            value += tokens[globalIndex].value;
            globalIndex += 1;
        }
        key = globalContext + '.' + indent.value;
        literals.add(key);
        symbolsCache.set(key, {
            id: 'Literal',
            type: '',
            name: indent.value,
            size: 1,
            value: value,
            context: globalContext,
            line: indent.line,
            startChar: indent.startCharacter,
            endChar: indent.endCharacter,
        });
        log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
        if (tokens[globalIndex] && tokens[globalIndex].type === 'Delimiter' && tokens[globalIndex].value === ',') {
            log_1.default.write('DEBUG', tokens[globalIndex]);
            globalIndex += 1; // Move past comma, since we do not have to skip the ;
        }
    }
    if (globalIndex < tokens.length && tokens[globalIndex].type === 'Delimiter' && tokens[globalIndex].value === ';') {
        log_1.default.write('DEBUG', tokens[globalIndex]);
        globalIndex += 1; // Move past comma, since we do not have to skip the ;
    }
    log_1.default.write('DEBUG', 'finished:');
}
function parseDefine(tokens) {
    log_1.default.write('DEBUG', 'called:');
    let parentesis = false;
    let key = '';
    globalIndex += 1; // Move past the DEFINE Keyword   
    while (globalIndex < tokens.length) {
        if (!tokens[globalIndex])
            break;
        if (tokens[globalIndex].value === ';')
            break;
        while (globalIndex < tokens.length && tokens[globalIndex].type != 'Identifier') {
            log_1.default.write('DEBUG', tokens[globalIndex]);
            globalIndex += 1; // move to next token; 
        }
        let indent = tokens[globalIndex];
        key = globalContext + '.' + indent.value;
        defines.add(key);
        symbolsCache.set(key, {
            id: 'Define',
            type: 'Indentifier',
            name: indent.value,
            size: 1,
            value: indent.value,
            context: globalContext,
            line: indent.line,
            startChar: indent.startCharacter,
            endChar: indent.endCharacter,
        });
        log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
        globalIndex += 1; // Move passa the Identifier
        while (globalIndex < tokens.length && tokens[globalIndex].value != '(' && tokens[globalIndex].value != '=') {
            log_1.default.write('DEBUG', tokens[globalIndex]);
            globalIndex += 1; // move to next token; 
        }
        // Check if we are starting with the expected opening token
        if (tokens[globalIndex].value === '(') {
            parentesis = true;
            globalIndex += 1;
        }
        while (globalIndex < tokens.length && parentesis === true) {
            if (tokens[globalIndex].value === ')') {
                parentesis = false; // Found a closing token
            }
            if (parentesis && tokens[globalIndex].value !== ',') {
                let parameter = tokens[globalIndex];
                let paramkey = key + '.' + parameter.value;
                symbolsCache.set(paramkey, {
                    id: 'Define',
                    type: 'Parameter',
                    name: parameter.value,
                    size: 1,
                    value: parameter.value,
                    context: globalContext,
                    line: parameter.line,
                    startChar: parameter.startCharacter,
                    endChar: parameter.endCharacter,
                });
                log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
            }
            globalIndex += 1;
        }
        while (globalIndex < tokens.length && tokens[globalIndex].value != '=') {
            log_1.default.write('DEBUG', 'looking for =');
            log_1.default.write('DEBUG', tokens[globalIndex]);
            globalIndex += 1; // move to next token; 
        }
        if (tokens[globalIndex].type === 'Delimiter' && tokens[globalIndex].value === '=') {
            log_1.default.write('DEBUG', '= found');
            log_1.default.write('DEBUG', tokens[globalIndex]);
            globalIndex += 1; // Move past the =
        }
        log_1.default.write('DEBUG', tokens[globalIndex]);
        let definebody = [];
        definebody.push(tokens[globalIndex]);
        globalIndex += 1; // Move passa constant value
        while (globalIndex < tokens.length && tokens[globalIndex].value !== '#') {
            log_1.default.write('DEBUG', tokens[globalIndex]);
            definebody.push(tokens[globalIndex]);
            globalIndex += 1;
        }
        log_1.default.write('DEBUG', tokens[globalIndex]);
        symbolsCache.set(key + '.Body', {
            id: 'Define',
            type: 'Body',
            name: indent.value,
            size: 1,
            value: definebody,
            context: globalContext,
            line: indent.line,
            startChar: indent.startCharacter,
            endChar: tokens[globalIndex].endCharacter,
        });
        log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
        globalIndex += 1; // Move past the #
        while (globalIndex < tokens.length && tokens[globalIndex].value != ',' && tokens[globalIndex].value != ';') {
            log_1.default.write('DEBUG', 'looking for =');
            log_1.default.write('DEBUG', tokens[globalIndex]);
            globalIndex += 1; // move to next token; 
        }
        if (tokens[globalIndex].value === ',') {
            log_1.default.write('DEBUG', tokens[globalIndex]);
            globalIndex += 1;
        }
        if (tokens[globalIndex].value === ';') {
            log_1.default.write('DEBUG', tokens[globalIndex]);
            globalIndex += 1;
            break;
        }
    }
}
function parseDeclarations(tokens) {
    log_1.default.write('DEBUG', 'called:');
    const constType = parseDataType(tokens, globalIndex);
    globalIndex = constType.index;
    log_1.default.write('DEBUG', `type: ${constType.dataType}`);
    const isIndirection = checkForTypeAt(tokens, globalIndex, 'Indirection');
    log_1.default.write('DEBUG', `isIndirection: ${isIndirection}`);
    // Adjust base position based on indirection. 
    // if indirection we only skip the ident otherwise both
    const basePosition = globalIndex + (isIndirection ? 2 : 1);
    const hasBounds = checkBounds(tokens, basePosition);
    const offset = hasBounds ? 5 : 0;
    const isReadOnly = checkReadOnly(tokens, basePosition + offset);
    log_1.default.write('DEBUG', `isArray: ${hasBounds}`);
    log_1.default.write('DEBUG', `isReadOnly: ${isReadOnly}`);
    if (helpers.isStruct(constType.dataType)) {
        log_1.default.write('DEBUG', 'isStruct: true');
        parseStructure(tokens);
    }
    else if (hasBounds || isReadOnly) {
        log_1.default.write('DEBUG', 'isArray: true');
        parseArray(tokens, constType.dataType);
    }
    else if (isIndirection) {
        log_1.default.write('DEBUG', 'isIndirection: true');
        parseIndirection(tokens, constType.dataType);
    }
    else {
        parseVariable(tokens, constType.dataType);
    }
}
function parseStructure(tokens) {
    log_1.default.write('DEBUG', 'called:');
    requireValue(tokens, globalIndex, "STRUCT");
    globalIndex++;
    // Determine indirection type (. or .EXT) or None
    let indirectionType = "None";
    if (tokens[globalIndex].value === ".") {
        indirectionType = "Indirect";
        globalIndex++;
    }
    else if (tokens[globalIndex].value === ".EXT") {
        indirectionType = "ExtendedIndirect";
        globalIndex++;
    }
    // Get the identifier for the structure
    requireType(tokens, globalIndex, "Identifier");
    const identifierToken = tokens[globalIndex];
    const identifier = identifierToken.value;
    globalIndex++;
    // Parse optional bounds [lower:upper]
    let lowerBound = 0, upperBound = 0;
    if (tokens[globalIndex].value === "[") {
        lowerBound = parseInt(tokens[globalIndex + 1].value, 10);
        upperBound = parseInt(tokens[globalIndex + 3].value, 10);
        globalIndex += 5; // Move past bounds [lower:upper]
    }
    requireValue(tokens, globalIndex, ";");
    globalIndex++;
    // Add structure to symbolCache
    const currentContext = globalContext;
    globalContext += `.${identifier}`;
    addToSymbolCache(currentContext, identifier, {
        id: 'Struct',
        type: 'Struct',
        name: identifier,
        size: upperBound - lowerBound + 1,
        value: "",
        context: currentContext,
        line: identifierToken.line,
        startChar: identifierToken.startCharacter,
        endChar: identifierToken.endCharacter
    });
    // Parse structure layout between BEGIN and END
    const structureLayout = parseStructureLayout(tokens, globalIndex);
    globalIndex = structureLayout.index;
    // Restore the previous context level after parsing this structure
    globalContext = currentContext;
    return {
        AST: {
            type: "DefinitionStructure",
            name: identifier,
            indirectionType,
            bounds: { lower: lowerBound, upper: upperBound },
            structureLayout: structureLayout.AST
        },
        index: globalIndex
    };
}
function parseStructureVariable(tokens, index) {
    log_1.default.write('DEBUG', 'called:');
    const constType = parseDataType(tokens, index);
    index = constType.index;
    requireType(tokens, index, "Identifier");
    const identifier = tokens[index].value;
    index++;
    requireValue(tokens, index, ";");
    index++; // Move past the semicolon
    addToSymbolCache(globalContext, identifier, {
        id: 'Variable',
        type: constType.dataType,
        name: identifier,
        size: 1,
        value: "",
        context: globalContext,
        line: tokens[index].line,
        startChar: tokens[index].startCharacter,
        endChar: tokens[index].endCharacter
    });
    return {
        AST: { type: "Variable", dataType: constType.dataType, name: identifier },
        index
    };
}
function parseStructureArray(tokens, index) {
    log_1.default.write('DEBUG', 'called:');
    const type = tokens[index].value;
    index++;
    requireType(tokens, globalIndex, "Identifier");
    const identifier = tokens[index].value;
    index++;
    let lowerBound = 0, upperBound = 0;
    if (tokens[index].value === "[") {
        lowerBound = parseInt(tokens[index + 1].value, 10);
        upperBound = parseInt(tokens[index + 3].value, 10);
        index += 5;
    }
    addToSymbolCache(globalContext, identifier, {
        id: 'Array',
        type,
        name: identifier,
        size: upperBound - lowerBound + 1,
        value: "",
        context: globalContext,
        line: tokens[index].line,
        startChar: tokens[index].startCharacter,
        endChar: tokens[index].endCharacter
    });
    return {
        AST: { type: "Array", dataType: type, name: identifier, bounds: { lower: lowerBound, upper: upperBound } },
        index
    };
}
function parseSubstructure(tokens, index) {
    log_1.default.write('DEBUG', 'called:');
    requireValue(tokens, globalIndex, "STRUCT");
    index++;
    // Capture the identifier for the structure
    requireType(tokens, globalIndex, "Identifier");
    const identifierToken = tokens[index];
    const identifier = identifierToken.value;
    index++;
    // Handle Referral Structure (STRUCT identifier (referral))
    let structureType = "DefinitionStructure";
    let referral;
    if (tokens[index].value === "(" && tokens[index + 1].type === "Identifier" && tokens[index + 2].value === ")") {
        structureType = "ReferralStructure";
        referral = tokens[index + 1].value; // Referral identifier
        index += 3; // Skip over '(referral)'
    }
    // Parse optional bounds [lower:upper]
    let lowerBound = 0, upperBound = 0;
    if (tokens[index].value === "[") {
        lowerBound = parseInt(tokens[index + 1].value, 10);
        upperBound = parseInt(tokens[index + 3].value, 10);
        index += 5; // Move past bounds [lower:upper]
    }
    // Add the structure to symbolCache
    const currentContext = globalContext;
    globalContext += `.${identifier}`;
    addToSymbolCache(currentContext, identifier, {
        id: 'Struct',
        type: structureType,
        name: identifier,
        size: upperBound - lowerBound + 1,
        value: "",
        context: currentContext,
        line: identifierToken.line,
        startChar: identifierToken.startCharacter,
        endChar: identifierToken.endCharacter
    });
    // For DefinitionStructure, parse structure layout between BEGIN and END
    let structureLayout;
    if (structureType === "DefinitionStructure") {
        const layoutResult = parseStructureLayout(tokens, index);
        structureLayout = layoutResult.AST;
        index = layoutResult.index;
    }
    // Restore previous context level after parsing this structure
    globalContext = currentContext;
    return {
        AST: {
            type: structureType,
            name: identifier,
            bounds: { lower: lowerBound, upper: upperBound },
            structureLayout,
            referral
        },
        index
    };
}
function parseStructureLayout(tokens, index) {
    log_1.default.write('DEBUG', 'called:');
    requireValue(tokens, index, "BEGIN");
    index++;
    const layoutElements = [];
    while (index < tokens.length && tokens[index].value !== "END") {
        const element = parseStructureElement(tokens, index);
        layoutElements.push(element.AST);
        index = element.index;
    }
    requireValue(tokens, index, "END");
    index++;
    return { AST: layoutElements, index };
}
function parseStructureElement(tokens, index) {
    log_1.default.write('DEBUG', 'called:');
    log_1.default.write('DEBUG', tokens[index]);
    const token = tokens[index];
    let element;
    switch (token.value.toUpperCase()) {
        case "STRING":
        case "INT":
        case "UNSIGNED":
        case "FIXED":
        case "REAL":
            // Check if the next token indicates an array declaration
            if (tokens[index + 1].type === "Identifier" && tokens[index + 2].value === "[") {
                const arrayResult = parseStructureArray(tokens, index);
                element = arrayResult.AST;
                index = arrayResult.index;
            }
            else {
                const variableResult = parseStructureVariable(tokens, index);
                element = variableResult.AST;
                index = variableResult.index;
            }
            break;
        case "STRUCT":
            const substructureResult = parseSubstructure(tokens, index);
            element = substructureResult.AST;
            index = substructureResult.index;
            break;
        case "FILLER":
            const fillerResult = parseFiller(tokens, index);
            element = fillerResult.AST;
            index = fillerResult.index;
            break;
        default:
            throwUnexpectedError(tokens, index);
    }
    return { AST: element, index };
}
function parseFiller(tokens, index) {
    log_1.default.write('DEBUG', 'called:');
    let size = 1;
    if (tokens[index].value !== "FILLER" && tokens[index].value !== "BIT_FILLER") {
        throw new Error(`Expected 'FILLER' or 'BIT_FILLER' at index ${index}, but found '${tokens[index].value}' on line '${tokens[index].line}'`);
    }
    const fillerType = tokens[index].value;
    index++;
    if (tokens[index].type === "Number") {
        size = parseInt(tokens[index].value, 10);
        index++;
    }
    return {
        AST: { type: "Filler", fillerType: fillerType, size: size.toString() },
        index
    };
}
function parseArray(tokens, type) {
    log_1.default.write('DEBUG', 'called:');
    const startline = tokens[globalIndex].line;
    const startChar = tokens[globalIndex].startCharacter;
    let endline = tokens[globalIndex].line;
    let endChar = tokens[globalIndex].endCharacter;
    let initialization = null;
    do {
        globalIndex = skipComma(tokens, globalIndex); // Skip comma for multiple variables
        requireType(tokens, globalIndex, "Identifier");
        const ident = parseIdent(tokens);
        log_1.default.write('DEBUG', `ident: ${ident}`);
        const isIndirection = checkForTypeAt(tokens, globalIndex, 'Indirection');
        const indOffset = isIndirection ? 1 : 0;
        const hasBounds = checkBounds(tokens, globalIndex + indOffset);
        const boundOffset = hasBounds ? 5 : 0;
        const isReadOnly = checkReadOnly(tokens, globalIndex + boundOffset);
        const rdOnlyOffset = isReadOnly ? 2 : 0;
        const lowerBound = hasBounds ? Number(tokens[globalIndex + 1].value) : null;
        const upperBound = hasBounds ? Number(tokens[globalIndex + 3].value) : null;
        globalIndex += boundOffset + rdOnlyOffset; // Skip [X:XX] or = 'P' if exists
        if (!checkForValue(tokens, ";") && !checkForValue(tokens, ':=')) {
            log_1.default.write('ERROR', 'failed.');
            throw new Error(`Expected ';' or ':=' at line ${tokens[globalIndex].line}, but found '${tokens[globalIndex].value}' on line '${tokens[globalIndex].line}'`);
        }
        if (tokens[globalIndex].value === ':=') {
            log_1.default.write('DEBUG', tokens[globalIndex]);
            globalIndex++;
            const expressionResult = parseConstantListExpression(tokens, globalIndex);
            initialization = expressionResult.AST;
            globalIndex = expressionResult.index;
        }
        const readOnlySize = getConstantArrayLength(initialization);
        endline = tokens[globalIndex - 1].line;
        endChar = tokens[globalIndex - 1].endCharacter;
        const key = `${globalContext}.${ident}`;
        const line = `[${startline}:${endline}]`;
        const size = hasBounds ? (upperBound - lowerBound + 1) : readOnlySize;
        symbolsCache.set(key, {
            id: isReadOnly ? "ReadOnlyArray" : "Array",
            type,
            name: ident,
            size,
            value: initialization || "",
            context: globalContext,
            line,
            startChar,
            endChar: endChar + 1 // +1 to account for ',' or ';'
        });
        log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
    } while (globalIndex < tokens.length && checkForValue(tokens, ','));
    if (!checkForValue(tokens, ";")) {
        log_1.default.write('ERROR', tokens[globalIndex]); // Expected ';' at end
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
        throw new Error(`Expected '[' after repetition factor at index ${index}, but found '${tokens[index].value}' on line '${tokens[index].line}'`);
    }
}
// Helper: Parse an individual constant (Number, Literal, or String)
function parseConstant(tokens, index) {
    const token = tokens[index];
    if (token.type === 'Number' || token.type === 'Literal' || token.type === 'String' ||
        (token.type === 'Identifier' && literals.has(token.value))) {
        return {
            constantNode: { type: 'Constant', value: token.value },
            newIndex: index + 1
        };
    }
    throw new Error(`Expected constant at index ${index}, found '${token.value} but found '${tokens[index].value}' on line '${tokens[index].line}'`);
}
function parseIndirection(tokens, type) {
    log_1.default.write('DEBUG', 'called:');
    const startline = tokens[globalIndex].line;
    const startChar = tokens[globalIndex].startCharacter;
    let endline = tokens[globalIndex].line;
    let endChar = tokens[globalIndex].endCharacter;
    let initialization = null;
    do {
        globalIndex = skipComma(tokens, globalIndex); // Skip comma for multiple variables
        requireType(tokens, globalIndex, "Identifier");
        const ident = parseIdent(tokens);
        // Determine indirection type (. or .EXT) or None
        let indirectionType = "None";
        if (tokens[globalIndex].value === ".") {
            indirectionType = "Indirect";
            globalIndex++;
        }
        else if (tokens[globalIndex].value === ".EXT") {
            indirectionType = "ExtendedIndirect";
            globalIndex++;
        }
        if (!checkForValue(tokens, ";") && !checkForValue(tokens, ':=')) {
            log_1.default.write('ERROR', 'failed.');
            throw new Error(`Expected ';' or ':=' at line ${tokens[globalIndex].line}, but found '${tokens[globalIndex].value}' on line '${tokens[globalIndex].line}'`);
        }
        if (tokens[globalIndex].value === ':=') {
            log_1.default.write('DEBUG', tokens[globalIndex]);
            globalIndex += 1; // Skip :=
            if (globalContext === 'Global') {
                const expressionResult = parsePointerInitialization(tokens, globalIndex);
                initialization = expressionResult.AST;
                globalIndex = expressionResult.index;
            }
            else {
                const expressionResult = parseExpression(tokens, globalIndex);
                initialization = expressionResult.AST;
                globalIndex = expressionResult.index;
            }
        }
        endline = tokens[globalIndex - 1].line;
        endChar = tokens[globalIndex - 1].endCharacter;
        const key = globalContext + '.' + ident;
        const line = '[' + startline.toString() + ':' + endline.toString() + ']';
        const size = 1;
        symbolsCache.set(key, {
            id: 'Variable',
            type: type,
            name: ident,
            size: size,
            value: initialization || "",
            context: globalContext,
            line: line,
            startChar: startChar,
            endChar: endChar + 1 // +1 account for , o ;
        });
        log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
    } while (globalIndex < tokens.length && checkForValue(tokens, ',')); // fond a comma, let's continue
    if (!checkForValue(tokens, ";")) {
        log_1.default.write('ERROR', tokens[globalIndex]); //NO NO NO TODO: see that to do.
    }
}
function parseVariable(tokens, type) {
    log_1.default.write('DEBUG', 'called:');
    const startline = tokens[globalIndex].line;
    const startChar = tokens[globalIndex].startCharacter;
    let endline = tokens[globalIndex].line;
    let endChar = tokens[globalIndex].endCharacter;
    let initialization = null;
    do {
        globalIndex = skipComma(tokens, globalIndex); // Skip comma for multiple variables
        const ident = parseIdent(tokens);
        if (!checkForValue(tokens, ";") && !checkForValue(tokens, ':=')) {
            log_1.default.write('ERROR', 'failed.');
            throw new Error(`Expected ';' or ':=' at line ${tokens[globalIndex].line}, but found '${tokens[globalIndex].value}' on line '${tokens[globalIndex].line}'`);
        }
        if (tokens[globalIndex].value === ':=') {
            log_1.default.write('DEBUG', tokens[globalIndex]);
            globalIndex += 1; // Skip :=
            if (globalContext === 'Global') {
                const expressionResult = parseVariableInitialization(tokens, globalIndex);
                if (expressionResult) {
                    initialization = expressionResult.AST;
                    globalIndex = expressionResult.index;
                }
            }
            else {
                const expressionResult = parseExpression(tokens, globalIndex);
                initialization = expressionResult.AST;
                globalIndex = expressionResult.index;
            }
        }
        endline = tokens[globalIndex - 1].line;
        endChar = tokens[globalIndex - 1].endCharacter;
        const key = globalContext + '.' + ident;
        const line = '[' + startline.toString() + ':' + endline.toString() + ']';
        const size = 1;
        symbolsCache.set(key, {
            id: 'Variable',
            type: type,
            name: ident,
            size: size,
            value: initialization || "",
            context: globalContext,
            line: line,
            startChar: startChar,
            endChar: endChar + 1 // +1 account for , o ;
        });
        log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
    } while (globalIndex < tokens.length && checkForValue(tokens, ',')); // fond a comma, let's continue
    if (!checkForValue(tokens, ";")) {
        log_1.default.write('ERROR', tokens[globalIndex]); //NO NO NO TODO: see that to do.
    }
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
function parseDataType(tokens, index) {
    log_1.default.write('DEBUG', 'called:');
    log_1.default.write('DEBUG', tokens[index]);
    const opOffset = 1;
    const cpOffset = 3;
    let retType = "";
    const tokenValue = tokens[index].value;
    if (helpers.isString(tokenValue)) {
        let value = tokenValue;
        index += 1;
        retType = value;
    }
    else if (helpers.isInt(tokenValue) ||
        helpers.isReal(tokenValue) ||
        helpers.isUnsigned(tokenValue) ||
        helpers.isFixed(tokenValue)) {
        const width = tokens[index + 2].value;
        if (checkForValueAt(tokens, index + opOffset, '(') &&
            checkForValueAt(tokens, index + cpOffset, ')')) {
            index += 4;
            retType = tokenValue + '(' + width + ')';
        }
        else {
            if (helpers.isUnsigned(tokenValue))
                log_1.default.write('ERROR', tokens[index]); //NO NO NO TODO: see that to do.
            index += 1;
            retType = tokenValue;
        }
    }
    else {
        // Set a default type or handle an unexpected token type
        throw new Error(`Unexpected data type at index ${index}, found '${tokenValue}'`);
    }
    log_1.default.write('DEBUG', `dataType: ${retType}, Index: ${index}`);
    return { dataType: retType, index };
}
function parsePointerInitialization(tokens, index) {
    log_1.default.write('DEBUG', 'called:');
    let reference;
    let arrayIndex;
    let shiftOperation;
    let shiftAmount;
    let pointerValue;
    // Check if the initialization starts with '@' (address reference)
    if (tokens[index].value === '@') {
        index++; // Move past '@'
        // Expect an identifier after '@'
        requireType(tokens, index, "Identifier");
        reference = tokens[index].value;
        index++;
        // Check if it's referencing an array element (e.g., @array[3])
        if (tokens[index].value === '[') {
            index++;
            const expressionResult = parseExpression(tokens, index);
            arrayIndex = expressionResult.AST;
            index = expressionResult.index;
            requireValue(tokens, index, ']');
            index++;
        }
        // Check for optional bit-shift operations (e.g., '<<' 1)
        if (tokens[index]?.value === '<<' || tokens[index]?.value === '>>') {
            shiftOperation = tokens[index].value;
            index++;
            requireType(tokens, index, "Number");
            shiftAmount = tokens[index].value;
            index++;
        }
    }
    else {
        // Handle direct assignment without '@'
        requireType(tokens, index, "Identifier");
        reference = tokens[index].value;
        index++;
        // Check if it's referencing an array element (e.g., a[0])
        if (tokens[index].value === '[') {
            index++;
            const expressionResult = parseExpression(tokens, index);
            arrayIndex = expressionResult.AST;
            index = expressionResult.index;
            requireValue(tokens, index, ']');
            index++;
        }
        // Check for an octal value assignment (like `%100000`)
        if (tokens[index].value.startsWith('%')) {
            requireType(tokens, index, "Number");
            pointerValue = tokens[index].value; // Capture octal value
            index++;
        }
    }
    return {
        AST: {
            type: 'PointerInitialization',
            reference,
            arrayIndex,
            shiftOperation,
            shiftAmount,
            pointerValue
        },
        index
    };
}
function parseExpression(tokens, index, precedence = 0) {
    log_1.default.write('DEBUG', 'called:');
    // Parse the left side of the expression, starting with unary or primary
    let result = precedence === 0 ? parseUnary(tokens, index) : parsePrimary(tokens, index);
    index = result.index;
    // Process operators based on the current precedence level
    while (tokens[index] && getPrecedence(tokens[index]) >= precedence) {
        const operator = tokens[index].value;
        const operatorPrecedence = getPrecedence(tokens[index]);
        index++;
        // Recursively parse the right operand at the next higher precedence level
        const right = parseExpression(tokens, index, operatorPrecedence + 1);
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
    log_1.default.write('DEBUG', 'called:');
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
function parseVariableInitialization(tokens, index, handelError = true) {
    log_1.default.write('DEBUG', 'called:');
    const token = tokens[index];
    if ((token.type === 'Identifier' && searchLiteral(globalContext, token.value))) {
        index++;
        return { AST: { type: 'Literal', value: token.value }, index };
    }
    if ((token.type === 'Identifier' && searchDefine(globalContext, token.value))) {
        index++;
        return { AST: { type: 'Define', value: token.value }, index };
    }
    if (token.type === 'Number') {
        index++;
        return { AST: { type: 'Constant', value: token.value }, index };
    }
    if (token.type === 'Function') {
        return parseFunctionCall(tokens, index);
    }
    if (token.value === '(') {
        index++;
        const expressionResult = parseExpression(tokens, index, 9);
        index = expressionResult.index;
        requireValue(tokens, index, ")");
        index++;
        return { AST: expressionResult.AST, index };
    }
    if (handelError) {
        throwUnexpectedError(tokens, index);
    }
    return undefined;
}
function parsePrimary(tokens, index) {
    log_1.default.write('DEBUG', 'called:');
    const token = tokens[index];
    const result = parseVariableInitialization(tokens, index, false);
    if (result && 'AST' in result) {
        return result;
    }
    else {
        if (token.type === 'Identifier') {
            index++;
            return { AST: { type: 'Variable', name: token.value }, index };
        }
    }
    throwUnexpectedError(tokens, index);
}
function parseFunctionCall(tokens, index) {
    log_1.default.write('DEBUG', 'called:');
    const functionName = tokens[index].value; // Assume function name token
    index++; // Move past function name
    if (tokens[index].value !== '(') {
        throw new Error(`Expected (' after function at index ${index}, but found '${tokens[index].value}' on line '${tokens[index].line}'`);
    }
    index++; // Skip '('
    const argumentsList = [];
    // Parse each argument
    while (tokens[index].value !== ')') {
        const argumentResult = parseExpression(tokens, index, 9); // Parse each argument as an expression
        argumentsList.push(argumentResult.AST);
        index = argumentResult.index;
        // If there's a comma, skip it to continue to the next argument
        if (tokens[index].value === ',') {
            index++; // Skip ','
        }
    }
    if (tokens[index].value !== ')') {
        throw new Error(`')' after function arguments at index ${index}, but found '${tokens[index].value}' on line '${tokens[index].line}'`);
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
    log_1.default.write('DEBUG', 'called:');
    return precedenceMap[token.value] ?? -1;
}
function getTokenValue(tokens) {
    log_1.default.write('DEBUG', 'called:');
    let retVal = '';
    if (tokens[globalIndex] && tokens[globalIndex].value) {
        retVal = tokens[globalIndex].value;
        globalIndex += 1;
    }
    if (!retVal) {
        log_1.default.write('ERROR', tokens[globalIndex]); //NO NO NO TODO: see that to do.
    }
    return retVal;
}
function checkForValue(tokens, value) {
    log_1.default.write('DEBUG', 'called:');
    if (tokens[globalIndex] && tokens[globalIndex].value === value) {
        return true;
    }
    return false;
}
function checkForValueAt(tokens, position, value) {
    log_1.default.write('DEBUG', 'called:');
    if (tokens[globalIndex] && tokens[position].value === value) {
        return true;
    }
    return false;
}
function checkForType(tokens, type) {
    log_1.default.write('DEBUG', 'called:');
    if (tokens[globalIndex] && tokens[globalIndex].type === type) {
        return true;
    }
    return false;
}
function checkForTypeAt(tokens, position, type) {
    log_1.default.write('DEBUG', 'called:');
    if (tokens[globalIndex] && tokens[position].type === type) {
        return true;
    }
    return false;
}
function parseIdent(tokens) {
    log_1.default.write('DEBUG', 'called:');
    let retVal = '';
    // If we find name gets it's value
    if (tokens[globalIndex].type === 'Identifier') {
        retVal = tokens[globalIndex].value;
        log_1.default.write('DEBUG', `Found variable name: ${retVal}`);
        globalIndex += 1;
        return retVal;
    }
    log_1.default.write('ERROR', tokens[globalIndex]); //NO NO NO TODO: see that to do.
    return retVal;
}
function parseCrossRefDirective(tokens) {
    log_1.default.write('DEBUG', tokens[globalIndex]);
    log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
    return globalIndex;
}
function parseColumnsDirective(tokens) {
    log_1.default.write('DEBUG', tokens[globalIndex]);
    log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
    return globalIndex;
}
function parseAssertionDirective(tokens) {
    log_1.default.write('DEBUG', tokens[globalIndex]);
    log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
    return globalIndex;
}
function parseSimpleDirective(tokens) {
    log_1.default.write('DEBUG', tokens[globalIndex]);
    const directive = tokens[globalIndex];
    const key = globalContext + '.' + directive.value;
    symbolsCache.set(key, {
        id: 'Directive',
        type: 'none',
        name: directive.value,
        size: 1,
        value: '',
        context: globalContext,
        line: directive.line,
        startChar: directive.startCharacter,
        endChar: directive.endCharacter,
    });
    globalIndex += 1; // Move to ABORT or NOABORT VALUE
    log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
    if (tokens[globalIndex].type === 'Delimiter' && tokens[globalIndex].value === ',') {
        log_1.default.write('DEBUG', tokens[globalIndex]);
        globalIndex += 1; // Move past the comma;
    }
    return globalIndex;
}
function parseTargetDirective(tokens) {
    log_1.default.write('DEBUG', tokens[globalIndex]);
    const target = tokens[globalIndex];
    globalIndex += 1; // Move to TARGET KEYWORD
    const value = tokens[globalIndex];
    const key = globalContext + '.' + target.value;
    symbolsCache.set(key, {
        id: 'Directive',
        type: 'none',
        name: target.value,
        size: 1,
        value: value.value,
        context: globalContext,
        line: target.line,
        startChar: target.startCharacter,
        endChar: target.endCharacter,
    });
    globalIndex += 1; // Move to TARGET VALUE
    log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
    return globalIndex;
}
function parseSourceDirective(tokens) {
    log_1.default.write('DEBUG', 'called:');
    let source = '';
    let key = '';
    globalIndex += 1; // Move past the SOURCE KEYWORD
    while (tokens[globalIndex] && !(tokens[globalIndex].type === 'Delimiter' && tokens[globalIndex].value === '(')) {
        log_1.default.write('DEBUG', tokens[globalIndex]);
        source += tokens[globalIndex].value;
        globalIndex += 1; // Move to next token
    }
    globalIndex += 1; // Move past the open parentesis
    while (tokens[globalIndex] && !(tokens[globalIndex].type === 'Delimiter' && tokens[globalIndex].value === ')')) {
        log_1.default.write('DEBUG', tokens[globalIndex]);
        if (tokens[globalIndex].value === "," ||
            tokens[globalIndex].value === "?" ||
            tokens[globalIndex].value === "<CR><LF>")
            globalIndex += 1; // Move past the comma;
        else {
            let func = tokens[globalIndex];
            key = globalContext + '.' + func.value;
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
            globalIndex += 1; // Move past the directive
            log_1.default.write('DEBUG', `symbolTable Added = ${JSON.stringify(Array.from(symbolsCache.entries()).pop())}.`);
        }
    }
    if (tokens[globalIndex] && tokens[globalIndex].type === 'Delimiter' && tokens[globalIndex].value === ')') {
        log_1.default.write('DEBUG', tokens[globalIndex]);
        globalIndex += 1; // Move past the )
    }
    return globalIndex;
}
function skipNewlines(tokens, index) {
    log_1.default.write('DEBUG', 'called:');
    while (index < tokens.length && tokens[index].type === 'NewLine') {
        index += 1; // Move past the comma;
    }
    return index;
}
function getConstantArrayLength(ast) {
    log_1.default.write('DEBUG', 'called:');
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