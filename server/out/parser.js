"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log_1 = require("./log");
let symbolTable = [];
// Main Parsing Function
function parseTokens(tokens) {
    log_1.default.write('DEBUG', 'parseTokens called:');
    let index = 0;
    symbolTable.length = 0; // Clears the array
    while (tokens[index]) {
        const currentToken = tokens[index];
        // Parse comment
        if (tokens[index] && currentToken.type === 'Comment') {
            index = parseComment(tokens, index);
        }
        // Parse commentLine
        else if (tokens[index] && currentToken.type === 'CommentLine') {
            index = parseCommentLine(tokens, index);
            //}
            // Parse directives at the start
            // else if (tokens[index] && currentToken.type === 'DirectiveLine') {
            //     parseDirectives(tokens, index);
        }
        else {
            //log.write('DEBUG', 'Else Before:');
            //log.write('DEBUG', tokens[index]);
            index += 1;
            //log.write('DEBUG', 'Esle after:');
            //log.write('DEBUG', tokens[index]);
        }
    }
    return symbolTable;
}
function parseComment(tokens, index) {
    log_1.default.write('DEBUG', 'parseComment called:');
    index += 1; // Move past the ! comment
    while (tokens[index] && tokens[index].type != 'Comment' && tokens[index].type != 'NewLine') {
        log_1.default.write('DEBUG', tokens[index]);
        index += 1; // move to next token;
    }
    return index += 1;
}
function parseCommentLine(tokens, index) {
    log_1.default.write('DEBUG', 'parseCommentLine called:');
    index += 1; // Move past the ! comment
    while (tokens[index] && tokens[index].type != 'NewLine') {
        log_1.default.write('DEBUG', tokens[index]);
        index += 1; // move to next token;
    }
    return index += 1;
}
function parseDirectives(tokens, index) {
    log_1.default.write('DEBUG', 'parseDirectives called:');
    index++; // Move past the ? directive LIne
    while (tokens[index].type != 'NewLine') {
        if (tokens[index].value.toUpperCase() === 'SOURCE') {
            index++; // Move past the SOURCE KEYWORD
            // parseSourceDirective(tokens, index);
        }
        else {
            symbolTable.push({
                name: tokens[index].value,
                kind: 'Directive',
                type: 'none',
                line: tokens[index].line,
                startChar: tokens[index].startCharacter,
                endChar: tokens[index].endCharacter,
            });
            index++; // Move past the directive
        }
        index++; // Move past the comma;
    }
}
function parseSourceDirective(tokens, index) {
    const directive = tokens[index].value; // Directive value
    const line = tokens[index].line; // Directive line
    const sc = tokens[index].startCharacter; // Directive starts with '!'
    const ec = tokens[index].endCharacter; // Directive starts with '!'
    let source = '';
    while (tokens[index] && !(tokens[index].type === 'Delimiter' && tokens[index].value === '(')) {
        source += tokens[index].value;
        index++; // Move to next token
    }
    index++; // Move past the open parentesis
    while (tokens[index] && !(tokens[index].type === 'Delimiter' && tokens[index].value === ')')) {
        if (tokens[index].value === "," ||
            tokens[index].value === "?" ||
            tokens[index].value === "<CR><LF>")
            index++; // Move past the comma;
        else {
            symbolTable.push({
                name: tokens[index].value,
                kind: 'Function',
                type: 'none',
                line: tokens[index].line,
                startChar: tokens[index].startCharacter,
                endChar: tokens[index].endCharacter,
            });
        }
    }
}
// Function to parse function declarations (e.g., "PROC myFunction")
function parseFunction(tokens, i, symbolTable) {
    const functionName = tokens[i + 1]; // The function name follows 'PROC'
    // Add the function to the symbol table
    symbolTable.push({
        name: functionName.value,
        kind: 'Function',
        type: 'none',
        line: functionName.line,
        startChar: functionName.startCharacter,
        endChar: functionName.endCharacter, // End character position
    });
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
        symbolTable.push({
            name: varName.value,
            kind: 'Variable',
            type: dataType,
            line: varName.line,
            startChar: varName.startCharacter,
            endChar: varName.endCharacter, // End character position
        });
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