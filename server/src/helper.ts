import { integer } from 'vscode-languageserver';
import log from './log';

const LETTER = /[a-zA-Z_^]/
const WHITESPACE = /[ \t]+/;  // Matches spaces and tabs
const BINARY_NUMBER = /^[0-1]+$/
const OCTAL_NUMBER = /^[0-7]+$/
const HEXADECIMAL_NUMBER = /^[0-9A-F]+$/i;
const DECIMAL_NUMBER = /^[0-9]+$/
const LINECOMMENT = /^--$/
const CRLF = /\r\n/;
const DIRECTIVE = /\?/;

/*********************************************************************************************************************************/
/************************************************************  SYMBOLS  *********************************************************/
/*********************************************************************************************************************************/
const INDIRECTION_SYMBOLS = [".", ".EXT ", ".SG ",];
const BASE_ADDRESS_SYMBOLS = ["'P'", "'G'", "'L'", "'P'", "'S'", "'SG'",];
const DELIMITER_SYMBOLS = ["!", "--", ",", ";", ".", "<", ">", ":", "(", ")", "[", "]", "->", "\"", "=", "#", "'", "$", "?"];
const NUMERIC_BASE_SYMBOLS = ["%H", "%B", "%"];
const NUMERIC_SUFFIX_SYMBOLS = ["%D", "%F", "D", "F"];
/*********************************************************************************************************************************/
/***********************************************************  OPERATORS  *********************************************************/
/*********************************************************************************************************************************/
const ASSIGMENT_OPERATORS = [":="];
const MOVE_OPERATORS = ["':='", "'=:'", "&"];
const LABEL_CASE_OPERATORS = [".."];
const REMOVE_INDIRECTION_OPERATOR = ["@"];
const REPETITION_OPERATOR = ["*"];
const TEMPLATE_STRUCTURE_OPERATOR = ["(*)"];
const FIXED_PARAM_TYPE_OPERATOR = ["(*)"];
const DEREFERECING_OPERATOR = ["."];
const BIT_FIELD_OPERATOR = ["."];
const BIT_SHIFT_OPERATORS = ["<<", ">>", "'<<'", "'>>'"];
const ARITHMETIC_EXPRESION_OPERATORS = ["+", "-", "*", "/", "'*'", "'/'", "'\\'", "'+'", "'–'", "LOR", "LAND", "XOR"];
const RELACTIONAL_EXPRESION_OPERATORS = ["<", "=", ">", "<=", ">=", "<>", "'<'", "'='", "'>'", "'<='", "'>='", "'<>'"];
const BOOLEAN_EXPRESION_OPERATORS = ["AND", "OR", "NOT"];
/*********************************************************************************************************************************/
/*********************************************************** DIRECTIVES **********************************************************/
/*********************************************************************************************************************************/
const SIMPLE_COMPILER_DIRECTIVES = ['NOABORT', 'ABSLIST', 'NOABSLIST', 'BEGINCOMPILATION', 'CHECK', 'NOCHECK', 
    'PUSHCHECK', 'POPCHECK', 'CODE', 'NOCODE', 'PUSHCODE', 'POPCODE', 
    'COMPACT', 'NOCOMPACT', 'DEFEXPAND', 'NODEFEXPAND', 'PUSHDEFEXPAND', 'POPDEFEXPAND', 
    'DUMPCONS', 'FIXUP', 'NOFIXUP', 'FMAP', 'NOFMAP', 'GMAP', 
    'NOGMAP', 'HIGHPIN', 'HIGHREQUESTERS', 'ICODE', 'NOICOD', 'PUSHICODE', 
    'POPICODE', 'INHIBITXX', 'NOINHIBITXX', 'INNERLIST', 'NOINNERLIST', 'PUSHINNERLIST', 
    'POPINNERLIST', 'INSPECT', 'NOINSPECT', 'INT32INDEX', 'NOINT32INDEX', 'PUSHINT32INDEX', 
    'POPINT32INDEX', 'LIST', 'NOLIST', 'PUSHLIST', 'POPLIST', 'MAP',
    'NOMAP', 'PUSMAP', 'POPMAP', 'OLDFLTSTDFUNC', 'PRINTSYM', 'NOPRINTSYM',
    'RELOCATE', 'ROUND', 'NOROUND', 'RUNNAMED', 'SAVEABEND', 'NOSAVEABEND', 
    'SUPPRESS', 'NOSUPPRESS', 'SYMBOLS', 'NOSYMBOLS', 'SYNTAX'];

const COMPLEX_COMPILER_DIRECTIVES = ["ASSERTION", "COLUMNS", "CPU", "CROSSREF", "NOCROSSREF", "DATAPAGES",
    "DECS", "DEFINETOG", "ENV", "ERRORFILE", "ERRORS", "EXTENDSTACK",
    "EXTENDTALHEAP", "HEAP", "IF", "IFNOT", "ENDIF", "LARGESTACK",
    "LIBRARY", "LINES", "LMAP", "NOLMAP", "OPTIMIZE", "PAGE",
    "PEP", "RESETTOG", "RP", "DEFINETOG", "SAVEGLOBALS", "SEARCH",
    "SECTION", "SETTOG", "SOURCE", "STACK", "SUBTYPE", "SYMBOLPAGES",
    "USEGLOBALS", "WARN", "NOWARN"];

const COMPILER_DIRECTIVES = [...SIMPLE_COMPILER_DIRECTIVES, ...COMPLEX_COMPILER_DIRECTIVES];
/*********************************************************************************************************************************/
/***********************************************************  KEYWORDS  **********************************************************/
/*********************************************************************************************************************************/
const KEYWORDS = ["AND", "DO", "FORWARD", "MAIN", "RETURN", "TO",
    "ASSERT", "DOWMTO", "GOTO", "NOT", "RSCAN", "UNSIGNED",
    "BEGIN", "DROP", "IF", "OF", "SCAN", "UNTIL",
    "BY", "ELSE", "INT", "OR", "STACK", "USE",
    "CALL", "END", "INTERRUPT", "OTHERWISE", "STORE", "VARIABLE",
    "CALLABLE", "ENTRY", "LABEL", "PRIV", "STRING", "WHILE",
    "CASE", "EXTERNAL", "LAND", "PROC", "STRUCT", "XOR",
    "CODE", "FIXED", "LITERAL", "REAL", "SUBPROC", 
    "DEFINE", "FOR", "LOR", "RESIDENT", "THEN",
]
/*********************************************************************************************************************************/
/********************************************************** DATA TYPES  **********************************************************/
/*********************************************************************************************************************************/
const DATA_TYPES = ["STRING",
    "INT",
    "FIXED",
    "REAL",
    "UNSIGNED", 
]
/*********************************************************************************************************************************/
/****************************************************** STANDAR FUNCIOTNS  **********************************************************/
/*********************************************************************************************************************************/
const STANDARD_FUNCTIONS = ["$ABS", "$ALPHA", "$BITLENGTH", "$BITOFFSET", "$CARRY",
    "$COMP", "$DBL", "$DBLL", "$DBLR", "$DFIX", "$EFLT", "$EFLTR", "$FIX",
    "$FIXD", "$FIXI", "$FIXL", "$FIXR", "$FLT", "$FLTR", "$HIGH", "$IFIX",
    "$INT", "$INTR", "LADR", "$LEN", "$LFIX", "$LMAX", "$LMIN", "$MAX",
    "$MIN", "$NUMERIC", "$OCCURS", "$OFFSET", "$OPTIONAL", "OVERFLOW",
    "$PARAM", "$POINT", "$READCLOCK", "$RP", "$SCALE", "$SPECIAL",
    "$TYPE", "$UDBL", "$USERCODE", "$XADR"
]

/* TODO */
/* Check to see how to address the + and - Unary operators */

let cursor = 0;

export const getCursor = function getCursor(): number {
    return cursor;
};
export const resetCursor = (): void => {
    cursor = 0;
};
export const moveCursor = (length: number): void => {
    cursor += length;
};
export const skipCharacters = (input: string, numberOfCharacter: number): void => {
    do {
        getCharacter(input);
    } while (numberOfCharacter-- > 0);
};
export const getCharacter = (input: string): string => {
    if (!(getCursor() < input.length)) return "";
    const character = input[cursor];
    log.write('DEBUG', `returned "${character}" at ${cursor}.`)
    cursor += 1;
    return character;
};
export const getCharacters = (input: string, numberOfCharacter: number): string => {
    if (!(getCursor() + numberOfCharacter <= input.length)) return "";
    const characters = input.substring(cursor, cursor + numberOfCharacter);
    log.write('DEBUG', `returned "${characters}", (${characters.length}), at ${cursor}, for ${numberOfCharacter}.`)
    cursor += numberOfCharacter;
    return characters;
};
export const getLastElement = (arr: Token[]): any | undefined => {
    if (arr.length === 0) {
        return undefined;
    }
    return arr[arr.length - 1];
}
export const getLastType = (arr: Token[]): string => {
    const token = getLastElement(arr);
    log.write('DEBUG', `returned ${token.type}.`)
    if (token) {
        return token.type;
    } else {
        return "";
    }
}
export const getPreviousTokenValue = (arr: Token[]): string => {
    const token = getLastElement(arr);
    log.write('DEBUG', `returned ${token.value}.`)
    if (token) {
        return token.value;
    } else {
        return "";
    }
}
export const peekCharacter = (input: string): string => {
    if (!(getCursor() < input.length)) return "";
    const character = input[cursor];
    log.write('DEBUG', `returned "${character}" at ${cursor}.`)
    return character;
};
export const peekCharacterAt = (input: string, offsetCursor: number = 0): string => {
    if (!(getCursor() < input.length)) return "";
    let tempCursor = cursor + offsetCursor;
    const character = input.substring(tempCursor, tempCursor + 1);
    log.write('DEBUG', `returned "${character}" at ${tempCursor}.`)
    return character;
};
export const peekCharacters = (input: string, numberOfCharacter: number): string => {
    if (!(getCursor() + numberOfCharacter < input.length)) return "";
    const characters = input.substring(cursor, cursor + numberOfCharacter);
    log.write('DEBUG', `returned "${characters}", (${characters.length}), at ${cursor}, for ${numberOfCharacter}.`)
    return characters;
};
export const isNewLine = (text: string): boolean => {
    log.write('DEBUG', `text = ${text}, at ${cursor}`)
    const retVal = CRLF.test(text);
    log.write('DEBUG', `returned "${retVal}" for character ${text}, at ${cursor}`)
    return retVal;
};
export const isLetter = (character: string, ignoredSpace: boolean): boolean => {
    const retVal = ignoredSpace ? LETTER.test(character) : LETTER.test(character) || character === " ";
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isWhitespace = (character: string): boolean => {
    const retVal = WHITESPACE.test(character);
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isNumericBase = (input: string): number => {

    for (let base of NUMERIC_BASE_SYMBOLS) {
        if (input.toLowerCase().startsWith(base.toLowerCase(), cursor)) {
            log.write('DEBUG', `returned "${base.length}" for character ${base}, at ${cursor}`)
            return base.length;
        }
    }
    return 0;
}
export const isNumericSuffix = (input: string): number => {

    for (let suffix of NUMERIC_SUFFIX_SYMBOLS) {
        if (input.toLowerCase().startsWith(suffix.toLowerCase(), cursor)) {
            log.write('DEBUG', `returned "${suffix.length}" for character ${suffix}, at ${cursor}`)
            return suffix.length;
        }
    }
    return 0;
}
export const isDecimalNumber = (digit: string): boolean => {
    
    const isNumber = DECIMAL_NUMBER.test(digit);
    log.write('DEBUG', `returned "${isNumber}" for character ${digit}, at ${cursor}`)

    return isNumber;
}
export const isOctalNumber = (digit: string): boolean => {
    
    const isNumber = OCTAL_NUMBER.test(digit);
    log.write('DEBUG', `returned "${isNumber}" for character ${digit}, at ${cursor}`)

    return isNumber;
}
export const isBinaryNumber = (digit: string): boolean => {
    
    const isNumber = BINARY_NUMBER.test(digit);
    log.write('DEBUG', `returned "${isNumber}" for character ${digit}, at ${cursor}`)
    
    return isNumber;
}

export const isHexadecimalNumber = (digit: string): boolean => {
    
    const isNumber = HEXADECIMAL_NUMBER.test(digit);
    log.write('DEBUG', `returned "${isNumber}" for character ${digit}, at ${cursor}`)
    
    return isNumber;
}
export const isDot = (character: string): boolean => {
    const retVal = (character === ".");
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isNumber = (digit: string, base: string = ""): boolean => {
    if (base === "") {
        return isDecimalNumber(digit);
    } else if (base === '%'){
        return isOctalNumber(digit);
    } else if (base === '%B'){
        return isBinaryNumber(digit);
    } else if (base === '%H'){
        return isHexadecimalNumber(digit);
    }
    return false
    //throw new Error(`Invalid base value ${base}, possible value are "", %, %B and %H'`);
}
export const isCompilerDirectiveLine = (word: string): boolean => {
    const retVal = DIRECTIVE.test(word);
    log.write('DEBUG', `returned "${retVal}" for character ${word}, at ${cursor}`)
    return retVal;
}
export const isCompilerDirective = (word: string): boolean => {
    const retVal = COMPILER_DIRECTIVES.some(directive => directive.toLowerCase() === word.toLowerCase());
    log.write('DEBUG', `returned "${retVal}" for word ${word}, at ${cursor}`)
    return retVal;    
}
export const isSimpleCompilerDirective = (word: string): boolean => {
    const retVal = SIMPLE_COMPILER_DIRECTIVES.some(directive => directive.toLowerCase() === word.toLowerCase());
    log.write('DEBUG', `returned "${retVal}" for word ${word}, at ${cursor}`)
    return retVal;    
}
export const isStandarFucntions = (word: string): boolean => {
    const retVal = STANDARD_FUNCTIONS.some(stdfunc => stdfunc.toLowerCase() === word.toLowerCase());
    log.write('DEBUG', `returned "${retVal}" for word ${word}, at ${cursor}`)
    return retVal;    
}
export const isOpeneningComment = (character: string): boolean => {
    const retVal = (character === "!");
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isClosingComment = (character: string): boolean => {
    const retVal = (character === "!");
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isSingleLineComment = (character: string): boolean => {
    const retVal = LINECOMMENT.test(character);
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isOpeneningParenthesis = (character: string): boolean => {
    const retVal = (character === "(");
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isClosingParenthesis = (character: string): boolean => {
    const retVal = (character === ")");
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isOpeneningIndex = (character: string): boolean => {
    const retVal = (character === "[");
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isClosingIndex = (character: string): boolean => {
    const retVal = (character === "]");
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isOpeneningBit = (character: string): boolean => {
    const retVal = (character === "<");
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isClosingBit = (character: string): boolean => {
    const retVal = (character === ">");
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isComment = (character: string): boolean => {
    const retVal = isOpeneningComment(character) || isClosingComment(character);
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isAngleBrackets = (character: string): boolean => {
    const retVal = isOpeneningBit(character) || isClosingBit(character);
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isSquareBrackets = (character: string): boolean => {
    const retVal = isOpeneningIndex(character) || isClosingIndex(character);
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isParenthesis = (character: string): boolean => {
    const retVal = isOpeneningParenthesis(character) || isClosingParenthesis(character);
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isQuote = (character: string): boolean => {
    const retVal = (character === '"');
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isKeyword = (word: string): boolean => {
    const retVal = KEYWORDS.some(keyword => keyword.toLowerCase() === word.toLowerCase());
    log.write('DEBUG', `returned "${retVal}" for word ${word}, at ${cursor}`)
    return retVal;
}
export const isDefine = (word: string): boolean => {
    const retVal = 'DEFINE' === word.toUpperCase();
    log.write('DEBUG', `returned "${retVal}" for word ${word}, at ${cursor}`)
    return retVal;
}
export const isLiteral = (word: string): boolean => {
    const retVal = 'LITERAL' === word.toUpperCase();
    log.write('DEBUG', `returned "${retVal}" for word ${word}, at ${cursor}`)
    return retVal;
}
export const isString = (word: string): boolean => {
    const retVal = 'STRING' === word.toUpperCase();
    log.write('DEBUG', `returned "${retVal}" for word ${word}, at ${cursor}`)
    return retVal;
}
export const isInt = (word: string): boolean => {
    const retVal = 'INT' === word.toUpperCase();
    log.write('DEBUG', `returned "${retVal}" for word ${word}, at ${cursor}`)
    return retVal;
}
export const isReal = (word: string): boolean => {
    const retVal = 'REAL' === word.toUpperCase();
    log.write('DEBUG', `returned "${retVal}" for word ${word}, at ${cursor}`)
    return retVal;
}
export const isUnsigned = (word: string): boolean => {
    const retVal = 'UNSIGNED' === word.toUpperCase();
    log.write('DEBUG', `returned "${retVal}" for word ${word}, at ${cursor}`)
    return retVal;
}
export const isFixed = (word: string): boolean => {
    const retVal = 'UNSIGNED' === word.toUpperCase();
    log.write('DEBUG', `returned "${retVal}" for word ${word}, at ${cursor}`)
    return retVal;
}
export const isDataType = (word: string): boolean => {
    const retVal = DATA_TYPES.some(dataType => dataType.toLowerCase() === word.toLowerCase());
    log.write('DEBUG', `returned "${retVal}" for word ${word}, at ${cursor}`)
    return retVal;
}
export const isDelimiter = (character: string): boolean => {
    const retVal = DELIMITER_SYMBOLS.some(delimiter => delimiter.toLowerCase() === character.toLowerCase());
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
export const isAssigmentOperator = (character: string): boolean => {
    const retVal = ASSIGMENT_OPERATORS.some(operator => operator.toLowerCase() === character.toLowerCase());
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isMoveOperator = (character: string): boolean => {
    const retVal = MOVE_OPERATORS.some(operator => operator.toLowerCase() === character.toLowerCase());
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isLabelCaseOperator = (character: string): boolean => {
    const retVal = LABEL_CASE_OPERATORS.some(operator => operator.toLowerCase() === character.toLowerCase());
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isRemoveIndirectionOperator = (character: string): boolean => {
    const retVal = REMOVE_INDIRECTION_OPERATOR.some(operator => operator.toLowerCase() === character.toLowerCase());
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isRepetitionOperator = (character: string): boolean => {
    const retVal = REPETITION_OPERATOR.some(operator => operator.toLowerCase() === character.toLowerCase());
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isTemplateStructureOperator = (character: string): boolean => {
    const retVal = TEMPLATE_STRUCTURE_OPERATOR.some(operator => operator.toLowerCase() === character.toLowerCase());
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isFixedParamTypeOperator = (character: string): boolean => {
    const retVal = FIXED_PARAM_TYPE_OPERATOR.some(operator => operator.toLowerCase() === character.toLowerCase());
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isDereferencingOperator = (character: string): boolean => {
    const retVal = DEREFERECING_OPERATOR.some(operator => operator.toLowerCase() === character.toLowerCase());
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isBitFieldOperator = (character: string): boolean => {
    const retVal = BIT_FIELD_OPERATOR.some(operator => operator.toLowerCase() === character.toLowerCase());
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isBitShilfOperator = (character: string): boolean => {
    const retVal = BIT_SHIFT_OPERATORS.some(operator => operator.toLowerCase() === character.toLowerCase());
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isArithmeticExpresionOperator = (character: string): boolean => {
    const retVal = ARITHMETIC_EXPRESION_OPERATORS.some(operator => operator.toLowerCase() === character.toLowerCase());
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isRelationalExpresionOperator = (character: string): boolean => {
    const retVal = RELACTIONAL_EXPRESION_OPERATORS.some(operator => operator.toLowerCase() === character.toLowerCase());
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isBooleanExpresionOperator = (character: string): boolean => {
    const retVal = BOOLEAN_EXPRESION_OPERATORS.some(operator => operator.toLowerCase() === character.toLowerCase());
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isIndirection = (character: string): boolean => {
    const retVal = INDIRECTION_SYMBOLS.some(indirection => indirection.toLowerCase() === character.toLowerCase());
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
export const isBaseAddressSymbol = (character: string): boolean => {
    const retVal = BASE_ADDRESS_SYMBOLS.some(indirection => indirection.toLowerCase() === character.toLowerCase());
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
export const isGlobalContext = (context: string): boolean => {
    const retVal = (context === "Global");
    log.write('DEBUG', `returned "${retVal}" for character ${context}, at ${cursor}`)
    return retVal;
}
export const isLocalContext = (context: string): boolean => {
    const retVal = (context === "Local");
    log.write('DEBUG', `returned "${retVal}" for character ${context}, at ${cursor}`)
    return retVal;
}
export const isSubLocalContext = (context: string): boolean => {
    const retVal = (context === "Sublocal");
    log.write('DEBUG', `returned "${retVal}" for character ${context}, at ${cursor}`)
    return retVal;
}
export const isReadOnlyArray = (value: string): boolean => {
    const retVal = (value === "'P'");
    log.write('DEBUG', `returned "${retVal}" for character ${value}, at ${cursor}`)
    return retVal;
}

export const isOperator = (character: string): boolean => {
    const retVal = (isDelimiter(character) ||
        isAssigmentOperator(character) ||
        isMoveOperator(character) ||
        isLabelCaseOperator(character) ||
        isRemoveIndirectionOperator(character) ||
        isRepetitionOperator(character) ||
        isTemplateStructureOperator(character) ||
        isFixedParamTypeOperator(character) ||
        isDereferencingOperator(character) ||
        isBitFieldOperator(character) ||
        isBitShilfOperator(character) ||
        isArithmeticExpresionOperator(character) ||
        isRelationalExpresionOperator(character) ||
        isBooleanExpresionOperator(character)
    );
    log.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`)
    return retVal;
}
export const isSpecialCharacter = (input: string): number => {
    const symbols = [
        '\r\n',
        ...INDIRECTION_SYMBOLS,
        ...BASE_ADDRESS_SYMBOLS,
        ...DELIMITER_SYMBOLS,
        ...ASSIGMENT_OPERATORS,
        ...MOVE_OPERATORS,
        ...LABEL_CASE_OPERATORS,
        ...REMOVE_INDIRECTION_OPERATOR,
        ...REPETITION_OPERATOR,
        ...TEMPLATE_STRUCTURE_OPERATOR,
        ...FIXED_PARAM_TYPE_OPERATOR,
        ...BIT_SHIFT_OPERATORS,
        ...ARITHMETIC_EXPRESION_OPERATORS,
        ...RELACTIONAL_EXPRESION_OPERATORS,
        ...BOOLEAN_EXPRESION_OPERATORS
    ];

    // Sort symbols by length in descending order (longest match first)
    symbols.sort((a, b) => b.length - a.length);

    for (let symbol of symbols) {
        if (input.toLowerCase().startsWith(symbol.toLowerCase(), cursor)) {
            log.write('DEBUG', `returned "${symbol.length}" for character ${symbol}, at ${cursor}`)
            return symbol.length;
        }
    }
    log.write('DEBUG', `returned "${0}"}, at ${cursor}`)
    return 0;
}


function skipTokens(tokens: Token[], index: number, numberToSkip: number): { token: Token | null, index: number } {
    if (index < tokens.length) {
        return { token: tokens[index], index: index + numberToSkip };
    }
    return { token: null, index };  // No more tokens left
}

function getNextToken(tokens: Token[], index: number): { token: Token | null, index: number } {
    if (index < tokens.length) {
        return { token: tokens[index], index: index + 1 };
    }
    return { token: null, index };  // No more tokens left
}



export type Token = {
    type: string;  // e.g., 'Keyword', 'Name', 'String', etc.
    value: string; // The token value (text)
    line: number;  // The line where the token is located
    startCharacter: number;  // The start character of the token in the line
    endCharacter: number;    // The end character of the token in the line
};