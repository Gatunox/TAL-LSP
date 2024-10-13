"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBooleanExpresionOperator = exports.isRelationalExpresionOperator = exports.isArithmeticExpresionOperator = exports.isBitShilfOperator = exports.isBitFieldOperator = exports.isDereferencingOperator = exports.isFixedParamTypeOperator = exports.isTemplateStructureOperator = exports.isRepetitionOperator = exports.isRemoveIndirectionOperator = exports.isLabelCaseOperator = exports.isMoveOperator = exports.isAssigmentOperator = exports.isDelimiter = exports.isDataType = exports.isKeyword = exports.isQuote = exports.isParenthesis = exports.isSquareBrackets = exports.isAngleBrackets = exports.isComment = exports.isClosingBit = exports.isOpeneningBit = exports.isClosingIndex = exports.isOpeneningIndex = exports.isClosingParenthesis = exports.isOpeneningParenthesis = exports.isSingleLineComment = exports.isClosingComment = exports.isOpeneningComment = exports.isStandarFucntions = exports.isSimpleCompilerDirective = exports.isCompilerDirective = exports.isCompilerDirectiveLine = exports.isNumber = exports.isWhitespace = exports.isLetter = exports.isNewLine = exports.peekCharacters = exports.peekCharacterAt = exports.peekCharacter = exports.getLastValue = exports.getLastType = exports.getLastElement = exports.getCharacters = exports.getCharacter = exports.skipCharacters = exports.moveCursor = exports.resetCursor = exports.getCursor = void 0;
exports.isSpecialCharacter = exports.isOperator = exports.isIndirection = void 0;
const log_1 = require("./log");
const LETTER = /[a-zA-Z_^]/;
const WHITESPACE = /[ \t]+/; // Matches spaces and tabs
const NUMBER = /^[0-9]+$/;
const LINECOMMENT = /^--$/;
const CRLF = /\r\n/;
const DIRECTIVE = /\?/;
/*********************************************************************************************************************************/
/************************************************************  SYMBOLS  *********************************************************/
/*********************************************************************************************************************************/
const INDIRECTION_SYMBOLS = [".", ".EXT ", ".SG ",];
const BASE_ADDRESS_SYMBOLS = ["'P'", "'G'", "'L'", "'P'", "'S'", "'SG'",];
const DELIMITER_SYMBOLS = ["!", "--", ",", ";", ".", "<", ">", ":", "(", ")", "[", "]", "->", "\"", "=", "#", "'", "$", "?"];
const NUMERIC_BASE_SYMBOLS = ["%", "%B", "%H",];
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
];
/*********************************************************************************************************************************/
/********************************************************** DATA TYPES  **********************************************************/
/*********************************************************************************************************************************/
const DATA_TYPES = ["STRING",
    "INT",
    "FIXED",
    "REAL",
    "UNSIGNED",
];
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
];
/* TODO */
/* Check to see how to address the + and - Unary operators */
let cursor = 0;
const getCursor = function getCursor() {
    return cursor;
};
exports.getCursor = getCursor;
const resetCursor = () => {
    cursor = 0;
};
exports.resetCursor = resetCursor;
const moveCursor = (length) => {
    cursor += length;
};
exports.moveCursor = moveCursor;
const skipCharacters = (input, numberOfCharacter) => {
    do {
        (0, exports.getCharacter)(input);
    } while (numberOfCharacter-- > 0);
};
exports.skipCharacters = skipCharacters;
const getCharacter = (input) => {
    if (!((0, exports.getCursor)() < input.length))
        return "";
    const character = input[cursor];
    log_1.default.write('DEBUG', `returned "${character}" at ${cursor}.`);
    cursor++;
    return character;
};
exports.getCharacter = getCharacter;
const getCharacters = (input, numberOfCharacter) => {
    if (!((0, exports.getCursor)() + numberOfCharacter < input.length))
        return "";
    const characters = input.substring(cursor, cursor + numberOfCharacter);
    log_1.default.write('DEBUG', `returned "${characters}", (${characters.length}), at ${cursor}, for ${numberOfCharacter}.`);
    cursor += numberOfCharacter;
    return characters;
};
exports.getCharacters = getCharacters;
const getLastElement = (arr) => {
    if (arr.length === 0) {
        return undefined;
    }
    return arr[arr.length - 1];
};
exports.getLastElement = getLastElement;
const getLastType = (arr) => {
    const token = (0, exports.getLastElement)(arr);
    log_1.default.write('DEBUG', `returned ${token.type}.`);
    if (token) {
        return token.type;
    }
    else {
        return "";
    }
};
exports.getLastType = getLastType;
const getLastValue = (arr) => {
    const token = (0, exports.getLastElement)(arr);
    log_1.default.write('DEBUG', `returned ${token.value}.`);
    if (token) {
        return token.value;
    }
    else {
        return "";
    }
};
exports.getLastValue = getLastValue;
const peekCharacter = (input) => {
    if (!((0, exports.getCursor)() < input.length))
        return "";
    const character = input[cursor];
    log_1.default.write('DEBUG', `returned "${character}" at ${cursor}.`);
    return character;
};
exports.peekCharacter = peekCharacter;
const peekCharacterAt = (input, offsetCursor = 0) => {
    if (!((0, exports.getCursor)() < input.length))
        return "";
    let tempCursor = cursor + offsetCursor;
    const character = input.substring(tempCursor, tempCursor + 1);
    log_1.default.write('DEBUG', `returned "${character}" at ${tempCursor}.`);
    return character;
};
exports.peekCharacterAt = peekCharacterAt;
const peekCharacters = (input, numberOfCharacter) => {
    if (!((0, exports.getCursor)() + numberOfCharacter < input.length))
        return "";
    const characters = input.substring(cursor, cursor + numberOfCharacter);
    log_1.default.write('DEBUG', `returned "${characters}", (${characters.length}), at ${cursor}, for ${numberOfCharacter}.`);
    return characters;
};
exports.peekCharacters = peekCharacters;
const isNewLine = (text) => {
    log_1.default.write('DEBUG', `text = ${text}, at ${cursor}`);
    const retVal = CRLF.test(text);
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${text}, at ${cursor}`);
    return retVal;
};
exports.isNewLine = isNewLine;
const isLetter = (character) => {
    const retVal = LETTER.test(character);
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isLetter = isLetter;
const isWhitespace = (character) => {
    const retVal = WHITESPACE.test(character);
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isWhitespace = isWhitespace;
const isNumber = (character) => {
    const retVal = NUMBER.test(character);
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isNumber = isNumber;
const isCompilerDirectiveLine = (word) => {
    const retVal = DIRECTIVE.test(word);
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${word}, at ${cursor}`);
    return retVal;
};
exports.isCompilerDirectiveLine = isCompilerDirectiveLine;
const isCompilerDirective = (word) => {
    const retVal = COMPILER_DIRECTIVES.some(keyword => keyword.toLowerCase() === word.toLowerCase());
    log_1.default.write('DEBUG', `returned "${retVal}" for word ${word}, at ${cursor}`);
    return retVal;
};
exports.isCompilerDirective = isCompilerDirective;
const isSimpleCompilerDirective = (word) => {
    const retVal = SIMPLE_COMPILER_DIRECTIVES.some(keyword => keyword.toLowerCase() === word.toLowerCase());
    log_1.default.write('DEBUG', `returned "${retVal}" for word ${word}, at ${cursor}`);
    return retVal;
};
exports.isSimpleCompilerDirective = isSimpleCompilerDirective;
const isStandarFucntions = (word) => {
    const retVal = STANDARD_FUNCTIONS.some(keyword => keyword.toLowerCase() === word.toLowerCase());
    log_1.default.write('DEBUG', `returned "${retVal}" for word ${word}, at ${cursor}`);
    return retVal;
};
exports.isStandarFucntions = isStandarFucntions;
const isOpeneningComment = (character) => {
    const retVal = (character === "!");
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isOpeneningComment = isOpeneningComment;
const isClosingComment = (character) => {
    const retVal = (character === "!");
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isClosingComment = isClosingComment;
const isSingleLineComment = (character) => {
    const retVal = LINECOMMENT.test(character);
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isSingleLineComment = isSingleLineComment;
const isOpeneningParenthesis = (character) => {
    const retVal = (character === "(");
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isOpeneningParenthesis = isOpeneningParenthesis;
const isClosingParenthesis = (character) => {
    const retVal = (character === ")");
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isClosingParenthesis = isClosingParenthesis;
const isOpeneningIndex = (character) => {
    const retVal = (character === "[");
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isOpeneningIndex = isOpeneningIndex;
const isClosingIndex = (character) => {
    const retVal = (character === "]");
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isClosingIndex = isClosingIndex;
const isOpeneningBit = (character) => {
    const retVal = (character === "<");
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isOpeneningBit = isOpeneningBit;
const isClosingBit = (character) => {
    const retVal = (character === ">");
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isClosingBit = isClosingBit;
const isComment = (character) => {
    const retVal = (0, exports.isOpeneningComment)(character) || (0, exports.isClosingComment)(character);
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isComment = isComment;
const isAngleBrackets = (character) => {
    const retVal = (0, exports.isOpeneningBit)(character) || (0, exports.isClosingBit)(character);
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isAngleBrackets = isAngleBrackets;
const isSquareBrackets = (character) => {
    const retVal = (0, exports.isOpeneningIndex)(character) || (0, exports.isClosingIndex)(character);
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isSquareBrackets = isSquareBrackets;
const isParenthesis = (character) => {
    const retVal = (0, exports.isOpeneningParenthesis)(character) || (0, exports.isClosingParenthesis)(character);
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isParenthesis = isParenthesis;
const isQuote = (character) => {
    const retVal = (character === '"');
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isQuote = isQuote;
const isKeyword = (word) => {
    const retVal = KEYWORDS.some(keyword => keyword.toLowerCase() === word.toLowerCase());
    log_1.default.write('DEBUG', `returned "${retVal}" for word ${word}, at ${cursor}`);
    return retVal;
};
exports.isKeyword = isKeyword;
const isDataType = (word) => {
    const retVal = DATA_TYPES.some(dataType => dataType.toLowerCase() === word.toLowerCase());
    log_1.default.write('DEBUG', `returned "${retVal}" for word ${word}, at ${cursor}`);
    return retVal;
};
exports.isDataType = isDataType;
const isDelimiter = (character) => {
    const retVal = DELIMITER_SYMBOLS.some(delimiter => delimiter.toLowerCase() === character.toLowerCase());
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isDelimiter = isDelimiter;
const isAssigmentOperator = (character) => {
    const retVal = ASSIGMENT_OPERATORS.some(operator => operator.toLowerCase() === character.toLowerCase());
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isAssigmentOperator = isAssigmentOperator;
const isMoveOperator = (character) => {
    const retVal = MOVE_OPERATORS.some(operator => operator.toLowerCase() === character.toLowerCase());
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isMoveOperator = isMoveOperator;
const isLabelCaseOperator = (character) => {
    const retVal = LABEL_CASE_OPERATORS.some(operator => operator.toLowerCase() === character.toLowerCase());
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isLabelCaseOperator = isLabelCaseOperator;
const isRemoveIndirectionOperator = (character) => {
    const retVal = REMOVE_INDIRECTION_OPERATOR.some(operator => operator.toLowerCase() === character.toLowerCase());
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isRemoveIndirectionOperator = isRemoveIndirectionOperator;
const isRepetitionOperator = (character) => {
    const retVal = REPETITION_OPERATOR.some(operator => operator.toLowerCase() === character.toLowerCase());
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isRepetitionOperator = isRepetitionOperator;
const isTemplateStructureOperator = (character) => {
    const retVal = TEMPLATE_STRUCTURE_OPERATOR.some(operator => operator.toLowerCase() === character.toLowerCase());
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isTemplateStructureOperator = isTemplateStructureOperator;
const isFixedParamTypeOperator = (character) => {
    const retVal = FIXED_PARAM_TYPE_OPERATOR.some(operator => operator.toLowerCase() === character.toLowerCase());
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isFixedParamTypeOperator = isFixedParamTypeOperator;
const isDereferencingOperator = (character) => {
    const retVal = DEREFERECING_OPERATOR.some(operator => operator.toLowerCase() === character.toLowerCase());
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isDereferencingOperator = isDereferencingOperator;
const isBitFieldOperator = (character) => {
    const retVal = BIT_FIELD_OPERATOR.some(operator => operator.toLowerCase() === character.toLowerCase());
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isBitFieldOperator = isBitFieldOperator;
const isBitShilfOperator = (character) => {
    const retVal = BIT_SHIFT_OPERATORS.some(operator => operator.toLowerCase() === character.toLowerCase());
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isBitShilfOperator = isBitShilfOperator;
const isArithmeticExpresionOperator = (character) => {
    const retVal = ARITHMETIC_EXPRESION_OPERATORS.some(operator => operator.toLowerCase() === character.toLowerCase());
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isArithmeticExpresionOperator = isArithmeticExpresionOperator;
const isRelationalExpresionOperator = (character) => {
    const retVal = RELACTIONAL_EXPRESION_OPERATORS.some(operator => operator.toLowerCase() === character.toLowerCase());
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isRelationalExpresionOperator = isRelationalExpresionOperator;
const isBooleanExpresionOperator = (character) => {
    const retVal = BOOLEAN_EXPRESION_OPERATORS.some(operator => operator.toLowerCase() === character.toLowerCase());
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isBooleanExpresionOperator = isBooleanExpresionOperator;
const isIndirection = (character) => {
    const retVal = INDIRECTION_SYMBOLS.some(indirection => indirection.toLowerCase() === character.toLowerCase());
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isIndirection = isIndirection;
const isOperator = (character) => {
    const retVal = ((0, exports.isDelimiter)(character) ||
        (0, exports.isAssigmentOperator)(character) ||
        (0, exports.isMoveOperator)(character) ||
        (0, exports.isLabelCaseOperator)(character) ||
        (0, exports.isRemoveIndirectionOperator)(character) ||
        (0, exports.isRepetitionOperator)(character) ||
        (0, exports.isTemplateStructureOperator)(character) ||
        (0, exports.isFixedParamTypeOperator)(character) ||
        (0, exports.isDereferencingOperator)(character) ||
        (0, exports.isBitFieldOperator)(character) ||
        (0, exports.isBitShilfOperator)(character) ||
        (0, exports.isArithmeticExpresionOperator)(character) ||
        (0, exports.isRelationalExpresionOperator)(character) ||
        (0, exports.isBooleanExpresionOperator)(character));
    log_1.default.write('DEBUG', `returned "${retVal}" for character ${character}, at ${cursor}`);
    return retVal;
};
exports.isOperator = isOperator;
const isSpecialCharacter = (input) => {
    const symbols = [
        '\r\n',
        ...INDIRECTION_SYMBOLS,
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
            return symbol.length;
        }
    }
    return 0;
};
exports.isSpecialCharacter = isSpecialCharacter;
function skipTokens(tokens, index, numberToSkip) {
    if (index < tokens.length) {
        return { token: tokens[index], index: index + numberToSkip };
    }
    return { token: null, index }; // No more tokens left
}
function getNextToken(tokens, index) {
    if (index < tokens.length) {
        return { token: tokens[index], index: index + 1 };
    }
    return { token: null, index }; // No more tokens left
}
//# sourceMappingURL=helper.js.map