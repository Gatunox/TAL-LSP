"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let symbolTable = [];
// Main Parsing Function
function parseTokens(tokens) {
    let i = 0;
    symbolTable.length = 0; // Clears the array
    while (i < tokens.length) {
        const currentToken = tokens[i];
        if (currentToken.type === 'Keyword' && currentToken.value === 'PROC') {
            // Parse function declaration
            i = parseFunction(tokens, i, symbolTable); // Pass the current index and symbol table
        }
        else if (currentToken.type === 'Keyword' && isDataType(currentToken.value)) {
            // Parse variable declaration
            i = parseVariable(tokens, i, symbolTable); // Pass the current index and symbol table
        }
        else {
            i++; // Move to the next token if it's not a function or variable
        }
    }
    return symbolTable;
}
// Helper to check if a token is a datatype (for variable declarations)
function isDataType(value) {
    const dataTypes = ['INT', 'STRING', 'FLOAT']; // You can expand this list
    return dataTypes.includes(value);
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