"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log_1 = require("./log");
const LETTER = /[a-zA-Z_^]/;
const WHITESPACE = /\s+/;
const NUMBER = /^[0-9]+$/;
const LINECOMMENT = /^--$/;
const CRLF = /\r\n/;
const DIRECTIVE = /^\?$/;
/*********************************************************************************************************************************/
/************************************************************  SYMBOLS  *********************************************************/
/*********************************************************************************************************************************/
const INDIRECTION_SYMBOLS = [".",
    ".EXT",
    ".SG",
];
const BASE_ADDRESS_SYMBOLS = ["'P'",
    "'G'",
    "'L'",
    "'P'",
    "'S'",
    "'SG'",
];
const DELIMITER_SYMBOLS = ["'P'",
    "'G'",
    "'L'",
    "'P'",
    "'S'",
    "'SG'",
];
/*********************************************************************************************************************************/
/***********************************************************  OPERATORS  *********************************************************/
/*********************************************************************************************************************************/
const BITS_OPERATORS = ["<<",
    ">>",
    "'<<'",
    "'>>'"
];
const ASSIGMENT_OPERATORS = [":="];
const MOVE_OPERATORS = ["':='",
    "'=:'",
    "&"
];
const LABEL_CASE_OPERATORS = [".."];
const TEMPLATE_STRUCTURE_OPERATOR = ["(*)"];
const FIXED_PARAMETET_TYPE_OPERATOR = ["(*)"];
const ARITHMETIC_EXPRESION_OPERATORS = ["+",
    "-",
    "*",
    "/",
    "'*'",
    "'/'",
    "'\\'",
    "'+'",
    "'–'",
    "LOR",
    "LAND",
    "XOR"
];
const RELACTIONAL_EXPRESION_OPERATORS = ["<",
    "=",
    ">",
    "<=",
    ">=",
    "<>",
    "'<'",
    "'='",
    "'>'",
    "'<='",
    "'>='",
    "'<>'"
];
const COMPILER_DIRECTIVE = ["?"];
/*********************************************************************************************************************************/
/*********************************************************** DIRECTIVES **********************************************************/
/*********************************************************************************************************************************/
const DIRECTIVES = ["ABORT", "NOABORT", "ABSLIST", "NOABSLIST", "ASSERTION", "BEGINCOMPILATION",
    "CHECEK", "NOCHECK", "PUSHCHECK", "POPCHECK", "CODE", "NOCODE",
    "PUSHCODE", "POPCODE", "COLUMNS", "COMPACT", "NOCOMPACT", "CPU",
    "CROSSREF", "NOCROSSREF", "DATAPAGES", "DECS", "DEFEXPAND", "NODEFEXPAND",
    "PUSHDEFEXPAND", "POPDEFEXPAND", "DEFINETOG", "DEFINETOG", "ENV", "ERRORFILE",
    "ERRORS", "EXTENDSTACK", "EXTENDTALHEAP", "FIXUP", "NOFIXUP", "FMAP",
    "NOFMAP", "GMAP", "NOGMAP", "HEAP", "HIGHPIN", "HIGHREQUESTERS",
    "ICODE", "NOICODE", "PUSHICODE", "POPICODE", "IF", "IFNOT",
    "ENDIF", "INHIBITXX", "NOINHIBITXX", "INNERLIST", "NOINNERLIST", "PUSHINNERLIST",
    "POPINNERLIST", "INSPECT", "NOINSPECT", "INT32INDEX", "NOINT32INDEX", "PUSHINT32INDEX",
    "POPINT32INDEX", "LARGESTACK"
];
/*********************************************************************************************************************************/
/***********************************************************  KEYWORDS  **********************************************************/
/*********************************************************************************************************************************/
const KEYWORDS = ["AND", "DO", "FORWARD", "MAIN", "RETURN", "TO",
    "ASEERT", "DOWMTO", "GOTO", "NOT", "RSCAN", "UNSIGNED",
    "BEGIN", "DROP", "IF", "OF", "SCAN", "UNTIL",
    "BY", "ELSE", "INT", "OR", "STACK", "USE",
    "CALL", "END", "INTERRUPT", "OTHERWISE", "STORE", "VARIABLE",
    "CALLABLE", "ENTRY", "LABEL", "PRIV", "STRING", "WHILE",
    "CASE", "EXTERNAL", "LAND", "PROC", "STRUCT", "XOR",
    "CODE", "FIXED", "LITERAL", "REAL", "SUBPROC",
    "DEFINE", "FOR", "LOR", "RESIDENT", "THEN",
];
const DATA_TYPES = ["STRING",
    "INT", "INT(16)",
    "INT(32)",
    "FIXEX", "INT(64",
    "REAL", "REAL(32)",
    "REAL(64)",
    "UNSIGNED(n)",
];
/* TODO */
/* Check to see how to address the + and - Unary operators */
let cursor = 0;
const getCursor = () => cursor;
const resetCursor = () => {
    cursor = 0;
};
const skipCharacters = (input, numberOfCharacter) => {
    do {
        getCharacter(input);
    } while (numberOfCharacter-- > 0);
};
const getCharacter = (input) => {
    if (!(getCursor() < input.length))
        return "";
    const character = input[cursor];
    log_1.default.write('DEBUG', `returned "${character}" at ${cursor}.`);
    cursor++;
    return character;
};
const getCharacters = (input, numberOfCharacter) => {
    if (!(getCursor() + numberOfCharacter < input.length))
        return "";
    const characters = input.substring(cursor, cursor + numberOfCharacter);
    log_1.default.write('DEBUG', `returned "${characters}", (${characters.length}), at ${cursor}, for ${numberOfCharacter}.`);
    return characters;
};
const peekCharacter = (input) => {
    if (!(getCursor() < input.length))
        return "";
    const character = input[cursor];
    log_1.default.write('DEBUG', `returned "${character}" at ${cursor}.`);
    return character;
};
const peekCharacterAt = (input, offsetCursor = 0) => {
    if (!(getCursor() < input.length))
        return "";
    let tempCursor = cursor + offsetCursor;
    const character = input.substring(tempCursor, tempCursor + 1);
    log_1.default.write('DEBUG', `returned "${character}" at ${tempCursor}.`);
    return character;
};
const peekCharacters = (input, numberOfCharacter) => {
    if (!(getCursor() + numberOfCharacter < input.length))
        return "";
    const characters = input.substring(cursor, cursor + numberOfCharacter);
    log_1.default.write('DEBUG', `returned "${characters}", (${characters.length}), at ${cursor}, for ${numberOfCharacter}.`);
    return characters;
};
const isCRLF = (character) => {
    const retVal = CRLF.test(character);
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`);
    return retVal;
};
const isLetter = (character) => {
    const retVal = LETTER.test(character);
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`);
    return retVal;
};
const isWhitespace = (character) => {
    const retVal = WHITESPACE.test(character);
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`);
    return retVal;
};
const isNumber = (character) => {
    const retVal = NUMBER.test(character);
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`);
    return retVal;
};
const isCompilerDirective = (character) => {
    const retVal = COMPILER_DIRECTIVE.includes(character);
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`);
    return retVal;
};
const isOpeneningComment = (character) => {
    const retVal = (character === "!");
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`);
    return retVal;
};
const isClosingComment = (character) => {
    const retVal = (character === "!");
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`);
    return retVal;
};
const isSingleLineComment = (character) => {
    const retVal = LINECOMMENT.test(character);
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`);
    return retVal;
};
const isOpeneningParenthesis = (character) => {
    const retVal = (character === "(");
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`);
    return retVal;
};
const isClosingParenthesis = (character) => {
    const retVal = (character === ")");
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`);
    return retVal;
};
const isOpeneningIndex = (character) => {
    const retVal = (character === "[");
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`);
    return retVal;
};
const isClosingIndex = (character) => {
    const retVal = (character === "]");
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`);
    return retVal;
};
const isOpeneningBit = (character) => {
    const retVal = (character === "<");
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`);
    return retVal;
};
const isClosingBit = (character) => {
    const retVal = (character === ">");
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`);
    return retVal;
};
const isComment = (character) => {
    const retVal = isOpeneningComment(character) || isClosingComment(character);
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`);
    return retVal;
};
const isBitExtraction = (character) => {
    const retVal = isOpeneningBit(character) || isClosingBit(character);
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`);
    return retVal;
};
const isIndex = (character) => {
    const retVal = isOpeneningIndex(character) || isClosingIndex(character);
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`);
    return retVal;
};
const isParenthesis = (character) => {
    const retVal = isOpeneningParenthesis(character) || isClosingParenthesis(character);
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`);
    return retVal;
};
const isQuote = (character) => {
    const retVal = (character === '"');
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`);
    return retVal;
};
const isKeyword = (word) => {
    const retVal = KEYWORDS.includes(word);
    log_1.default.write('DEBUG', `returned "${retVal}" for word ${word} , at ${cursor}`);
    return retVal;
};
const isOperator = (character) => {
    const retVal = false;
    /*const retVal =  (ARITHMETIC_OPERATORS.includes(character) ||
                     COMPARISON_OPERATORS.includes(character) ||
                     ADDRES_OPERATORS.includes (character) ||
                     BITS_OPERATORS.includes (character));
                     */
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`);
    return retVal;
};
exports.default = {
    getCharacter,
    getCharacters,
    getCursor,
    isComment,
    isClosingParenthesis,
    isCRLF,
    isCompilerDirective,
    isIndex,
    isKeyword,
    isLetter,
    isNumber,
    isOperator,
    isOpeneningParenthesis,
    isParenthesis,
    isSingleLineComment,
    isQuote,
    isWhitespace,
    isBitExtraction,
    peekCharacter,
    peekCharacterAt,
    peekCharacters,
    resetCursor,
    skipCharacters,
};
//# sourceMappingURL=helper.js.map