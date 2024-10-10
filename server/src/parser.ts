import * as helpers from './helper';
import { Token } from './helper';
import log from './log';

export interface SymbolEntry {
    kind: 'Directive' | 'Function' | 'Variable' | 'Constant' | 'Keyword';  // The kind of symbol
    type: string;      // Data type (for variables) or return type (for functions)
    name: string;      // The name of the symbol (e.g., function name, variable name)
    value: string;     // The value of a literal or variable
    context: string;   // The context Function, Struct, global where the symbol is declared
    line: number;      // Line number where the symbol is declared
    startChar: number; // Start character position
    endChar: number;   // End character position
}

let symbolTable: SymbolEntry[] = [];
let context: string = 'Global';

// Main Parsing Function
function parseTokens(tokens: Token[]): SymbolEntry[] {
    log.write('DEBUG', 'parseTokens called:');
    let index = 0;

    symbolTable.length = 0;  // Clears the array
    while (index < tokens.length ) {

        if (!tokens[index]) continue;
        log.write('DEBUG', tokens[index]);

        // Parse comment
        if (tokens[index] && tokens[index].type === 'Comment') {
            index = parseComment(tokens, index);
        }
        // Parse commentLine
        else if (tokens[index] && tokens[index].type === 'CommentLine') {
            index = parseCommentLine(tokens, index);
        }
        // Parse directives
        else if (tokens[index] && tokens[index].type === 'DirectiveLine') {
            index = parseDirectives(tokens, index);            
        } else {
            //log.write('DEBUG', 'Else Before:');
            //log.write('DEBUG', tokens[index]);
            index+=1;
            //log.write('DEBUG', 'Esle after:');
            //log.write('DEBUG', tokens[index]);
        }
    }    
    return symbolTable;
}

function parseComment(tokens: Token[], index: number): number {
    log.write('DEBUG', 'parseComment called:');
    index+=1; // Move past the ! comment
    while (tokens[index] && tokens[index].type != 'Comment' && tokens[index].type != 'NewLine') {
        log.write('DEBUG', tokens[index]);
        index+=1;  // move to next token; 
    }
    if (tokens[index] && tokens[index].type === 'Comment' && tokens[index].value === '!'){
        log.write('DEBUG', tokens[index]);
        index+=1;  // Move past the !
    }
    return index;
}

function parseCommentLine(tokens: Token[], index: number) {
    log.write('DEBUG', 'parseCommentLine called:');
    index+=1; // Move past the ! comment
    while (tokens[index] && tokens[index].type != 'NewLine') {
        log.write('DEBUG', tokens[index]);
        index+=1;  // move to next token;
    }
    return index;
}

function parseDirectives(tokens: Token[], index: number) {
    log.write('DEBUG', tokens[index]);
    index+=1; // Move past the ! comment
    while (tokens[index] && tokens[index].type != 'NewLine') {
        log.write('DEBUG', tokens[index]);
        if (tokens[index] && tokens[index].type === 'Comment') {
            index = parseComment(tokens, index);
        } else if (tokens[index].value.toUpperCase() === 'TARGET') {
            index = parseTargetDirective(tokens, index);            
        } else if (tokens[index].value.toUpperCase() === 'SOURCE') {
            index = parseSourceDirective(tokens, index);
        } else {
            symbolTable.push({
                kind: 'Directive',
                type: 'none',
                name: tokens[index].value,
                value: '',
                context: context,
                line: tokens[index].line,
                startChar: tokens[index].startCharacter,
                endChar: tokens[index].endCharacter,
            });
            log.write('DEBUG', `symbolTable Added = ${JSON.stringify(symbolTable[symbolTable.length - 1])}.`)
            index+=1;  // Move past the directive
            if (tokens[index].type === 'Delimiter' && tokens[index].value === ','){
                log.write('DEBUG', tokens[index]);
                index+=1;  // Move past the comma;
            }
        }        
    }
    if ( tokens[index] && tokens[index].type === 'NewLine' && tokens[index].value === '<CR><LF>'){
        log.write('DEBUG', tokens[index]);
        index+=1;  // Move past the newline
    }
    return index;
}

function parseTargetDirective(tokens: Token[], index: number) {
    log.write('DEBUG', tokens[index]);
    let target = tokens[index];
    index+=1;  // Move to TARGET KEYWORD
    let value = tokens[index];
    symbolTable.push({
        kind: 'Directive',
        type: 'none',
        name: target.value,
        value: value.value,
        context: context,
        line: target.line,
        startChar: target.startCharacter,
        endChar: target.endCharacter,
    });
    index+=1;  // Move to TARGET VALUE
    log.write('DEBUG', `symbolTable Added = ${JSON.stringify(symbolTable[symbolTable.length - 1])}.`)
    return index;
}

function parseSourceDirective(tokens: Token[], index: number) {
    let source = '';
    index+=1;  // Move past the SOURCE KEYWORD
    while (tokens[index] && !(tokens[index].type === 'Delimiter' && tokens[index].value === '(')) {
        log.write('DEBUG', tokens[index]);
        source += tokens[index].value;
        index+=1;  // Move to next token
    }
    index+=1;  // Move past the open parentesis
    while (tokens[index] && !(tokens[index].type === 'Delimiter' && tokens[index].value === ')')) {
        log.write('DEBUG', tokens[index]);
        if (tokens[index].value === "," ||
            tokens[index].value === "?" ||
            tokens[index].value === "<CR><LF>")
            index+=1;  // Move past the comma;
        else {
            symbolTable.push({
                kind: 'Function',
                type: 'none',
                name: tokens[index].value,
                value: '',
                context: source,
                line: tokens[index].line,
                startChar: tokens[index].startCharacter,
                endChar: tokens[index].endCharacter,
            });
            log.write('DEBUG', `symbolTable Added = ${JSON.stringify(symbolTable[symbolTable.length - 1])}.`)
            index+=1;  // Move past the directive
        }
    }
    if (tokens[index] && tokens[index].type === 'Delimiter' && tokens[index].value === ')'){
        log.write('DEBUG', tokens[index]);
        index+=1;  // Move past the )
    }
    return index;
}

// Function to parse function declarations (e.g., "PROC myFunction")
function parseFunction(tokens: Token[], i: number, symbolTable: SymbolEntry[]): number {
    const functionName = tokens[i + 1];  // The function name follows 'PROC'

    // Add the function to the symbol table
    symbolTable.push({
        kind: 'Function',
        type: 'none',
        name: functionName.value,
        value: '',
        context: context,
        line: functionName.line,
        startChar: functionName.startCharacter,
        endChar: functionName.endCharacter,   // End character position
    });

    // Skip over the 'PROC' and the function name, and return the new index position
    return i + 2;
}

// Function to parse variable declarations (e.g., "INT myVar1, myVar2")
function parseVariable(tokens: Token[], i: number, symbolTable: SymbolEntry[]): number {
    const dataType = tokens[i].value;  // The type of the variable (e.g., 'INT')
    i++;  // Move to the variable name(s)

    // Collect variable names
    while (tokens[i] && tokens[i].type === 'Name') {
        const varName = tokens[i];

        // Add the function to the symbol table
        symbolTable.push({
            kind: 'Variable',
            type: dataType,
            name: varName.value,
            value: '',
            context: context,
            line: varName.line,
            startChar: varName.startCharacter,
            endChar: varName.endCharacter,   // End character position
        });

        i++;  // Move to the next token (either another variable or end of the declaration)

        // Check if there is a comma between variables (e.g., "INT myVar1, myVar2;")
        if (tokens[i] && tokens[i].value === ',') {
            i++;  // Skip over the comma and move to the next variable
        }
    }

    return i;  // Return the updated index
}

export default parseTokens;